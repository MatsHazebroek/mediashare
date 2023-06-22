import { useDebouncedState } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";

type props = {
  children: (searchQuery: string) => React.ReactNode;
};
export const InputElement = (props: props) => {
  // refs
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsDivRef = useRef<HTMLDivElement>(null);
  // state
  const [searchQuery, setSearchQuery] = useDebouncedState("", 500);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // when user is targeting the input field
  useEffect(() => {
    // when user presses escape
    const handleStop = () => {
      if (inputRef.current) inputRef.current.blur();
      setShowSuggestions(false);
    };

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") handleStop();
    });

    window.addEventListener("click", (event) => {
      // when user clicks outside of the input field or the suggestions
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsDivRef.current &&
        !suggestionsDivRef.current.contains(event.target as Node)
      )
        handleStop();
      // when the user clicks the input field
      if (inputRef.current && inputRef.current.contains(event.target as Node))
        setShowSuggestions(true);
    });
    return () => {
      window.removeEventListener("keydown", handleStop);
      window.removeEventListener("click", handleStop);
    };
  });
  return (
    <div
      className={`relative mb-4 ${
        showSuggestions && searchQuery.length > 3 ? "w-1/2" : "w-1/4"
      }  transition-width duration-100 ease-in focus-within:w-full hover:w-full lg:focus-within:w-1/2 lg:hover:w-1/2 `}
    >
      <input
        ref={inputRef}
        className="w-full rounded-md border border-gray-300 px-4 py-2"
        type="text"
        placeholder="Zoeken..."
        defaultValue={searchQuery}
        onClick={() => searchQuery.length > 3 && setShowSuggestions(true)}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {showSuggestions && searchQuery.length >= 3 && (
        <div ref={suggestionsDivRef}>{props.children(searchQuery)}</div>
      )}
    </div>
  );
};
