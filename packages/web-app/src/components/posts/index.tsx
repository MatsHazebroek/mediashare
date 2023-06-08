import { api } from "~/utils/api";
import Image from "next/image";
import { timeSince } from "./formatTime";
import { UserIcon } from "./userIcon";

import Link from "next/link";
import { toast } from "react-hot-toast";
import Auth from "../auth";
import Like from "./likes";
import Comments from "./comments";
import { useSession } from "next-auth/react";
import DeleteModal from "./deleteModal";

type props = {
  user?: {
    id: string;
    type: "tweets" | "media" | "likes";
  };
  yourFollwing?: boolean;
  mainPostId?: string;
};

export const Posts = (props: props) => {
  const { data: session } = useSession();
  const posts = api.posts.getAll.useQuery({
    page: 0,
    howMany: 10,
    user: props.user,
    following: props.yourFollwing,
    postId: props.mainPostId,
  });

  const postLikes = api.posts.like.useMutation({
    onSuccess: (data) => {
      if (data) toast.success("Geliked", { id: "goijwregoij" });
      if (!data) toast.success("Unliked", { id: "goijwregoij" });
    },
  });

  const submit = (postId: string) => {
    postLikes.mutate({ post: postId });
  };

  const deletePost = api.posts.delete.useMutation({
    onSuccess: (data) => {
      if (data) toast.success("Verwijderd");
    },
  });

  const submitDelete = (postId: string) => {
    deletePost.mutate({ post: postId });
  };
  if (posts.isLoading) return <div>Loading...</div>;
  if (posts.isError) return <div>Error: {posts.error.message}</div>;
  return (
    <>
      {posts.data.map((post) => (
        <div
          key={post.id + "post"}
          className="mb-3 rounded border border-gray-200 p-4 shadow-md transition-colors duration-300 hover:bg-gray-200"
        >
          <Link href={"/comment/" + post.id} className="cursor-pointer">
            <div className="mb-4 flex flex-row text-gray-600">
              {typeof post.User.image == "string" ? (
                <UserIcon
                  User={{
                    followers: post.User._count.followers || 0,
                    following: post.User._count.following || 0,
                    username: post.User.name ?? "",
                    description: post.User.description ?? "",
                    id: post.User.id,
                    image: post.User.image,
                  }}
                  height={40}
                  width={40}
                />
              ) : null}
              <span className="ml-2 text-blue-500">
                <Link href={"/profile/" + (post.User.name || "")}>
                  @{post.User.name}
                </Link>
              </span>
              <span className="ml-2 text-gray-400">
                • Geplaatst {timeSince(post.createdAt)}{" "}
                {post.updatedAt.toString() !== post.createdAt.toString()
                  ? "• Aangepast " + timeSince(post.updatedAt)
                  : ""}
              </span>
            </div>
            <p className="mb-2">{post.text}</p>
            {typeof post.image == "string" ? (
              <Image
                src={post.image}
                height={200}
                width={200}
                alt={"Foto"}
              ></Image>
            ) : null}
          </Link>
          <Auth>
            <div className="flex gap-3">
              <Like
                isLiked={post.Like.length > 0}
                onClick={() => {
                  submit(post.id);
                }}
                howManyLikes={post._count.Like}
              />
              {/* Verder af maken */}
              <Comments hasCommented />
              {session?.user.role === "ADMIN" ? (
                <>
                  <DeleteModal
                    onClick={() => {
                      submitDelete(post.id);
                    }}
                  />
                </>
              ) : (
                <></>
              )}
            </div>
          </Auth>
        </div>
      ))}
    </>
  );
};
