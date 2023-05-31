import { api } from "~/utils/api";
import Image from "next/image";
import { timeSince } from "./formatTime";
export const Posts = () => {
  const posts = api.posts.getAll.useQuery({});
  if (posts.isLoading) return <div>Loading...</div>;
  if (posts.isError) return <div>Error: {posts.error.message}</div>;
  return (
    <>
      {posts.data.map((post) => (
        <div key={post.id + "post"} className="bg-gray-100 p-4 shadow-md">
          <div className="mb-4 flex flex-row text-gray-600">
            {typeof post.User.image == "string" ? (
              <Image
                src={post.User.image}
                alt={"Image"}
                width={40}
                height={40}
                className={"rounded-full"}
              ></Image>
            ) : null}
            <span className="ml-2 text-blue-500">@{post.User.name}</span>
            <span className="ml-2 text-gray-400">
              • Posted {timeSince(post.createdAt)}{" "}
              {post.updatedAt.toString() !== post.createdAt.toString()
                ? "• Last edited " + timeSince(post.updatedAt)
                : ""}
            </span>
          </div>
          <p>{post.text}</p>
        </div>
      ))}
    </>
  );
};
