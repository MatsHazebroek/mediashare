import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
  completeRegistration: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(30),
        description: z.string().max(160).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const searchUsername = await ctx.prisma.user.findUnique({
        where: { username: input.username },
      });
      if (searchUsername) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already taken",
        });
      }
      return await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.username,
          username: input.username,
          description: input.description,
          status: "ACTIVE",
        },
        select: {
          id: true,
          username: true,
          description: true,
        },
      });
    }),
  get: publicProcedure
    .input(z.string().cuid2())
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.user
        .findFirstOrThrow({
          where: {
            id: input,
          },
          select: {
            createdAt: true,
            id: true,
            username: true,
            description: true,
            image: true,
            status: true,
            _count: {
              select: {
                followers: true,
                following: true,
                posts: true,
              },
            },
          },
        })
        .then((user) => {
          if (user.status !== "ACTIVE")
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found",
            });
          return { ...user, status: undefined };
        })
        .catch(() => {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        });
    }),
});
