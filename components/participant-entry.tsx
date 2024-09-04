import type { Participant } from "@/data/participant-store";
import { useParticipantStore } from "@/data/participant-store";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Recipient } from "./recipient";

type Props = {
  participant: Participant;
};
export const ParticipantEntry = ({ participant }: Props) => {
  const setTrustLevel = useParticipantStore((state) => state.setTrustLevel);

  return (
    <div
      //   key={participant.publicKey.getFingerprint()}
      className="flex items-center justify-between space-x-4"
    >
      <Recipient participant={participant} />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="ml-auto"
            disabled={participant.isMe}
          >
            {TrustLevels[participant.trustLevel].label}
            <ChevronDown className="ml-2 size-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="end">
          <Command>
            <CommandInput placeholder="Select new trust level..." />
            <CommandList>
              <CommandEmpty>No levels found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setTrustLevel(
                      participant.publicKey.getFingerprint(),
                      "trusted",
                    );
                  }}
                  className="flex flex-col items-start space-y-1 px-4 py-2"
                >
                  <p>{TrustLevels.trusted.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {TrustLevels.trusted.description}
                  </p>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setTrustLevel(
                      participant.publicKey.getFingerprint(),
                      "untrusted",
                    );
                  }}
                  className="flex flex-col items-start space-y-1 px-4 py-2"
                >
                  <p>{TrustLevels.untrusted.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {TrustLevels.untrusted.description}
                  </p>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setTrustLevel(
                      participant.publicKey.getFingerprint(),
                      "blocked",
                    );
                  }}
                  className="flex flex-col items-start space-y-1 px-4 py-2"
                >
                  <p>{TrustLevels.blocked.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {TrustLevels.blocked.description}
                  </p>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const TrustLevels = {
  trusted: {
    label: "Trusted",
    description: "Can send and decrypt the secrets you send.",
    level: "trusted",
  },
  untrusted: {
    label: "Untrusted",
    description: "Can send but can't decrypt the secrets you send.",
    level: "untrusted",
  },
  blocked: {
    label: "Blocked",
    description: "Can't send and can't decrypt the secrets you send.",
    level: "blocked",
  },
} as const;
