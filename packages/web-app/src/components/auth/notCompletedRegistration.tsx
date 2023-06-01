import { useDebouncedState } from "@mantine/hooks";
import * as Dialog from "@radix-ui/react-dialog";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
type props = {
  children: React.ReactNode;
};
export const NotCompletedRegistration = (props: props) => {
  const { data: session, status } = useSession();
  console.log(session?.user.status === "NOT_COMPLETED_REGISTRATION");
  const [completedRegistration, setCompletedRegistration] =
    useState<boolean>(false);
  useEffect(() => {
    console.log(completedRegistration, "ewfpjewfoijfwe");
    if (
      session?.user.status !== "NOT_COMPLETED_REGISTRATION" &&
      completedRegistration == false
    ) {
      setCompletedRegistration(true);
    }
  }, [completedRegistration, session]);
  return (
    <>
      <Dialog.Root open={completedRegistration == false}>
        <Dialog.Trigger />
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-blackA9 data-[state=open]:animate-overlayShow" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[100vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-contentShow">
            <Form
              session={session}
              onSuccess={() => setCompletedRegistration(true)}
            />
            {completedRegistration && <span></span>}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {props.children}
    </>
  );
};
const Form = (props: { session: Session | null; onSuccess: () => void }) => {
  const [username, setUsername] = useDebouncedState<undefined | string>(
    undefined,
    200
  );
  const [description, setDescription] = useDebouncedState<undefined | string>(
    undefined,
    200
  );
  const completeRegistration = api.profile.completeRegistration.useMutation({
    onError: (error) => {
      toast.error(error.message, {
        id: "complete-registration",
      });
    },
    onMutate: () =>
      toast.loading("Completing registration", { id: "complete-registration" }),
    onSuccess: () => {
      toast.success("Registration completed", {
        id: "complete-registration",
      });
      props.onSuccess();
    },
  });
  const submit = () => {
    if (!username)
      return toast.error("Username is required", {
        id: "complete-registration",
      });
    completeRegistration.mutate({
      username,
      description,
    });
  };
  return (
    <>
      <h1 className="">Complete registration</h1>
      <div>
        <label
          className="text-[15px] font-medium leading-[35px] text-black"
          htmlFor="firstName"
        >
          ! Username:{" "}
        </label>
        <input
          className="selection:color-white inline-flex h-[35px] w-[200px] appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none text-black shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 focus:shadow-[0_0_0_2px_black]"
          type="text"
          id="firstName"
          onInput={(e) => setUsername(e.currentTarget.value)}
          placeholder={props.session?.user.name ?? ""}
        />
      </div>
      <div>
        <label
          className="text-[15px] font-medium leading-[35px] text-black"
          htmlFor="firstName"
        >
          Description of your account:{" "}
        </label>
        <textarea
          className="selection:color-white inline-flex h-[35px] w-[200px] appearance-none items-center justify-center rounded-[4px] bg-blackA5 px-[10px] text-[15px] leading-none text-black shadow-[0_0_0_1px] shadow-blackA9 outline-none selection:bg-blackA9 focus:shadow-[0_0_0_2px_black]"
          id="firstName"
          onInput={(e) => setDescription(e.currentTarget.value)}
          placeholder={"I like to tweet about ..."}
        />
      </div>
      <p>All inputs with ! need to be filled in!</p>
      <div>
        <button onClick={() => submit()}>Complete registration</button>
      </div>
    </>
  );
};
