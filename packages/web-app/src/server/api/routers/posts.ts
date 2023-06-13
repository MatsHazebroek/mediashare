import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { userPostsHandler } from "./handlers/userPosts";
import { utapi } from "uploadthing/server";
import { getAllPostsSelector } from "./selectors/getAllPosts";

export const postRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        following: z.boolean().optional(),
        user: z
          .object({
            id: z.string().cuid2(),
            type: z.enum(["tweets", "media", "likes"]),
          })
          .optional(),
        cursor: z.string().cuid2().nullish(),
        howMany: z.number().min(1).max(50).default(25),
        /** Get the comments of the post */
        postId: z.string().cuid2().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const returnSelect = getAllPostsSelector(ctx);
      let dataToReturn:
        | {
            _count: { Like: number; Comment: number };
            id: string;
            text: string;
            image: string | null;
            createdAt: Date;
            updatedAt: Date;
            Like: { date: Date }[];
            ReplyingTo?: {
              commentId: string;
              username: string | null;
            };
            User: {
              id: string;
              username: string | null;
              _count: { followers: number; following: number };
              description: string | null;
              image: string | null;
            };
          }[]
        | undefined = undefined;
      // get the comments of a specific post
      if (input.postId)
        dataToReturn = await ctx.prisma.comment
          .findMany({
            where: {
              main: { User: { status: "ACTIVE" }, id: input.postId },
              reply: { User: { status: "ACTIVE" } },
            },
            select: {
              // the username of the user that is being replied to
              main: {
                select: {
                  id: true,
                  User: {
                    select: {
                      username: true,
                    },
                  },
                },
              },
              // the comment that replies to the main comment
              reply: {
                select: {
                  _count: { select: { Like: true, Comment: true } },
                  id: true,
                  text: true,
                  image: true,
                  createdAt: true,
                  updatedAt: true,
                  Like: {
                    select: {
                      date: true,
                    },
                    where: {
                      userId: ctx.session?.user.id,
                    },
                  },
                  User: {
                    select: {
                      _count: { select: { followers: true, following: true } },
                      username: true,
                      id: true,
                      status: true,
                      image: true,
                      description: true,
                    },
                  },
                },
              },
            },
            take: input.howMany + 1,
            cursor: input.cursor ? { id: input.cursor } : undefined,
          })
          .then((comments) =>
            comments.map((comment) => ({
              ...comment.reply,
              ReplyingTo: {
                username: comment.main.User.username,
                commentId: comment.main.id,
              },
            }))
          );

      // get all posts of a specific user
      if (input.user)
        dataToReturn = await userPostsHandler(
          { howMany: input.howMany, cursor: input.cursor },
          input.user.id,
          input.user.type,
          ctx
        );

      // get all posts of the users that the current user is following
      if (input.following && ctx.session)
        dataToReturn = await ctx.prisma.post.findMany({
          orderBy: { createdAt: "desc" },
          select: returnSelect,
          where: {
            User: {
              followers: {
                some: {
                  userId: ctx.session.user.id,
                },
              },
              status: "ACTIVE",
            },
          },
          take: input.howMany + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
        });

      // TODO: recommend posts based on user the followers that the user is following
      // user is not logged in, get recent posts
      if (dataToReturn === undefined)
        dataToReturn = await ctx.prisma.post.findMany({
          orderBy: { createdAt: "desc" },
          select: returnSelect,
          where: {
            User: {
              status: "ACTIVE",
            },
          },
          take: input.howMany + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
        });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (dataToReturn.length > input.howMany) {
        const nextItem = dataToReturn.pop();
        nextCursor = nextItem?.id;
      }
      return {
        data: dataToReturn,
        nextCursor,
      };
    }),
  getOne: publicProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.post
        .findUniqueOrThrow({
          where: {
            id: input.id,
          },
          select: {
            _count: { select: { Like: true, Comment: true } },
            id: true,
            text: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            Like: {
              select: {
                date: true,
              },
              where: {
                userId: ctx.session?.user.id,
              },
            },
            Reply: {
              select: {
                main: {
                  select: {
                    id: true,
                    User: {
                      select: {
                        username: true,
                      },
                    },
                  },
                },
              },
            },
            User: {
              select: {
                _count: { select: { followers: true, following: true } },
                username: true,
                id: true,
                status: true,
                image: true,
              },
            },
          },
        })
        .then((post) => {
          if (post.User.status === "BANNED")
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Post not found",
            });
          return { ...post, User: { ...post.User, status: undefined } };
        });
    }),
  create: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.post.create({
        data: {
          text: input.text,
          userId: ctx.session.user.id,
        },
        select: {
          id: true,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(500),
        post: z.string().cuid2(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // check if post exists for the user (or if user is admin)
      const post = await ctx.prisma.post
        .findFirstOrThrow({
          where: {
            id: input.post,
            userId: ctx.session.user.id,
          },
        })
        .catch(() => {
          if (ctx.session?.user.role !== "ADMIN")
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Post not found",
            });
        });
      // check if post is ebitable (based on env variable)
      if (env.HOW_LONG_ARE_POSTS_EDITABLE) {
        const howLongEditable = new Date();
        howLongEditable.setMinutes(
          howLongEditable.getMinutes() + env.HOW_LONG_ARE_POSTS_EDITABLE
        );
        if (
          (!post || post.createdAt > howLongEditable) &&
          ctx.session?.user.role !== "ADMIN"
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Post no longer editable",
          });
        }
      }
      return await ctx.prisma.post.update({
        data: {
          text: input.text,
        },
        where: {
          id: input.post,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ post: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post
        .findFirstOrThrow({
          where: { id: input.post },
        })
        .then((post) => {
          if (
            ctx.session.user.role !== "ADMIN" &&
            post.userId !== ctx.session.user.id
          )
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Post not found",
            });
          return post;
        });
      if (post.image) {
        const url = new URL(post.image);
        const imageId = post.image.split("/")[post.image.split("/").length - 1];
        if (imageId && imageId.includes(".") && url.host == "uploadthing.com")
          utapi.deleteFiles(imageId).catch(console.log);
      }
      return await ctx.prisma.post.delete({
        where: {
          id: input.post,
        },
      });
    }),
  comment: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(500),
        post: z.string().cuid2(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.create({
        data: {
          text: input.text,
          userId: ctx.session.user.id,
        },
      });
      await ctx.prisma.comment.create({
        data: {
          mainId: input.post,
          replyId: post.id,
        },
      });
      return post;
    }),
  like: protectedProcedure
    .input(
      z.object({
        post: z.string().cuid2(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const alreadyLiked = await ctx.prisma.like.findFirst({
        where: {
          postId: input.post,
        },
      });
      // if already liked, unlike
      if (alreadyLiked) {
        await ctx.prisma.like
          .delete({
            where: {
              id: alreadyLiked.id,
            },
          })
          .catch(() => {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Post not found",
            });
          });
        return false;
      }
      // if not liked, like
      await ctx.prisma.like
        .create({
          data: {
            userId: ctx.session.user.id,
            postId: input.post,
          },
        })
        .catch(() => {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Post not found",
          });
        });
      return true;
    }),
});
