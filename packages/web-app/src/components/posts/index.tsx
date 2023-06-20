import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { useEffect, useRef } from "react";
import { useIntersection } from "@mantine/hooks";
import Loading from "../loading";
import { useAtom } from "jotai";
import { newPostAtom } from "~/atoms/newPost";
import { Post } from "./post";

type props = {
  user?: {
    id: string;
    type: "tweets" | "media" | "likes";
  };
  yourFollwing?: boolean;
  mainPostId?: string;
  disableLoading?: boolean;
};

export const Posts = (props: props) => {
  const [newPost] = useAtom(newPostAtom);
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
  // delete post api
  const deletePost = api.posts.delete.useMutation({
    onSuccess: (data) => {
      if (data) toast.success("Verwijderd");
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

  // loading
  if (posts.isLoading && props.disableLoading) return null;
  if (posts.isLoading) return <Loading />;
  // error
  if (posts.isError) return <div>Error: {posts.error.message}</div>;
  // pages to one array
  const _posts = posts.data.pages.flatMap((page) => page.data);

  return (
    <div className="m-2 bg-white">
      {newPost &&
        newPost.map((post) => {
          if (
            ((post.type == "tweet" && props.mainPostId == undefined) ||
              (post.type == "comment" &&
                props.mainPostId == post.post.ReplyingTo?.commentId)) &&
            props.user == undefined &&
            props.yourFollwing == undefined
          ) {
            const alreadyRendered = _posts.find((p) => p.id == post.post.id);
            const lastPost = _posts[_posts.length - 1];
            if (
              !alreadyRendered &&
              (lastPost == undefined ||
                lastPost.createdAt < post.post.createdAt)
            )
              return (
                <Post
                  post={post.post}
                  onDelete={(postId) => {
                    deletePost.mutate({ post: postId });
                  }}
                  onLike={(postId) => postLikes.mutate({ post: postId })}
                  key={post.post.id}
                />
              );
          }
          return null;
        })}
      {_posts.map((post, i) => (
        <div
          ref={i === _posts.length - 1 ? ref : undefined}
          key={post.id + "post"}
        >
          <Post
            post={post}
            onLike={(postId) => postLikes.mutate({ post: postId })}
            onDelete={(postId) => deletePost.mutate({ post: postId })}
          />
        </div>
      ))}
    </div>
  );
};
