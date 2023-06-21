import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
export const searchRouter = createTRPCRouter({
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(3).trim(),
        cursor: z.string().cuid2().nullish(),
        howMany: z.number().min(1).max(10).default(5),
        /** Get the comments of the post */
        postId: z.string().cuid2().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const query = input.query.split(" ");
      const users = query.flatMap((q) => {
        // If the query starts with @ or from:, it's a username
        if (!q.startsWith("@") && !q.startsWith("from:")) {
          return [];
        }
        const username = q.slice(q.startsWith("@") ? 1 : 5);
        if (username === "" || username === " ") return [];
        console.log;
        return username;
      });
      // remove from query the usernames
      query.splice(
        0,
        query.length,
        ...query.filter((q) => !q.startsWith("@") && !q.startsWith("from:"))
      );
      console.log("pap", users, query);
      const data = await ctx.prisma.post
        .findMany({
          cursor: input.cursor ? { id: input.cursor } : undefined,
          take: input.howMany + 1,
          where: {
            User: {
              status: "ACTIVE",
            },
            text: {
              contains: query.join(" "),
            },
            OR: users.map((u) => ({ User: { username: u } })),
          },
          select: {
            id: true,
            text: true,
            image: true,
            User: {
              select: {
                id: true,
                username: true,
                _count: { select: { followers: true, following: true } },
                description: true,
                image: true,
              },
            },
          },
        })
        .catch(() => {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        });
      if (data.length === 0)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Geen post gevonden",
        });
      let nextCursor: typeof input.cursor | undefined = undefined;
      if (data.length > input.howMany) {
        const nextItem = data.pop();
        nextCursor = nextItem?.id;
      }
      return {
        data,
        nextCursor,
      };
    }),
});
