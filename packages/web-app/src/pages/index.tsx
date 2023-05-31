import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Sidebar from "../components/sidebar";
import { CreatePost } from "~/components/form/createPost";

function Home() {
  return (
    <>
      <PageContent />
    </>
  );
}

const PageContent: NextPage = () => {
  return (
    <>
      <Head>
        <title>Twitter</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Sidebar>
          <div className="m-2 bg-white p-4 shadow-md">
            <CreatePost />
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="bg-gray-100 p-4 shadow-md">
                <div className="mb-4 flex flex-row text-gray-600">
                  {/* {typeof session?.user.image == "string" ? (
                    <Image
                      src={session.user.image}
                      alt={"Image"}
                      width={40}
                      height={40}
                      className={"rounded-full"}
                    ></Image>
                  ) : null} */}
                  <span className="ml-2 text-blue-500">@voorbeeld</span>
                  <span className="ml-2 text-gray-400">• 2 chinezen later</span>
                </div>
                <p>Aajsdnkandaklmd.</p>
              </div>
            </div>
          </div>
        </Sidebar>
      </main>
    </>
  );
};

export default Home;
