import type { Participant } from "@/data/participant-store";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

type Props = {
  participant: Participant;
};
export const Recipient = ({ participant }: Props) => {
  return (
    <div className="flex items-center space-x-2">
      <Avatar>
        <AvatarImage src="/avatars/01.png" />
        <AvatarFallback>
          {participant.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center gap-1">
          {participant.isMe && <Badge variant="secondary">You</Badge>}
          <p className="font-medium leading-none">{participant.username}</p>
        </div>

        <p className="text-sm text-muted-foreground">
          {participant.publicKey.getKeyID().toHex()}
        </p>
      </div>
    </div>
  );
};
