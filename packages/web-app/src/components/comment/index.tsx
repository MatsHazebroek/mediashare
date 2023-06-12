import Link from "next/link";
import { UserIcon } from "../posts/userIcon";
import { timeSince } from "../posts/formatTime";
import Image from "next/image";
import Auth from "~/components/auth";
import Like from "~/components/posts/likesCount";
import Comments from "~/components/posts/commentModal";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import DeleteModal from "../posts/deleteModal";
type props = {
  post: {
    id: string;
    User: {
      status: undefined;
      image: string | null;
      _count: {
        following: number;
        followers: number;
      };
      id: string;
      name: string | null;
    };
    image: string | null;
    text: string;
    Like: {
      date: Date;
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
  return (
    <div
      key={props.post.id + "pst"}
      className="mb-3 rounded border border-gray-200 p-4 shadow-md transition-colors duration-300 hover:bg-gray-200"
    >
      <div className="mb-4 flex flex-row text-gray-600">
        {typeof props.post.User.image == "string" ? (
          <UserIcon
            User={{
              followers: props.post.User._count.followers || 0,
              following: props.post.User._count.following || 0,
              username: props.post.User.name ?? "",
              // description: post.data.User. ?? "",
              id: props.post.User.id,
              image: props.post.User.image,
            }}
            height={40}
            width={40}
          />
        ) : null}
        <span className="ml-2 text-blue-500">
          <Link href={"/profile/" + (props.post.User.name || "")}>
            @{props.post.User.name}
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
        <Image
          src={props.post.image}
          height={200}
          width={200}
          alt={"Foto"}
        ></Image>
      ) : null}
      <Auth>
        <div className="flex gap-3">
          <Like
            isLiked={props.post.Like.length > 0}
            onClick={() => {
              postLikes.mutate({ post: props.post.id });
            }}
            howManyLikes={props.post._count.Like}
          />
          <Comments
            postId={props.post.id}
            howManyComments={props.post._count.Comment}
          />
          {session?.user.role === "ADMIN" ? (
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
          ) : (
            <></>
          )}
        </div>
      </Auth>
    </div>
  );
};
