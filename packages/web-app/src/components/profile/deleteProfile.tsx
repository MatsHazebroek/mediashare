import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

function deleteProfile() {
  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button className="mr-4 mt-12 rounded-3xl border bg-red-500 px-4 py-2 font-bold text-black">
            Verwijder Profiel
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-blackA9 data-[state=open]:animate-overlayShow" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-contentShow">
            <Dialog.Title className="m-0 text-[17px] font-bold">
              Verwijder Profiel
            </Dialog.Title>
            <Dialog.Description>
              Weet je het zeker dat je dit profiel wil verbannen
            </Dialog.Description>
            <div className="mt-[25px] flex justify-end">
              <Dialog.Close asChild>
                <button className="inline-flex h-[35px] items-center justify-center rounded-[4px] bg-red-200 px-[15px] font-medium leading-none text-red-500  focus:outline-none">
                  Verbannen
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
    </>
  );
}

export default deleteProfile;
