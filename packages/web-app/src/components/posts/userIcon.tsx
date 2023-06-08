import Image from "next/image";
import * as HoverCard from "@radix-ui/react-hover-card";
import Link from "next/link";
type props = {
  User: {
    image: string;
    id: string;
    username: string;
    description?: string | null;
    followers?: number | null;
    following?: number | null;
  };
  height: number;
  width: number;
  className?: string; // Classname for the image
  alt?: string;
};
export const UserIcon = (props: props) => {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <Link
          href={"/profile/" + props.User.username}
          className="inline-block cursor-pointer rounded-full shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] outline-none focus:shadow-[0_0_0_2px_white]"
        >
          <Image
            src={props.User.image}
            alt={props.alt || "Profile Picture of" + props.User.username}
            width={props.width}
            height={props.height}
            className={"rounded-full " + (props.className || "")}
          ></Image>
        </Link>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          className="w-[300px] rounded-md bg-white p-5 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade data-[state=open]:transition-all"
          sideOffset={5}
        >
          <div className="flex flex-col gap-[7px]">
            <Link href={"/profile/" + props.User.username}>
              <Image
                src={props.User.image}
                alt={props.alt || "Profile Picture of " + props.User.username}
                width={props.width}
                height={props.height}
                className={"rounded-full " + (props.className || "")}
              ></Image>
            </Link>

            <div className="flex flex-col gap-[15px]">
              <div>
                <div className="m-0 text-[15px] font-medium leading-[1.5] text-blue-500">
                  <Link href={"/profile/" + props.User.username}>
                    @{props.User.username}
                  </Link>
                </div>
              </div>
              <div className="m-0 text-[15px] leading-[1.5] text-mauve12">
                {props.User.description}
              </div>
              <div className="flex gap-[15px]">
                <div className="flex gap-[5px]">
                  <div className="m-0 text-[15px] font-medium leading-[1.5] text-mauve12">
                    {props.User.following}
                  </div>{" "}
                  <div className="m-0 text-[15px] leading-[1.5] text-mauve10">
                    Following
                  </div>
                </div>
                <div className="flex gap-[5px]">
                  <div className="m-0 text-[15px] font-medium leading-[1.5] text-mauve12">
                    {props.User.followers}
                  </div>{" "}
                  <div className="m-0 text-[15px] leading-[1.5] text-mauve10">
                    Followers
                  </div>
                </div>
              </div>
            </div>
          </div>

          <HoverCard.Arrow className="fill-white" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};
