import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import Image from "next/image";
import InputField from "../input/index";
import { TbCameraPlus } from "react-icons/tb";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "~/server/uploadthing";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { useDebouncedState } from "@mantine/hooks";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { set } from "zod";

type props = {
  user: {
    status: undefined;
    image: string | null;
    id: string;
    _count: {
      following: number;
      posts: number;
      followers: number;
    };
    createdAt: Date;
    username: string | null;
    link: string | null;
    description: string | null;
    banner: string | null;
  };
};

const EditProfileModal = (props: props) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useDebouncedState<string | null>(null, 500);
  const [description, setDescription] = useDebouncedState<string | null>(
    props.user.description,
    500
  );
  const [link, setLink] = useDebouncedState<string | null>(
    props.user.link,
    500
  );
  // image upload
  const startUserImageUpload = useRef<(() => void) | null>(null);
  const [userFiles, setUserFiles] = useState(0); // how many files are currently being uploaded
  const startBannerImageUpload = useRef<(() => void) | null>(null);
  const [bannerFiles, setBannerFiles] = useState(0); // how many files are currently being uploaded
  // has the profile edit started
  const [started, setStarted] = useState(false);
  const [actions, setActions] = useState(0);
  // new user info
  const [newUserInfo, setNewUserInfo] = useState<{
    username: string | null;
    description: string | null;
    link: string | null;
  } | null>(null);
  useEffect(() => {
    // finish the profile edit
    const finish = async () => {
      toast.success("Successfully edited profile", {
        id: "updateProfile",
        duration: 2000,
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStarted(false);
      if (newUserInfo && newUserInfo?.username !== props.user.username)
        return router.replace(`/profile/${newUserInfo.username || ""}`);
      router.reload();
    };
    // if there are actions and the profile edit has not started, start it
    if (actions > 0 && !started) setStarted(true);
    // if there are no actions and the profile edit has started, finish it
    if (actions == 0 && started)
      finish().catch(() => {
        return;
      });
  }, [actions]);
  const updateProfile = api.profile.update.useMutation({
    onSuccess: (data) => {
      setOpen(false);
      setActions((action) => action - 1);
      setNewUserInfo(data);
    },
    onError: (error) => {
      toast.error(error.message, {
        id: "updateProfile",
        duration: 2000,
      });
    },
    onMutate: () => {
      toast.loading("Updating profile", {
        id: "updateProfile",
      });
    },
  });
  const save = () => {
    if (
      props.user.username !== username ||
      props.user.description !== description ||
      props.user.link !== link
    )
      setActions((action) => action + 1);
    updateProfile.mutate({
      user: session?.user.id !== props.user.id ? props.user.id : undefined,
      username:
        username && props.user.username !== username ? username : undefined,
      description:
        description == ""
          ? null
          : description && props.user.description !== description
          ? description
          : undefined,
      link:
        link == "" ? null : link && link !== props.user.link ? link : undefined,
    });
    if (startBannerImageUpload.current && bannerFiles > 0) {
      setActions((action) => action + 1);
      startBannerImageUpload.current();
    }
    if (startUserImageUpload.current && userFiles > 0) {
      setActions((action) => action + 1);
      startUserImageUpload.current();
    }
  };
  return (
    <Dialog.Root open={open} onOpenChange={() => setOpen(!open)}>
      <Dialog.Trigger asChild>
        <button className="mr-4 mt-2 rounded-full border px-4 py-2 font-bold text-black transition-colors duration-200 hover:bg-gray-200">
          Wijzig profiel
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-blackA9 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-contentShow">
          <Dialog.Title className="m-0 text-[17px] font-bold">
            Wijzig profiel
          </Dialog.Title>

          <div className="relative mb-4">
            <div className="relative">
              <UploadButton<OurFileRouter>
                endpoint="bannerUploader"
                onClientUploadComplete={() => {
                  // Do something with the response
                  toast.success("Successfully edited banner", {
                    id: "bannerUploader",
                    duration: 2000,
                  });
                  setActions((action) => action - 1);
                }}
                files={(number) => setBannerFiles(number)}
                onUploadError={(error: Error) => {
                  // Do something with the error.
                  toast.error("Error editing banner: " + error.message, {
                    id: "bannerUploader",
                    duration: 2000,
                  });
                }}
                startUpload={(start) =>
                  (startBannerImageUpload.current = start)
                }
              >
                {() => (
                  <label className="cursor-pointer ">
                    <div className="relative flex h-40 max-h-[432px] items-start justify-center bg-slate-600">
                      {typeof props.user.banner == "string" && (
                        <Image
                          src={props.user.banner}
                          alt={"Image"}
                          width={1546}
                          height={432}
                          className={"max-h-full object-cover "}
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-800 opacity-30">
                        <TbCameraPlus className="h-6 w-6 rounded-full text-white" />
                      </div>
                    </div>
                  </label>
                )}
              </UploadButton>
              <UploadButton<OurFileRouter>
                endpoint="userImageUploader"
                onClientUploadComplete={() => {
                  // Do something with the response
                  toast.success("Successfully edited profile image", {
                    id: "userImageUploader",
                    duration: 2000,
                  });
                  setActions((action) => action - 1);
                }}
                files={(files) => setUserFiles(files)}
                onUploadError={(error: Error) => {
                  // Do something with the error.
                  toast.error(
                    "Error creating profile image: " + error.message,
                    {
                      id: "userImageUploader",
                      duration: 2000,
                    }
                  );
                }}
                startUpload={(start) => (startUserImageUpload.current = start)}
              >
                {() => (
                  <div className="absolute left-4 -translate-y-1/2 transform rounded-full border-4 border-white bg-white">
                    <label className="cursor-pointer">
                      <div className="relative">
                        <Image
                          src={props.user.image || ""} // Provide a default profile image path
                          alt="Profile"
                          className="h-16 w-16 rounded-full"
                          width={40}
                          height={40}
                        />
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-800 opacity-30">
                          <TbCameraPlus className="h-6 w-6 rounded-full text-white" />
                        </div>
                      </div>
                    </label>
                  </div>
                )}
              </UploadButton>
            </div>
          </div>

          <div className="mt-10 max-h-[35vh] overflow-auto">
            <InputField
              label="Naam"
              initialValue={props.user.username || ""}
              maxLength={50}
              errorMessage="Dit mag niet leeg zijn"
              isRequired={true}
              onInput={(e) => setUsername(e)}
            />

            <InputField
              label="Bio"
              initialValue={props.user.description || ""}
              maxLength={160}
              errorMessage={""}
              isRequired={false}
              onInput={(e) => setDescription(e)}
            />

            <InputField
              label="Website"
              initialValue={props.user.link || ""}
              maxLength={50}
              errorMessage={""}
              isRequired={false}
              onInput={(e) => setLink(e)}
            />
          </div>

          <div className="mt-[25px] flex justify-end">
            <button
              onClick={save}
              className="inline-flex h-[35px] items-center justify-center rounded-[4px] bg-green4 px-[15px] font-medium leading-none text-green11 hover:bg-green5 focus:shadow-[0_0_0_2px] focus:shadow-green7 focus:outline-none"
            >
              Opslaan
            </button>
          </div>
          <Dialog.Close asChild>
            <button
              className="absolute right-[10px] top-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full text-violet11 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
export default EditProfileModal;
