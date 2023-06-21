import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

import toast from "react-hot-toast";

import Like from "~/components/posts/likeButton";
import Comments from "~/components/form/commentModal";
import { UserIcon } from "~/components/posts/userIcon";
import { timeSince } from "~/components/posts/formatTime";
import DeleteModal from "~/components/posts/deleteModal";

import { api } from "~/utils/api";
import type { Post_Status } from "@prisma/client";
import { Lightbox } from "../lightbox";

type props = {
  post: {
    id: string;
    status: Post_Status;
    User: {
      status: undefined;
      image: string | null;
      _count: {
        following: number;
        followers: number;
      };
      id: string;
      username: string | null;
    };
    image: string | null;
    text: string;
    Like: {
      date: Date;
    }[];
    Reply: {
      main: {
        id: string;
        User: {
          username: string | null;
        };
      };
    }[];
    _count: {
      Like: number;
      Comment: number;
    };
    createdAt: Date;
    updatedAt: Date;
  };
};

export const MainPost = (props: props) => {
  const { data: session } = useSession();
  const postLikes = api.posts.like.useMutation({
    onSuccess: (data) => {
      if (data) toast.success("Geliked", { id: "likeToast" });
      if (!data) toast.success("Unliked", { id: "likeToast" });
    },
  });

  const deletePost = api.posts.delete.useMutation({
    onSuccess: (data) => {
      if (data) toast.success("Verwijderd");
    },
  });

  const submitDelete = (postId: string) => {
    deletePost.mutate({ post: postId });
  };
  if (props.post.status === "REMOVED")
    return (
      <div>
        <p className="text-center text-red-500">Verwijderd</p>
      </div>
    );
  return (
    <div
      key={props.post.id + "pst"}
      className="mb-3 rounded border border-gray-200 p-4 shadow-md transition-colors duration-300 hover:bg-gray-200"
    >
      {props.post.Reply[0]?.main.id &&
        props.post.Reply[0]?.main.User.username && (
          <Link href={"/comment/" + props.post.Reply[0].main.id}>
            Antwoorde op{" "}
            <span className=" text-blue-500">
              @{props.post.Reply[0].main.User.username}
            </span>
          </Link>
        )}
      <div className="mb-4 flex flex-row text-gray-600">
        {typeof props.post.User.image == "string" ? (
          <UserIcon
            User={{
              followers: props.post.User._count.followers || 0,
              following: props.post.User._count.following || 0,
              username: props.post.User.username ?? "",
              // description: post.data.User. ?? "",
              id: props.post.User.id,
              image: props.post.User.image,
            }}
            height={40}
            width={40}
          />
        ) : null}
        <span className="ml-2 text-blue-500">
          <Link href={"/profile/" + (props.post.User.username || "")}>
            @{props.post.User.username}
          </Link>
        </span>
        <span className="ml-2 text-gray-400">
          • Geplaatst {timeSince(props.post.createdAt)}{" "}
          {props.post.updatedAt.toString() !== props.post.createdAt.toString()
            ? "• Aangepast " + timeSince(props.post.updatedAt)
            : ""}
        </span>
      </div>
      <p className="mb-2">{props.post.text}</p>
      {typeof props.post.image == "string" ? (
        <Lightbox
          imageUrl={props.post.image}
          altText="Foto"
          Thumbnail={{ height: 200, width: 200 }}
        />
      ) : null}

      <div className="flex gap-3">
        <Like
          isLiked={props.post.Like.length > 0}
          onClick={() => {
            postLikes.mutate({ post: props.post.id });
          }}
          howManyLikes={props.post._count.Like}
          disabled={session?.user?.id === undefined}
        />
        <Comments
          postId={props.post.id}
          howManyComments={props.post._count.Comment}
          disabled={session?.user?.id === undefined}
        />
        {session?.user.role === "ADMIN" && (
          <div className="mt-1 flex gap-1">
            <button
              className="flex items-center justify-center focus:outline-none"
              title="Delete"
            >
              <DeleteModal
                onClick={() => {
                  submitDelete(props.post.id);
                }}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
