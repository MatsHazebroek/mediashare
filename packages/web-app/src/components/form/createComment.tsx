import { useDebouncedState } from "@mantine/hooks";
import { UploadButton } from "@uploadthing/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useCookies } from "react-cookie";
import toast from "react-hot-toast";
import { AiOutlinePicture } from "react-icons/ai";
import type { OurFileRouter } from "~/server/uploadthing";
import { api } from "~/utils/api";

export const CreateComent = (props: {
  howManyComments: number;
  postId: string;
}) => {
  const [howManyComments, setHowMannyComments] = useState(
    props.howManyComments
  );
  const startUploadRef = useRef<(() => void) | null>(null); // This is a hack to get around the fact that UploadButton doesn't have a prop for this
  const textArea = useRef<HTMLTextAreaElement>(null); // To clean up the textarea after posting
  const [message, setMessage] = useDebouncedState("", 200); // Debounce the message so we don't re-render too much
  const [howManyFiles, setHowManyFiles] = useState(0); // To keep track of how many files we're uploading
  const [, setCookies, removeCookies] = useCookies(["post"]); // To keep track of the post ID
  const { data: session } = useSession();
  // Mutations
  const commentOnPost = api.posts.comment.useMutation({
    onMutate: () => {
      toast.loading("Creating comment...", { id: "createPost" });
      if (textArea.current) textArea.current.value = "";
    },
    onError: (error) => {
      toast.error("Error creating comment: " + error.message, {
        id: "createPost",
        duration: 2000,
      });
    },
    onSuccess: (res) => {
      // if we have files, set the post ID cookie and start the upload (UploadThing will handle the rest)
      if (howManyFiles > 0) {
        setCookies("post", res.id, {
          secure: true,
          sameSite: "strict",
          path: "/",
        });
        if (startUploadRef.current) return startUploadRef.current();
      }
      toast.success("Comment placed!", { id: "createPost", duration: 2000 });
      setMessage("");
      setHowMannyComments(howManyComments + 1);
    },
  });
  // event handlers
  const comment = () => {
    commentOnPost.mutate({ post: props.postId, text: message });
  };
  const handleStartUpload = (startUpload: () => void) => {
    startUploadRef.current = startUpload;
  };
  return (
    <>
      <div className="flex flex-row p-4 text-gray-800 placeholder:text-5xl">
        {typeof session?.user.image == "string" ? (
          <div>
            <Image
              src={session.user.image}
              alt={"Image"}
              width={40}
              height={40}
              style={{ width: 40, height: 40 }}
              className={"rounded-full"}
            ></Image>
          </div>
        ) : null}
        <textarea
          className="mb-2 ml-6 w-full rounded border p-1.5"
          placeholder="Geef je reactie!"
          ref={textArea}
          onInput={(e) => setMessage(e.currentTarget.value)}
          // disabled={createPost.isLoading}
        ></textarea>
      </div>
      <div className="p-2">
        <UploadButton<OurFileRouter>
          endpoint="postUploader"
          startUpload={handleStartUpload}
          onClientUploadComplete={() => {
            // Do something with the response
            removeCookies("post");
            toast.success("Post created!", {
              id: "createPost",
              duration: 2000,
            });
            setMessage("");
            setHowMannyComments(howManyComments + 1);
          }}
          onUploadError={(error: Error) => {
            // Do something with the error.
            alert(`ERROR! ${error.message} ${JSON.stringify(error)}`);
            removeCookies("post");
            toast.error("Error creating post: " + error.message, {
              id: "createPost",
              duration: 2000,
            });
          }}
          files={(numberOfFiles) => {
            setHowManyFiles(numberOfFiles);
          }}
          disabled={commentOnPost.isLoading}
        >
          {() => (
            <div className="mt-2">
              <button className="flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 hover:bg-green-200">
                <AiOutlinePicture />
              </button>
            </div>
          )}
        </UploadButton>
        <button
          onClick={comment}
          className="inline-flex h-[35px] items-center justify-center rounded bg-[#1D9BF9] px-[15px] font-medium leading-none text-white transition-colors duration-200 hover:bg-[#47aefc]"
        >
          Comment
        </button>
      </div>
    </>
  );
};
