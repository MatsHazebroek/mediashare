import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        following: z.boolean().optional(),
        user: z.string().cuid2().optional(),
        page: z.number().min(0).optional(),
        howMany: z.number().min(1).max(50).default(25),
      })
    )
    .query(async ({ ctx, input }) => {
      // get all posts of a specific user
      if (input.user) {
        return await ctx.prisma.post.findMany({
          orderBy: { createdAt: "desc" },
          select: {
            _count: { select: { Like: true } },
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
            userId: input.user,
            User: {
              status: "ACTIVE",
            },
          },
          take: input.howMany,
          skip: input.page ? input.page * input.howMany : 0,
        });
      }

      // get all posts of the users that the current user is following
      if (input.following && ctx.session) {
        return await ctx.prisma.post.findMany({
          orderBy: { createdAt: "desc" },
          select: {
            _count: { select: { Like: true } },
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
      }
      // TODO: recommend posts based on user the followers that the user is following
      // user is not logged in, get recent posts
      return await ctx.prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          _count: { select: { Like: true } },
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
            _count: { select: { Like: true } },
            id: true,
            text: true,
            image: true,
            createdAt: true,
            updatedAt: true,
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
      const post = await ctx.prisma.post
        .findUniqueOrThrow({
          where: {
            id: input.post,
          },
        })
        .catch(() => {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Post not found",
          });
        });
      if (post.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Post not found",
        });
      }
      // check if post is ebitable (based on env variable)
      if (env.HOW_LONG_ARE_POSTS_EDITABLE) {
        const howLongEditable = new Date();
        howLongEditable.setMinutes(
          howLongEditable.getMinutes() + env.HOW_LONG_ARE_POSTS_EDITABLE
        );
        if (post.createdAt > howLongEditable) {
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
