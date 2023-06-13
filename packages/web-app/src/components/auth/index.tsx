// Next Auth Imports
import { useSession } from "next-auth/react";

type props = {
  children: React.ReactNode;
};

// Checks if the user is authenticated and active
function Auth(props: props) {
  const { status, data: session } = useSession();
  if (
    status == "authenticated" &&
    session !== null &&
    session.user.status == "ACTIVE"
  ) {
    return <>{props.children}</>;
  }

  return <></>;
}

export default Auth;
