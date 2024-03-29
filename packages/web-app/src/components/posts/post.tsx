import Link from "next/link";
import { UserIcon } from "./userIcon";
import { timeSince } from "./formatTime";
import Like from "./likeButton";
import Comments from "../form/commentModal";
import { useSession } from "next-auth/react";
import DeleteModal from "./deleteModal";
import { useState } from "react";
import type { PostType } from "~/types/postType";
import { Lightbox } from "../lightbox";

type props = {
  post: PostType;

  onLike?: (postId: string) => void;
  onDelete?: (postId: string) => void;
};
export const Post = (props: props) => {
  const { data: session } = useSession();
  const [isDeleted, setIsDeleted] = useState(false);
  if (isDeleted) return null;

  return (
    <div className="mb-3 rounded border border-gray-200 p-4 shadow-md transition-colors duration-300 hover:bg-gray-200">
      {props.post.ReplyingTo?.commentId && props.post.ReplyingTo?.username && (
        <Link href={"/comment/" + props.post.ReplyingTo?.commentId}>
          Antwoorde op{" "}
          <span className=" text-blue-500">
            @{props.post.ReplyingTo?.username}
          </span>
        </Link>
      )}
      <Link href={"/comment/" + props.post.id} className="cursor-pointer">
        <div className="mb-4 flex flex-row text-gray-600">
          {typeof props.post.User.image == "string" ? (
            <UserIcon
              User={{
                followers: props.post.User._count.followers || 0,
                following: props.post.User._count.following || 0,
                username: props.post.User.username ?? "",
                description: props.post.User.description ?? "",
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
          <span onClick={(e) => e.preventDefault()} className="z-10 ">
            <Lightbox
              imageUrl={props.post.image}
              altText="image"
              Thumbnail={{ height: 200, width: 200 }}
            />
          </span>
        ) : null}
      </Link>

      <div className="flex gap-3">
        <Like
          isLiked={props.post.Like.length > 0}
          onClick={() => {
            if (props.onLike) props.onLike(props.post.id);
          }}
          howManyLikes={props.post._count.Like}
          disabled={session?.user?.id === undefined}
        />

        <Comments
          postId={props.post.id}
          howManyComments={props.post._count.Comment}
          disabled={session?.user?.id === undefined}
        />
        {(session?.user.id === props.post.User.id ||
          session?.user.role === "ADMIN") && (
          <div className="mt-1 flex gap-1">
            <button
              className="flex items-center justify-center focus:outline-none"
              title="Delete"
            >
              <DeleteModal
                onClick={() => {
                  setIsDeleted(true);
                  if (props.onDelete) props.onDelete(props.post.id);
                }}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
