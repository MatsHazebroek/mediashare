import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";
import Auth from "../auth";
import Modal from "../form/tweetButtonModal";
import DropDownMenu from "../dropdownmenu";
import Link from "next/link";

import {
  RiHome3Line,
  RiUserLine,
  RiLoginCircleLine,
  RiLogoutCircleLine,
} from "react-icons/ri";
import { SlUserFollowing } from "react-icons/sl";

type props = {
  children: React.ReactNode;
};
const Index = (props: props) => {
  const { status, data: session } = useSession();
  return (
    <>
      <div className="flex bg-gray-100">
        <div className=" hidden min-h-screen flex-row  lg:flex">
          <div className="flex w-80 flex-col overflow-hidden bg-white">
            <div className="flex h-20 items-center justify-center">
              <h1 className="text-3xl font-bold">Mediashare</h1>
            </div>
            <ul className="flex flex-col py-4">
              <li>
                <Link
                  href="/"
                  className="mx-auto flex h-12 w-52 flex-row items-center rounded text-gray-500 transition-colors duration-300 hover:bg-gray-200 hover:text-gray-800"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
                    <RiHome3Line
                      size={25}
                      className="text-gray-500 group-hover:text-blue-600"
                    />
                  </span>
                  <span className="text-lg font-medium">Home</span>
                </Link>
              </li>
              <Auth>
                <li>
                  <Link
                    href={"/following"}
                    className="mx-auto flex h-12 w-52 flex-row items-center rounded text-gray-500 transition-colors duration-300 hover:bg-gray-200 hover:text-gray-800"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
                      <SlUserFollowing size={25} className="text-gray-500" />
                    </span>
                    <span className="text-lg font-medium">
                      Following tweets
                    </span>
                  </Link>
                </li>
              </Auth>
              <Auth>
                <li>
                  <Link
                    href={"/profile/" + (session?.user.username || "")}
                    className="mx-auto flex h-12 w-52 flex-row items-center rounded text-gray-500 transition-colors duration-300 hover:bg-gray-200 hover:text-gray-800"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
                      <RiUserLine size={25} className="text-gray-500" />
                    </span>
                    <span className="text-lg font-medium">Profiel</span>
                  </Link>
                </li>
              </Auth>
            </ul>
            <div className="mt-auto">
              <ul className="flex flex-col">
                <Auth>
                  <li>
                    <div className="mx-auto mb-4 mt-10 flex items-center justify-center">
                      <span className="mx-auto text-lg font-medium">
                        <Modal />
                      </span>
                    </div>
                  </li>
                </Auth>
                <li>
                  {status === "unauthenticated" ? (
                    <>
                      <Link
                        href="#"
                        className="mx-auto mb-12 flex h-12 w-52 transform flex-row items-center rounded text-gray-500 transition-colors duration-300 hover:bg-gray-200 hover:text-gray-800"
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
                        <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
                          <RiLoginCircleLine
                            size={25}
                            className=" text-gray-500 group-hover:text-blue-600"
                          />
                        </span>
                        <span className="text-lg font-medium">Inloggen</span>
                      </Link>
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
                            style={{
                              width: 40,
                              height: 40,
                              minHeight: 40,
                              minWidth: 40,
                              maxHeight: 40,
                              maxWidth: 40,
                            }}
                            className={"rounded-full"}
                          ></Image>
                        </div>
                      ) : null}
                      <div className="ml-2 font-bold ">
                        {session?.user.name}
                        <div className="text-xs">{session?.user.email}</div>
                      </div>

                      <Link
                        href="#"
                        className="mx-auto mb-12 flex transform flex-row items-center justify-center rounded px-1 py-1 text-gray-500 transition-colors duration-300 hover:bg-gray-200 hover:text-gray-800"
                      >
                        <DropDownMenu></DropDownMenu>
                      </Link>
                    </div>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 z-50 h-16 w-full border-t border-gray-200 bg-white lg:hidden">
          <div className="mx-auto flex h-full max-w-lg items-center justify-center font-medium">
            <Link
              type="button"
              className="group flex flex-col items-center justify-center px-3"
              href={"/"}
            >
              <div className="ml-4">
                <RiHome3Line
                  size={18}
                  className="text-gray-500 group-hover:text-blue-600"
                />
              </div>
            </Link>
            <Link
              type="button"
              href={"/following"}
              className="group flex flex-col items-center justify-center px-3 "
            >
              <SlUserFollowing
                size={18}
                className="text-gray-500 group-hover:text-blue-600"
              />
            </Link>
            <Auth>
              <Link
                type="button"
                className="group flex flex-col items-center justify-center px-3"
                href={"/profile/" + (session?.user.username || "")}
              >
                <RiUserLine
                  size={18}
                  className="text-gray-500 group-hover:text-blue-600"
                />
              </Link>
            </Auth>

            {status === "unauthenticated" ? (
              <>
                <button
                  type="button"
                  className="group flex flex-col items-center justify-center px-3"
                >
                  <span
                    className="text-sm text-gray-500 group-hover:text-blue-600"
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
                    <RiLoginCircleLine
                      size={18}
                      className="text-gray-500 group-hover:text-blue-600"
                    />
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="group flex flex-col items-center justify-center px-3"
                >
                  <span
                    className="text-sm text-gray-500 group-hover:text-blue-600"
                    onClick={() => {
                      void (async () => {
                        await signOut().catch(() => {
                          return;
                        });
                      })();
                    }}
                  >
                    <RiLogoutCircleLine
                      size={18}
                      className="text-gray-500 group-hover:text-blue-600"
                    />
                  </span>
                </button>
                <div className="group ml-auto flex flex-col items-center justify-center px-5">
                  <Modal></Modal>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="h-screen flex-grow overflow-auto">
          {props.children}
          <div className="h-10 w-full lg:h-0"></div>
        </div>
      </div>
    </>
  );
};

export default Index;
