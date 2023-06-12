import * as Dialog from "@radix-ui/react-dialog";
import { useRef, useState } from "react";
import { BiComment } from "react-icons/bi";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "~/server/uploadthing";
import { useDebouncedState } from "@mantine/hooks";
import { useCookies } from "react-cookie";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { Cross2Icon } from "@radix-ui/react-icons";
const Comment = (props: { howManyComments: number; postId: string }) => {
  const [howManyComments, setHowMannyComments] = useState(
    props.howManyComments
  );
  const { data: session } = useSession();
  const startUploadRef = useRef<(() => void) | null>(null); // This is a hack to get around the fact that UploadButton doesn't have a prop for this
  const textArea = useRef<HTMLTextAreaElement>(null); // To clean up the textarea after posting
  const [message, setMessage] = useDebouncedState("", 200); // Debounce the message so we don't re-render too much
  const [howManyFiles, setHowManyFiles] = useState(0); // To keep track of how many files we're uploading
  const [, setCookies, removeCookies] = useCookies(["post"]); // To keep track of the post ID
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
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <div className="mt-1 flex gap-1">
            <button
              title="Comment"
              className="flex items-center justify-center transition-colors duration-300 focus:outline-none"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 hover:bg-blue-200">
                <BiComment></BiComment>
              </div>
            </button>
            <span className="flex items-center justify-center">
              {howManyComments}
            </span>
          </div>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-blackA9 data-[state=open]:animate-overlayShow" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[100vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-contentShow">
            <div className="flex flex-row">
              {typeof session?.user.image == "string" ? (
                <div>
                  <Image
                    src={session.user.image}
                    alt={"Image"}
                    width={40}
                    height={40}
                    className={"rounded-full"}
                  ></Image>
                </div>
              ) : null}
              <textarea
                className="mb-2 ml-2 max-h-80 w-[430px] rounded border p-1.5"
                placeholder="Wat gebeurt er?"
                id="test"
                onInput={(e) => setMessage(e.currentTarget.value)}
              ></textarea>
            </div>
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
            />
            <div className="mt-[25px] flex justify-end">
              <Dialog.Close asChild>
                <button
                  onClick={comment}
                  className="inline-flex h-[35px] items-center justify-center rounded bg-[#1D9BF9] px-[15px] font-medium leading-none text-white transition-colors duration-200 hover:bg-[#47aefc]"
                >
                  Comment
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Close asChild>
              <button
                className="absolute right-[10px] top-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
                aria-label="Close"
                title="Close"
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default Comment;
