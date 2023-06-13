import { api } from "~/utils/api";
import Image from "next/image";
import { timeSince } from "./formatTime";
import { UserIcon } from "./userIcon";

import Link from "next/link";
import { toast } from "react-hot-toast";
import Auth from "../auth";
import Like from "./likesCount";
import Comments from "../form/commentModal";
import { useSession } from "next-auth/react";
import DeleteModal from "./deleteModal";
import { useEffect, useRef } from "react";
import { useIntersection } from "@mantine/hooks";
import Loading from "../loading";

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
  // get posts api
  const posts = api.posts.getAll.useInfiniteQuery(
    {
      howMany: 10,
      user: props.user,
      following: props.yourFollwing,
      postId: props.mainPostId,
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  // like post api
  const postLikes = api.posts.like.useMutation({
    onSuccess: (data) => {
      if (data) toast.success("Geliked", { id: "likeToast" });
      if (!data) toast.success("Unliked", { id: "likeToast" });
    },
  });
  // infinite scroll
  const lastPostRef = useRef<HTMLElement | null>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });
  useEffect(() => {
    if (entry?.isIntersecting) void posts.fetchNextPage();
  }, [entry]);
  // like post
  const submit = (postId: string) => {
    postLikes.mutate({ post: postId });
  };
  // delete post
  const deletePost = api.posts.delete.useMutation({
    onSuccess: (data) => {
      if (data) toast.success("Verwijderd");
    },
  });
  // confirm delete post
  const submitDelete = (postId: string) => {
    deletePost.mutate({ post: postId });
  };
  // loading
  if (posts.isLoading)
    return (
      <>
        <Loading />
      </>
    );
  // error
  if (posts.isError) return <div>Error: {posts.error.message}</div>;
  // pages to one array
  const _posts = posts.data.pages.flatMap((page) => page.data);

  return (
    <div className="m-2 bg-white">
      {_posts.map((post, i) => (
        <div
          ref={i === _posts.length - 1 ? ref : undefined}
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
                    username: post.User.username ?? "",
                    description: post.User.description ?? "",
                    id: post.User.id,
                    image: post.User.image,
                  }}
                  height={40}
                  width={40}
                />
              ) : null}
              <span className="ml-2 text-blue-500">
                <Link href={"/profile/" + (post.User.username || "")}>
                  @{post.User.username}
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
