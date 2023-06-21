import type { Prisma, PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import type { PostType } from "~/types/postType";

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
): Promise<PostType[]> => {
  if (type === "likes")
    // get all posts of a specific user that the current user liked
    return (await ctx.prisma.like
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
              Comment: {
                select: {
                  main: {
                    select: {
                      id: true,
                      User: {
                        select: {
                          username: true,
                        },
                      },
                    },
                  },
                },
              },
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
      .then((data) =>
        data.map((d) => ({
          ...d.post,
          ReplyingTo: d.post.Comment[0]
            ? {
                username: d.post.Comment[0]?.main.User.username ?? null,
                commentId: d.post.Comment[0]?.main.id,
              }
            : undefined,
        }))
      )) satisfies PostType[];

  if (type === "media")
    // get all posts of a specific user that have an image (media)
    return (await ctx.prisma.post
      .findMany({
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
          Comment: {
            select: {
              main: {
                select: {
                  id: true,
                  User: {
                    select: {
                      username: true,
                    },
                  },
                },
              },
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
      })
      .then((posts) =>
        posts.map((post) => ({
          ...post,
          ReplyingTo: post.Comment[0]
            ? {
                username: post.Comment[0]?.main.User.username ?? null,
                commentId: post.Comment[0]?.main.id,
              }
            : undefined,
        }))
      )) satisfies PostType[];

  // get all posts of a specific user (tweets)
  return (await ctx.prisma.post
    .findMany({
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
        Comment: {
          select: {
            main: {
              select: {
                id: true,
                User: {
                  select: {
                    username: true,
                  },
                },
              },
            },
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
    })
    .then((posts) =>
      posts.map((post) => ({
        ...post,
        ReplyingTo: post.Comment[0]
          ? {
              username: post.Comment[0]?.main.User.username ?? null,
              commentId: post.Comment[0]?.main.id,
            }
          : undefined,
      }))
    )) satisfies PostType[];
};
