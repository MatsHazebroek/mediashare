import { type NextPage } from "next";
import Head from "next/head";
import Sidebar from "../components/sidebar";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Twitter</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Sidebar />
      </main>
    </>
  );
};

export default Home;
