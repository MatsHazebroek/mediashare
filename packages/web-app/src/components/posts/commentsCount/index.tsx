import { useState } from "react";
import { BiComment } from "react-icons/bi";
import CommentPage from "../../../pages/comment/[commentId]";

const Comment = (props: {
  hasCommented: boolean;

  howManyComments: number;
  onClick?: () => void;
}) => {
  const [hasComment, setHasComment] = useState(props.hasCommented);
  const [howManyComments, setHowMannyComments] = useState(
    props.howManyComments
  );

  return (
    <>
      <div className="mt-1 flex gap-1">
        <button
          title="Comment"
          className="flex items-center justify-center transition-colors duration-300 focus:outline-none"
          onClick={() => {
            <CommentPage />;

            if (hasComment) setHowMannyComments(howManyComments - 1);
            if (!hasComment) setHowMannyComments(howManyComments + 1);
            setHasComment(!hasComment);
            if (props.onClick) props.onClick();
          }}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 hover:bg-blue-200">
            <BiComment></BiComment>
          </div>
        </button>
        <span className="flex items-center justify-center">
          {howManyComments}
        </span>
      </div>
    </>
  );
};

export default Comment;
