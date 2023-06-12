import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import Image from "next/image";
import InputField from "../input/index";
import { TbCameraPlus } from "react-icons/tb";

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
    description: string | null;
  };
};

const DialogDemo = (props: props) => {
  return (
    <Dialog.Root>
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
              <label htmlFor="banner-upload" className="cursor-pointer ">
                <Image
                  src={
                    "https://images.pexels.com/photos/573130/pexels-photo-573130.jpeg?auto=compress&cs=tinysrgb&w=1600"
                  }
                  alt="Banner"
                  className="h-40 w-full rounded object-cover "
                  width={100}
                  height={100}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800 opacity-30">
                  <TbCameraPlus className="h-6 w-6 rounded-full text-white" />
                </div>
              </label>
              <input
                type="file"
                id="banner-upload"
                accept="image/*"
                className="hidden "
              />

              <div className="absolute left-4 -translate-y-1/2 transform rounded-full border-4 border-white bg-white">
                <label
                  htmlFor="profile-image-upload"
                  className="cursor-pointer"
                >
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
                <input
                  type="file"
                  id="profile-image-upload"
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 max-h-[35vh] overflow-auto">
            <InputField
              label="Naam"
              initialValue={props.user.username || ""}
              maxLength={50}
              errorMessage="Dit mag niet leeg zijn"
              isRequired={true}
            />

            <InputField
              label="Bio"
              initialValue={props.user.description || ""}
              maxLength={160}
              errorMessage={""}
              isRequired={false}
            />

            <InputField
              label="Website"
              initialValue=""
              maxLength={50}
              errorMessage={""}
              isRequired={false}
            />
          </div>

          <div className="mt-[25px] flex justify-end">
            <Dialog.Close asChild>
              <button className="inline-flex h-[35px] items-center justify-center rounded-[4px] bg-green4 px-[15px] font-medium leading-none text-green11 hover:bg-green5 focus:shadow-[0_0_0_2px] focus:shadow-green7 focus:outline-none">
                Opslaan
              </button>
            </Dialog.Close>
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
export default DialogDemo;
