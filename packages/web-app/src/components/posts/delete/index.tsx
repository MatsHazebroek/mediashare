import React from "react";
import { AiOutlineDelete } from "react-icons/ai";

const Delete = (props: { onClick?: () => void }) => {
  return (
    <>
      <div className="mt-1 flex gap-1">
        <button
          className="flex items-center justify-center focus:outline-none"
          title="Delete"
          onClick={() => {
            if (props.onClick) props.onClick();
          }}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 hover:bg-red-400">
            <AiOutlineDelete />
          </div>
        </button>
      </div>
    </>
  );
};

export default Delete;
