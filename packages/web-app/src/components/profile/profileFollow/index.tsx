import { useEffect, useState } from "react";

function Index(props: { hasFollowed: boolean; onClick?: () => void }) {
  const [followed, setFollowed] = useState(false);
  useEffect(() => {
    setFollowed(props.hasFollowed);
  }, [props.hasFollowed]);
  return (
    <>
      <div>
        <button
          onClick={() => {
            setFollowed(!followed);
            if (props.onClick) props.onClick();
          }}
          className="mr-4 mt-2 rounded-full border bg-[#1D9BF9] px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-[#47aefc]"
        >
          {followed ? "Unfollow" : "Follow"}
        </button>
      </div>
    </>
  );
}

export default Index;
