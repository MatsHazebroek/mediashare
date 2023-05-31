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
            _count: { select: { Like: true } },
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
          take: 50,
          skip: input.page ? input.page * 50 : 0,
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
                id: true,
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
          take: 50,
          skip: input.page ? input.page * 50 : 0,
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
              id: true,
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
});
