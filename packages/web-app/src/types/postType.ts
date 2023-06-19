export type PostType = {
  _count: { Like: number; Comment: number };
  id: string;
  text: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  Like: { date: Date }[];
  ReplyingTo?: {
    commentId: string;
    username: string | null;
  };
  User: {
    id: string;
    username: string | null;
    _count: { followers: number; following: number };
    description: string | null;
    image: string | null;
  };
};
