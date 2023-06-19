import { useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const Likes = (props: {
  isLiked: boolean;
  howManyLikes: number;
  disabled?: boolean;
  onClick?: () => void;
}) => {
  const [isLiked, setIsLiked] = useState(props.isLiked);
  const [howManyLikes, setHowManyLikes] = useState(props.howManyLikes);

  return (
    <>
      <div className="mt-1 flex gap-1">
        <button
          className="flex items-center justify-center focus:outline-none"
          onClick={() => {
            if (props.disabled) return;

            if (isLiked) setHowManyLikes(howManyLikes - 1);
            if (!isLiked) setHowManyLikes(howManyLikes + 1);
            setIsLiked(!isLiked);
            if (props.onClick) props.onClick();
          }}
          title={"Like"}
        >
          {isLiked ? (
            <div className="flex h-7 w-7 items-center justify-center">
              <AiFillHeart className="h-5 w-5 text-red-500" />
            </div>
          ) : (
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 ${
                props.disabled == false ? "hover:bg-red-300" : "cursor-default"
              }`}
            >
              <AiOutlineHeart className="h-5 w-5" />
            </div>
          )}
        </button>
        <span className="flex items-center justify-center ">
          {howManyLikes}
        </span>
      </div>
    </>
  );
};

export default Likes;
