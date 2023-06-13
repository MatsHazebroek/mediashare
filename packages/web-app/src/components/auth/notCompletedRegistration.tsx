import * as Dialog from "@radix-ui/react-dialog";

import { useSession } from "next-auth/react";

import { useEffect, useState } from "react";

import Form from "../form/completeRegistration";

import { api } from "~/utils/api";

type props = {
  children: React.ReactNode;
};

export const NotCompletedRegistration = (props: props) => {
  const { data: session } = useSession();
  const [completedRegistration, setCompletedRegistration] = useState<
    boolean | null
  >(null);
  useEffect(() => {
    if (
      session?.user.status === "NOT_COMPLETED_REGISTRATION" &&
      session?.user.status !== undefined &&
      completedRegistration === null
    ) {
      setCompletedRegistration(true);
    }
  }, [session, completedRegistration]);
  return (
    <>
      <Dialog.Root
        open={completedRegistration == null ? false : completedRegistration}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-blackA9 data-[state=open]:animate-overlayShow" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[100vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-contentShow">
            <Form
              session={session}
              onSuccess={() => {
                setCompletedRegistration(false);
                () =>
                  api
                    .useContext()
                    .invalidate()
                    .catch(() => {
                      return;
                    });
              }}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {completedRegistration == null
        ? props.children
        : completedRegistration
        ? null
        : props.children}
    </>
  );
};
