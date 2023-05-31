import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";
import Auth from "../auth";
import Modal from "../modal";
type props = {
  children: React.ReactNode;
};
const Index = (props: props) => {
  const { status, data: session } = useSession();
  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css"
      />
      <div className="flex bg-gray-100">
        <div className=" hidden min-h-screen flex-row  lg:flex">
          <div className="flex w-80 flex-col overflow-hidden bg-white">
            <div className="flex h-20 items-center justify-center">
              <h1 className="text-3xl uppercase text-indigo-500">Logo</h1>
            </div>
            <ul className="flex flex-col py-4">
              <li>
                <a
                  href="#"
                  className="mx-auto flex h-12 w-52 flex-row items-center rounded text-gray-500 transition-colors duration-300 hover:bg-gray-200 hover:text-gray-800"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
                    <svg
                      className="mb-1 h-6 w-6 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                    </svg>
                  </span>
                  <span className="text-lg font-medium">Home</span>
                </a>
              </li>
              {/* <li>
              <a
                href="#"
                className="mx-auto flex h-12 w-52 flex-row items-center rounded text-gray-500 transition-colors duration-300 hover:bg-gray-200 hover:text-gray-800"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
                  <i className="bx bx-chat"></i>
                </span>
                <span className="text-lg font-medium">Chat</span>
              </a>
            </li> */}
              <Auth>
                <li>
                  <a
                    href="#"
                    className="mx-auto flex h-12 w-52 flex-row items-center rounded text-gray-500 transition-colors duration-300 hover:bg-gray-200 hover:text-gray-800"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
                      <svg
                        className="mb-1 h-6 w-6 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          clip-rule="evenodd"
                          fill-rule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                        ></path>
                      </svg>
                    </span>
                    <span className="text-lg font-medium">Profiel</span>
                  </a>
                </li>
              </Auth>
              {/* <li>
              <a
                href="#"
                className="mx-auto flex h-12 w-52 flex-row items-center rounded text-gray-500 transition-colors duration-300 hover:bg-gray-200 hover:text-gray-800"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
                  <i className="bx bx-bell"></i>
                </span>
                <span className="text-lg font-medium">Notifications</span>
                <span className="ml-auto mr-auto rounded-full bg-red-100 px-3 py-px text-sm text-red-500">
                  5
                </span>
              </a>
            </li> */}
            </ul>
            <div className="mt-auto">
              {/* Added container for the logout button */}

              <ul className="flex flex-col">
                <Auth>
                  <li>
                    <div className="mx-auto mb-4 mt-10 flex items-center justify-center">
                      {/* <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
                    
                </span> */}
                      <span className="mx-auto text-lg font-medium">
                        {" "}
                        <Modal />
                      </span>
                    </div>
                  </li>
                </Auth>
                <li>
                  {/* Check if user is logged in */}
                  {status === "unauthenticated" ? (
                    <>
                      <a
                        href="#"
                        className="mx-auto mb-12 flex h-12 w-52 transform flex-row items-center rounded text-gray-500 transition-colors duration-300 hover:bg-gray-200 hover:text-gray-800"
                      >
                        <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
                          <i className="bx bx-log-in"></i>
                        </span>
                        <span
                          className="text-lg font-medium"
                          onClick={() => {
                            void (async () => {
                              await signIn("google", {
                                redirect: true,
                                callbackUrl: "/",
                              }).catch(() => {
                                return;
                              });
                            })();
                          }}
                        >
                          Inloggen
                        </span>
                      </a>
                    </>
                  ) : (
                    <div className="ml-5 flex flex-row justify-center">
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
                      <div className="ml-2 font-bold ">
                        {session?.user.name}
                      </div>

                      <a
                        href="#"
                        className="mx-auto mb-12 flex h-12 w-44 transform flex-row items-center rounded text-gray-500 transition-colors duration-300 hover:bg-gray-200 hover:text-gray-800"
                      >
                        <span className="ml-4 inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
                          <i className="bx bx-log-out"></i>
                        </span>

                        <span
                          className="text-lg font-medium"
                          onClick={() => {
                            void (async () => {
                              await signOut().catch(() => {
                                return;
                              });
                            })();
                          }}
                        >
                          Uitloggen
                        </span>
                      </a>
                    </div>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 z-50 h-16 w-full border-t border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 lg:hidden">
          <div className="mx-auto grid h-full max-w-lg grid-cols-4 font-medium">
            <button
              type="button"
              className="group inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="text-sm text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-500">
                Home
              </span>
            </button>
            <Auth>
              <button
                type="button"
                className="group inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <span className="text-sm text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-500">
                  Profile
                </span>
              </button>

              <button
                type="button"
                className="group inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {/* <span className="text-sm text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-500">
                  Tweet
                </span> */}
                <Modal />
              </button>
            </Auth>
            <button
              type="button"
              className="group inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="text-sm text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-500">
                Inloggen
              </span>
            </button>
          </div>
        </div>
        <div className="h-screen flex-grow overflow-auto">{props.children}</div>
      </div>
    </>
  );
};

export default Index;
