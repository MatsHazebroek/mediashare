import React, { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { useDebouncedState } from "@mantine/hooks";
import { useCookies } from "react-cookie";
import toast from "react-hot-toast";
import type { OurFileRouter } from "~/server/uploadthing";
import { UploadButton } from "@uploadthing/react";
import { AiOutlinePicture } from "react-icons/ai";
import { useAtom } from "jotai";
import { newPostAtom } from "~/atoms/newPost";

const Index = () => {
  const { data: session } = useSession();
  const [, setNewPost] = useAtom(newPostAtom);
  const [response, setResponse] = useState<PostType | null>(null);
  const startUploadRef = useRef<(() => void) | null>(null); // This is a hack to get around the fact that UploadButton doesn't have a prop for this
  const textArea = useRef<HTMLTextAreaElement>(null); // To clean up the textarea after posting
  const [message, setMessage] = useDebouncedState("", 200); // Debounce the message so we don't re-render too much
  const [howManyFiles, setHowManyFiles] = useState(0); // To keep track of how many files we're uploading
  const [, setCookies, removeCookies] = useCookies(["post"]); // To keep track of the post ID
  // Mutations
  const createPost = api.posts.create.useMutation({
    onMutate: () => {
      toast.loading("Creating post...", { id: "createPost" });
      if (textArea.current) textArea.current.value = "";
    },
    onError: (error) => {
      toast.error("Error creating post: " + error.message, {
        id: "createPost",
        duration: 2000,
      });
    },
    onSuccess: (res) => {
      // If we have files, set the post ID cookie and start the upload (UploadThing will handle the rest)
      if (howManyFiles > 0) {
        setCookies("post", res.id, {
          secure: true,
          sameSite: "strict",
          path: "/",
        });
        setResponse(res);
        if (startUploadRef.current) return startUploadRef.current();
      }
      toast.success("Post created!", { id: "createPost", duration: 2000 });
      // display newly created posts
      setNewPost({ post: res, type: "tweet" });
      setMessage("");
    },
  });
  // event handlers
  const tweet = () => {
    createPost.mutate({ text: message });
  };
  const handleStartUpload = (startUpload: () => void) => {
    startUploadRef.current = startUpload;
  };
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="h-12 w-40 flex-row items-center rounded bg-[#1D9BF9] text-white transition-colors duration-200 hover:bg-[#47aefc]">
          Tweet
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-blackA9 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed left-0 top-0 h-full w-full max-w-full bg-white p-5 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-contentShow sm:left-[50%] sm:top-[50%] sm:max-h-[25vh] sm:w-[100vw] sm:max-w-[550px] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:p-[25px]">
          <div className="mt-3 flex flex-row">
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
            onClientUploadComplete={(file) => {
              // Do something with the response
              removeCookies("post");
              toast.success("Post created!", {
                id: "createPost",
                duration: 2000,
              });
              // display newly created posts
              if (response && file)
                setNewPost({
                  post: { ...response, image: file[0]?.fileUrl ?? null },
                  type: "tweet",
                });
              setMessage("");
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
            disabled={createPost.isLoading}
          >
            {() => (
              <div className="mt-2">
                <button className="flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 hover:bg-green-200">
                  <AiOutlinePicture />
                </button>
              </div>
            )}
          </UploadButton>
          <div className="mt-[25px] flex justify-end">
            <Dialog.Close asChild>
              <button
                onClick={tweet}
                className="inline-flex h-[35px] items-center justify-center rounded bg-[#1D9BF9] px-[15px] font-medium leading-none text-white transition-colors duration-200 hover:bg-[#47aefc]"
              >
                Tweet
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
  );
};

export default Index;
