import React from "react";

const Index = () => {
  return (
    <>
      {/* <!-- component --> */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css"
      />

      <div className="flex min-h-screen flex-row bg-gray-100">
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
                  <i className="bx bx-home"></i>
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
            <li>
              <a
                href="#"
                className="mx-auto flex h-12 w-52 flex-row items-center rounded text-gray-500 transition-colors duration-300 hover:bg-gray-200 hover:text-gray-800"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
                  <i className="bx bx-user"></i>
                </span>
                <span className="text-lg font-medium">Profiel</span>
              </a>
            </li>
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
              <li>
                <a
                  href=""
                  className="mx-auto mb-4 mt-10 flex h-12 w-52 flex-row items-center rounded bg-[#1D9BF9] text-white transition-colors duration-200 hover:bg-[#47aefc]"
                >
                  {/* <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
                    
                </span> */}
                  <span className="mx-auto text-lg font-medium">Tweet</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="mx-auto mb-12 flex h-12 w-52 transform flex-row items-center rounded text-gray-500 transition-colors duration-300 hover:bg-gray-200 hover:text-gray-800"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
                    <i className="bx bx-log-in"></i>
                  </span>
                  <span className="text-lg font-medium">Inloggen</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
