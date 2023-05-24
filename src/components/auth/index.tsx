import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

type props = {
  children: React.ReactNode;
};

function Index(props: props) {
  const { status, data: session } = useSession();
  const router = useRouter();

  if (status == "loading") {
    return <div>loading...</div>;
  }

  if (status == "unauthenticated") {
    router.push("/").catch(() => {
      return;
    });
    return <></>;
  }

  if (status == "authenticated" && session !== null) {
    return <>{props.children}</>;
  }

  return <div></div>;
}

export default Index;
