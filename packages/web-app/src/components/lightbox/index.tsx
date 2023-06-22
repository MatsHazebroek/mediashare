import Image from "next/image";
import { Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";

type props = {
  imageUrl: string;
  altText: string;
  Thumbnail: {
    width: number;
    height: number;
  };
};
export const Lightbox = (props: props) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Image
          alt={props.altText}
          src={props.imageUrl}
          width={props.Thumbnail.width}
          height={props.Thumbnail.height}
        />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed  left-0 top-0 z-50 h-screen w-screen">
          <div className="relative h-full w-full">
            <Dialog.Close className="absolute right-0 top-0 z-50 inline-flex h-[30px] w-[30px] appearance-none items-center justify-center rounded-bl-sm bg-white transition-all hover:rounded-bl-lg lg:absolute">
              <Cross2Icon className="h-[20px] w-[20px]" />
            </Dialog.Close>
          </div>
        </Dialog.Overlay>
        <Dialog.Overlay className="fixed inset-0 z-10 bg-blackA9 data-[state=open]:animate-overlayShow" />
        <Dialog.Overlay className="fixed inset-0 z-40 bg-blackA9 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed left-0 top-0 z-30 h-full w-full max-w-full  p-5 focus:outline-none data-[state=open]:animate-contentShow sm:left-[50%] sm:top-[50%] sm:max-h-[75vh] sm:w-[100vw] sm:max-w-[550px] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:p-[25px]">
          <div className="relative h-full ">
            <Image
              fill
              className="h-full object-contain"
              src={props.imageUrl}
              alt={props.altText}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
