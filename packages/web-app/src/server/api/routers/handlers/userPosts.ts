import type { Prisma, PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";

export const userPostsHandler = async (
  setting: {
    howMany: number;
    cursor: string | null | undefined;
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
        where: {
          userId: userId,
          user: { status: "ACTIVE", posts: { every: { status: "ACTIVE" } } },
        },
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
                  username: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { date: "desc" },
        take: setting.howMany + 1,
        cursor: setting.cursor ? { id: setting.cursor } : undefined,
      })
      .then((data) => data.map((d) => d.post));

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
            username: true,
            image: true,
          },
        },
      },
      where: {
        userId: userId,
        image: { not: null },
        status: "ACTIVE",
        User: {
          status: "ACTIVE",
        },
      },
      take: setting.howMany + 1,
      cursor: setting.cursor ? { id: setting.cursor } : undefined,
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
          username: true,
          image: true,
        },
      },
    },
    where: {
      userId: userId,
      status: "ACTIVE",
      User: {
        status: "ACTIVE",
      },
    },
    take: setting.howMany + 1,
    cursor: setting.cursor ? { id: setting.cursor } : undefined,
  });
};
