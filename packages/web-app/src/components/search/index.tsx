import { SuggestionsBox } from "./suggestionsBox";
import { InputElement } from "./input";

export const Search = () => {
  return (
    <InputElement>
      {(searchQuery) => <SuggestionsBox searchQuery={searchQuery} />}
    </InputElement>
  );
};
