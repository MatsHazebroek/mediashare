import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { AiOutlineDelete } from "react-icons/ai";

const DialogDemo = (props: { onClick?: () => void }) => (
  <Dialog.Root>
    <Dialog.Trigger asChild>
      <button
        className="flex items-center justify-center focus:outline-none"
        title="Delete"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 hover:bg-red-400">
          <AiOutlineDelete />
        </div>
      </button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-blackA9 data-[state=open]:animate-overlayShow" />
      <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-contentShow">
        <Dialog.Title className="m-0 text-[17px] font-medium text-mauve12">
          Verwijder post
        </Dialog.Title>
        <Dialog.Description className="mb-5 mt-[10px] text-[15px] leading-normal text-mauve11">
          Weet je het zeker dat je deze post wil verwijderen?
        </Dialog.Description>

        <div className="mt-[25px] flex justify-end">
          <Dialog.Close asChild>
            <button
              className="inline-flex h-[35px] items-center justify-center rounded-[4px] bg-red-200 px-[15px] font-medium leading-none text-red-500  focus:outline-none"
              onClick={() => {
                if (props.onClick) props.onClick();
              }}
            >
              Verwijder
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

export default DialogDemo;
