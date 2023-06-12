import type { Session } from "next-auth";

export const getAllPostsSelector = (ctx: { session: Session | null }) => ({
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
      username: true,
      _count: { select: { followers: true, following: true } },
      description: true,
      image: true,
    },
  },
});
