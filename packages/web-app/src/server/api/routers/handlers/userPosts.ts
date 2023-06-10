import type { Prisma, PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";

export const userPostsHandler = async (
  setting: {
    howMany: number;
    page: number;
  },
  userId: string,
  type: "tweets" | "media" | "likes",
  ctx: {
    session: Session | null;
    prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >;
  }
) => {
  if (type === "likes")
    // get all posts of a specific user that the current user liked
    return await ctx.prisma.like
      .findMany({
        where: { userId: userId, user: { status: "ACTIVE" } },
        select: {
          post: {
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
          },
        },
        // format the data to be like the other queries
      })
      .then((data) => {
        return data.map((d) => d.post);
      });

  if (type === "media")
    // get all posts of a specific user that have an image (media)
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
        userId: userId,
        image: { not: null },
        User: {
          status: "ACTIVE",
        },
      },
      take: setting.howMany,
      skip: setting.page ? setting.page * setting.howMany : 0,
    });

  // get all posts of a specific user (tweets)
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
      userId: userId,
      User: {
        status: "ACTIVE",
      },
    },
    take: setting.howMany,
    skip: setting.page ? setting.page * setting.howMany : 0,
  });
};
