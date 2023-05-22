import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
      // TODO: recommend posts based on user's interests and oiher users' interests
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
});
