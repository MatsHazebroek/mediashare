import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { userPostsHandler } from "./handlers/userPosts";

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
        page: z.number().min(0).optional(),
        howMany: z.number().min(1).max(50).default(25),
        /** Get the comments of the post */
        postId: z.string().cuid2().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // get the comments of a specific post
      if (input.postId)
        return await ctx.prisma.comment
          .findMany({
            where: {
              main: { User: { status: "ACTIVE" }, id: input.postId },
              reply: { User: { status: "ACTIVE" } },
            },
            select: {
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
                      name: true,
                      id: true,
                      status: true,
                      image: true,
                      description: true,
                    },
                  },
                },
              },
            },
          })
          .then((comments) => comments.map((comment) => comment.reply));

      // get all posts of a specific user
      if (input.user)
        return await userPostsHandler(
          { howMany: input.howMany, page: input.page || 0 },
          input.user.id,
          input.user.type,
          ctx
        );

      // get all posts of the users that the current user is following
      if (input.following && ctx.session)
        return await ctx.prisma.post.findMany({
          orderBy: { createdAt: "desc" },
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
                id: true,
                _count: { select: { followers: true, following: true } },
                description: true,
                name: true,
                image: true,
              },
            },
          },
          where: {
            User: {
              following: {
                some: {
                  id: ctx.session.user.id,
                },
              },
              status: "ACTIVE",
            },
          },
          take: input.howMany,
          skip: input.page ? input.page * input.howMany : 0,
        });

      // TODO: recommend posts based on user the followers that the user is following
      // user is not logged in, get recent posts
      return await ctx.prisma.post.findMany({
        orderBy: { createdAt: "desc" },
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
              id: true,
              _count: { select: { followers: true, following: true } },
              description: true,
              name: true,
              image: true,
            },
          },
        },
        where: {
          User: {
            status: "ACTIVE",
          },
        },
        take: input.howMany,
        skip: input.page ? input.page * input.howMany : 0,
      });
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
            User: {
              select: {
                _count: { select: { followers: true, following: true } },
                name: true,
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
      await ctx.prisma.post
        .findFirstOrThrow({
          where: { id: input.post, userId: ctx.session.user.id },
        })
        .catch(() => {
          if (ctx.session.user.role !== "ADMIN")
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Post not found",
            });
        });
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
      return await ctx.prisma.comment
        .create({
          data: {
            mainId: input.post,
            replyId: post.id,
          },
        })
        .then(() => {
          return true;
        })
        .catch(() => {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Post not found",
          });
        });
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
        return true;
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
