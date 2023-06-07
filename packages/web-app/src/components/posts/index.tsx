import { api } from "~/utils/api";
import Image from "next/image";
import { timeSince } from "./formatTime";
import { UserIcon } from "./userIcon";
type props = {
  user?: {
    id: string;
    type: "tweets" | "media" | "likes";
  };
  yourFollwing?: boolean;
};
export const Posts = (props: props) => {
  const posts = api.posts.getAll.useQuery({
    page: 0,
    howMany: 10,
    user: props.user,
    following: props.yourFollwing,
  });
  if (posts.isLoading) return <div>Loading...</div>;
  if (posts.isError) return <div>Error: {posts.error.message}</div>;
  return (
    <>
      {posts.data.map((post) => (
        <div
          key={post.id + "post"}
          className="mb-3 border-gray-200 bg-gray-100 p-4 shadow-md"
        >
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
            <span className="ml-2 text-blue-500">@{post.User.name}</span>
            <span className="ml-2 text-gray-400">
              • Posted {timeSince(post.createdAt)}{" "}
              {post.updatedAt.toString() !== post.createdAt.toString()
                ? "• Last edited " + timeSince(post.updatedAt)
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
        </div>
      ))}
    </>
  );
};
