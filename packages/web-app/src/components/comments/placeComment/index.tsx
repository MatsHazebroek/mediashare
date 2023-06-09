import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { api } from "~/utils/api";

function Index() {
  const { data: session } = useSession();

  const comments = api.posts.comment.useMutation({
    onSuccess: () => {
      console.log("commented");
    },
  });

  return (
    <>
      <Link href={"/reply/"} className="cursor-pointer">
        <div className="flex flex-row gap-2 text-gray-800 placeholder:text-5xl">
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
            className="mb-2 ml-6 max-h-20 w-full rounded border p-1.5"
            placeholder="Tweet je reactie!"
          ></textarea>
          <button className="w-40 rounded bg-[#1D9BF9] px-4 py-2 text-white transition-colors duration-200 hover:bg-[#47aefc]">
            Plaats
          </button>
        </div>
      </Link>
    </>
  );
}

export default Index;
