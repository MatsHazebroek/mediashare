import { useSession } from "next-auth/react";

type props = {
  children: React.ReactNode;
};

function Index(props: props) {
  const { status, data: session } = useSession();

  if (status == "unauthenticated") {
    return <></>;
  }

  if (status == "authenticated" && session !== null) {
    return <>{props.children}</>;
  }

  return <div></div>;
}

export default Index;
