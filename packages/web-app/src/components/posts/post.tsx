import Link from "next/link";
import { UserIcon } from "./userIcon";
import { timeSince } from "./formatTime";
import Image from "next/image";
import Auth from "../auth";
import Like from "./likesCount";
import Comments from "../form/commentModal";
import { useSession } from "next-auth/react";
import DeleteModal from "./deleteModal";
type props = {
  post: PostType;

  onLike?: (postId: string) => void;
  onDelete?: (postId: string) => void;
};
export const Post = (props: props) => {
  const { data: session } = useSession();
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
          <Image
            src={props.post.image}
            height={200}
            width={200}
            alt={"Foto"}
          ></Image>
        ) : null}
      </Link>
      <Auth>
        <div className="flex gap-3">
          <Like
            isLiked={props.post.Like.length > 0}
            onClick={() => {
              if (props.onLike) props.onLike(props.post.id);
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
                    if (props.onDelete) props.onDelete(props.post.id);
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
