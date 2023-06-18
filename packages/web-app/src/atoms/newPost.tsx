import { atom } from "jotai";
const newPostAtomBack = atom<{ post: PostType; type: postTypes }[]>([]);
export const newPostAtom = atom(
  (get) => get(newPostAtomBack),
  (_get, set, newPost: { post: PostType; type: postTypes }) =>
    set(newPostAtomBack, [newPost, ..._get(newPostAtomBack)])
);

type postTypes = "tweet" | "comment";
