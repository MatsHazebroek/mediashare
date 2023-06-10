import { api } from "~/utils/api";
import Image from "next/image";
import { timeSince } from "./formatTime";
import { UserIcon } from "./userIcon";

import Link from "next/link";
import { toast } from "react-hot-toast";
import Auth from "../auth";
import Like from "./likesCount";
import Comments from "./commentModal";
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
      if (data) toast.success("Geliked", { id: "likeToast" });
      if (!data) toast.success("Unliked", { id: "likeToast" });
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

  if (posts.isLoading)
    return (
      <>
        <div className="mt-10 flex justify-center">
          <svg
            aria-hidden="true"
            className="mr-2 h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      </>
    );
  if (posts.isError) return <div>Error: {posts.error.message}</div>;

  return (
    <div className="m-2 bg-white">
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

              <Comments
                postId={post.id}
                howManyComments={post._count.Comment}
              />

              {session?.user.role === "ADMIN" ? (
                <div className="mt-1 flex gap-1">
                  <button
                    className="flex items-center justify-center focus:outline-none"
                    title="Delete"
                  >
                    <DeleteModal
                      onClick={() => {
                        submitDelete(post.id);
                      }}
                    />
                  </button>
                </div>
              ) : (
                <></>
              )}
            </div>
          </Auth>
        </div>
      ))}
    </div>
  );
};
