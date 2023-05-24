import { TRPCError } from "@trpc/server";
import { z } from "zod";

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
      })
    )
    .query(async ({ ctx, input }) => {
      // get all posts of a specific user
      if (input.user) {
        return await ctx.prisma.post.findMany({
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            text: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            Like: {
              select: {
                id: true,
              },
            },
            User: {
              select: {
                name: true,
              },
            },
          },
          where: {
            userId: input.user,
            User: {
              banned: false,
            },
          },
          take: 50,
          skip: input.page ? input.page * 50 : 0,
        });
      }

      // get all posts of the users that the current user is following
      if (input.following && ctx.session) {
        return await ctx.prisma.post.findMany({
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            text: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            Like: {
              select: {
                id: true,
              },
            },
            User: {
              select: {
                name: true,
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
              banned: false,
            },
          },
          take: 50,
          skip: input.page ? input.page * 50 : 0,
        });
      }
      // TODO: recommend posts based on user the followers that the user is following
      // user is not logged in, get recent posts
      return await ctx.prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          text: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          Like: {
            select: {
              id: true,
            },
          },
          User: {
            select: {
              name: true,
            },
          },
        },
        where: {
          User: {
            banned: false,
          },
        },
        take: 50,
        skip: input.page ? input.page * 50 : 0,
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
            id: true,
            text: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            User: {
              select: {
                name: true,
                banned: true,
              },
            },
            Like: {
              select: {
                id: true,
              },
            },
          },
        })
        .then((post) => {
          if (post.User.banned)
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Post not found",
            });
          return { ...post, Like: post.Like.length };
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
});