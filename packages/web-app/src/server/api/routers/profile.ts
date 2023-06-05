import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProceduresWithRoles,
  publicProcedure,
} from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
  completeRegistration: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(30),
        description: z.string().max(160).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // check if user is logged in
      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      // check if there is already a user with this username
      const searchUsername = await ctx.prisma.user.findUnique({
        where: { username: input.username },
      });
      // if there is a user with this username, throw an error
      if (searchUsername) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already taken",
        });
      }
      // complete registration
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
  ban: protectedProceduresWithRoles("ADMIN")
    .input(z.object({ user: z.string().cuid2() }))
    .mutation(
      async ({ ctx, input }) =>
        await ctx.prisma.user.update({
          where: { id: input.user },
          data: {
            status: "BANNED",
          },
        })
    ),
});
