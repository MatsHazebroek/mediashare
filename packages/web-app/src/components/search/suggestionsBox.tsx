import { useIntersection } from "@mantine/hooks";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { api } from "~/utils/api";

type props = {
  searchQuery: string;
};
export const SuggestionsBox = (props: props) => {
  // api call
  const search = api.search.search.useInfiniteQuery(
    {
      howMany: 6,
      query: props.searchQuery,
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  // infinite scroll
  const lastPostRef = useRef<HTMLElement | null>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });
  useEffect(() => {
    if (entry?.isIntersecting) void search.fetchNextPage();
  }, [entry]);
  // loading
  if (search.isLoading) return <></>;
  // error
  if (search.isError)
    return (
      <div className="absolute left-0 mt-2 max-h-52 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-md">
        <div className="px-4 py-2 hover:bg-gray-100">
          <div className="left-0  flex items-center gap-2">
            <span className="text-center text-red-700">
              Een fout is opgetreden bij het ophalen van de zoekresultaten -{" "}
              {search.error.message}
            </span>
          </div>
        </div>
      </div>
    );
  // pages to one array
  const suggestions = search.data.pages.flatMap((page) => page.data);
  return (
    <div className="absolute left-0 mt-2 max-h-52 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-md">
      {suggestions.map((suggestion, i) => (
        <div
          key={i}
          ref={i === suggestions.length - 1 ? ref : undefined}
          className="cursor-pointer px-4 py-2 hover:bg-gray-100"
        >
          <Link
            href={"/comment/" + suggestion.id}
            className="left-0 flex max-w-full items-center gap-2 overflow-hidden"
          >
            {typeof suggestion.User.image == "string" ? (
              <div>
                <Image
                  src={suggestion.User.image}
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
              <Link href={"/profile/" + (suggestion.User.username ?? "")}>
                @{suggestion.User.username}
              </Link>
            </span>

            <span className="flex-grow text-ellipsis whitespace-nowrap text-gray-400">
              - {suggestion.text}
            </span>
            {suggestion.image && (
              <Image
                src={suggestion.image}
                alt={"Image"}
                width={40}
                height={40}
                style={{
                  height: 40,
                  minHeight: 40,
                  maxHeight: 40,
                }}
              ></Image>
            )}
          </Link>
        </div>
      ))}
    </div>
  );
};
