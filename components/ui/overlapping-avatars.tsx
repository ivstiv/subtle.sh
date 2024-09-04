import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const MAX_SHOWN_AVATARS = 4;
type Props = {
  avatars: {
    src: string;
    username: string;
  }[];
};
export const OverlappingAvatars = ({ avatars }: Props) => {
  const { shownAvatars, hiddenAvatars } = useMemo(() => {
    const shownAvatars = avatars.slice(0, MAX_SHOWN_AVATARS);
    const hiddenAvatars = avatars.slice(MAX_SHOWN_AVATARS);
    return {
      shownAvatars,
      hiddenAvatars,
    };
  }, [avatars]);

  return (
    <TooltipProvider>
      <div className="flex -space-x-3">
        {shownAvatars.map((avatar, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Avatar className="border-2 hover:cursor-pointer hover:border-foreground">
                <AvatarImage src={avatar.src} />
                <AvatarFallback>
                  {avatar.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{avatar.username}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {hiddenAvatars.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="border-2 hover:cursor-pointer hover:border-foreground">
                <AvatarFallback>{`+${hiddenAvatars.length}`}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{hiddenAvatars.map((a) => a.username).join(", ")}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
