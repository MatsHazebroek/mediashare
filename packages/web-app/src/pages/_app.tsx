import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { NotCompletedRegistration } from "~/components/auth/notCompletedRegistration";
import Sidebar from "~/components/sidebar";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Toaster />
      <NotCompletedRegistration>
        <Sidebar>
          <Component {...pageProps} />
          <div className="h-10 w-full lg:h-0"></div>
        </Sidebar>
      </NotCompletedRegistration>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
