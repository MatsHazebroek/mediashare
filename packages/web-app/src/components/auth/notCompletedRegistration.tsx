import { useDebouncedState } from "@mantine/hooks";
import * as Dialog from "@radix-ui/react-dialog";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
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
      <Head>
        <title>Voltooi registratie</title>
      </Head>
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
      toast.loading("Voltooien van registratie", {
        id: "complete-registration",
      }),
    onSuccess: () => {
      toast.success("Registratie voltooid", {
        id: "complete-registration",
      });
      props.onSuccess();
    },
  });
  const submit = () => {
    if (!username)
      return toast.error("Gebruikersnaam is verplicht", {
        id: "complete-registration",
      });
    completeRegistration.mutate({
      username,
      description,
    });
  };
  return (
    <>
      <h1 className="text-xl font-semibold">Voltooi registratie</h1>
      <div className="mb-4">
        <label
          className="block text-lg font-medium text-black"
          htmlFor="firstName"
        >
          <span className="text-red-500">!</span> Gebruikersnaam:
        </label>
        <input
          className="block w-64 rounded-md bg-blackA5 px-4 py-2 text-lg text-black shadow-sm outline-none focus:ring-2 focus:ring-blackA9"
          type="text"
          id="firstName"
          onInput={(e) => setUsername(e.currentTarget.value)}
          placeholder={props.session?.user.name ?? ""}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-lg font-medium text-black"
          htmlFor="firstName"
        >
          Beschrijving van uw account:
        </label>
        <textarea
          className="block w-64 rounded-md bg-blackA5 px-4 py-2 text-lg text-black shadow-sm outline-none focus:ring-2 focus:ring-blackA9"
          id="firstName"
          onInput={(e) => setDescription(e.currentTarget.value)}
          placeholder="Ik tweet graag over..."
        />
      </div>
      <p className="mb-4">
        Alle velden met <span className="text-red-500">!</span> ervoor moeten
        worden ingevuld!
      </p>
      <div>
        <button
          className="rounded-md bg-blue-500 px-4 py-2 text-lg font-semibold text-white shadow-sm hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
          onClick={() => submit()}
        >
          Voltooi registratie
        </button>
      </div>
    </>
  );
};
