import { useState } from "react";
import { Posts } from "~/components/posts";

type props = {
  userId: string;
};
const PostsOfUser = (props: props) => {
  const [whatPosts, setWhatPosts] = useState<"tweets" | "media" | "likes">(
    "tweets"
  );
  return (
    <>
      <div className="mt-10 flex justify-between">
        <button
          onClick={() => setWhatPosts("tweets")}
          className={
            "flex-1 px-5 py-4 text-center text-gray-500 transition-colors duration-200 hover:bg-gray-200 focus:outline-none" +
            (whatPosts == "tweets" ? " bg-gray-200 font-bold text-black" : "")
          }
        >
          Tweets
        </button>
        <button
          onClick={() => setWhatPosts("media")}
          className={
            "flex-1 px-5 py-4 text-center text-gray-500 transition-colors duration-200 hover:bg-gray-200 focus:outline-none" +
            (whatPosts == "media" ? " bg-gray-200 font-bold text-black" : "")
          }
        >
          Media
        </button>
        <button
          onClick={() => setWhatPosts("likes")}
          className={
            "flex-1 px-5 py-4 text-center text-gray-500 transition-colors duration-200 hover:bg-gray-200 focus:outline-none" +
            (whatPosts == "likes" ? " bg-gray-200 font-bold" : "")
          }
        >
          Likes
        </button>
      </div>
      <Posts user={{ id: props.userId, type: whatPosts }} />
    </>
  );
};

export default PostsOfUser;
