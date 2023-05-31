import { useSession } from "next-auth/react";

type props = {
  children: React.ReactNode;
};

function Auth(props: props) {
  const { status, data: session } = useSession();

  if (
    status == "authenticated" &&
    session !== null &&
    session.user.status == "ACTIVE"
  ) {
    console.log(session);
    return <>{props.children}</>;
  }

  return <></>;
}

export default Auth;
