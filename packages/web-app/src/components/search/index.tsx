import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const PageContent: NextPage = () => {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.trim() !== "");
  };

  const handleSuggestionClick = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(false);
  };

  const suggestions = ["test", "test", "test", "test", "test"];
  return (
    <>
      <div className="relative mb-4">
        <input
          className="w-full rounded-md border border-gray-300 px-4 py-2"
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleInputChange}
        />

        {showSuggestions && (
          <div className="absolute left-0 mt-2 w-full rounded-md border border-gray-300 bg-white shadow-md">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="left-0 flex items-center gap-2">
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
                  <span className="text-blue-500">
                    <Link href={"/profile/"}>@{session?.user.username}</Link>
                  </span>

                  <span className="text-gray-400">- post text</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PageContent;
