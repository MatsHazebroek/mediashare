import { useDebouncedState } from "@mantine/hooks";
import type { Session } from "next-auth";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { api } from "~/utils/api";

const Form = (props: { session: Session | null; onSuccess: () => void }) => {
  const router = useRouter();
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
      router.reload();
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
          onClick={submit}
        >
          Voltooi registratie
        </button>
      </div>
    </>
  );
};

export default Form;
