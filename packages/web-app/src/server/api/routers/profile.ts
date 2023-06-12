import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProceduresWithRoles,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
  completeRegistration: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(50),
        description: z.string().max(160).optional(),
        link: z.string().url().optional(),
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
  get: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return await ctx.prisma.user
      .findFirstOrThrow({
        where: {
          username: input,
        },
        select: {
          createdAt: true,
          id: true,
          username: true,
          description: true,
          image: true,
          status: true,
          followers: {
            where: {
              userId: ctx.session?.user?.id,
            },
          },
          banner: true,
          link: true,
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
  follow: protectedProcedure
    .input(z.string().cuid2())
    .mutation(async ({ ctx, input }) => {
      const isFollowing = await ctx.prisma.following.findFirst({
        where: {
          followingId: input,
          userId: ctx.session?.user?.id,
        },
      });
      if (isFollowing) {
        return await ctx.prisma.following
          .delete({
            where: {
              id: isFollowing.id,
            },
          })
          .then(() => false);
      }
      return await ctx.prisma.user
        .update({
          where: { id: ctx.session?.user?.id },
          data: {
            following: {
              create: {
                followingId: input,
              },
            },
          },
        })
        .then(() => true);
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
  update: protectedProcedure
    .input(
      z.object({
        user: z.string().cuid2().optional(),
        username: z.string().min(3).max(50).optional(),
        description: z.string().max(160).optional(),
        link: z.string().url().max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      if (
        input.user &&
        ctx.session?.user.id !== input.user &&
        ctx.session.user.role !== "ADMIN"
      )
        throw new TRPCError({ code: "UNAUTHORIZED" });
        // link only https allowed
        if(input.link) {
          if(!input.link.startsWith("https://")) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Only https links allowed",
            });
          }
        }
      // check if there is already a user with this username
      if (input.username) {
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
      }

      return await ctx.prisma.user.update({
        where: {
          id: input.user || ctx.session?.user?.id,
        },
        data: {
          username: input.username,
          description: input.description,
          link: input.link,
        },
        select: {
          username: true,
          description: true,
          link: true,
        },
      });
    }),
});
