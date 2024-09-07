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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-x-4">
      <Recipient participant={participant} />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="mt-2 w-full sm:mt-0 sm:w-auto"
            disabled={participant.isMe}
          >
            {TrustLevels[participant.trustLevel].label}
            <ChevronDown className="ml-2 size-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="end">
          <Command className="w-full">
            <CommandInput placeholder="Select new trust level..." />
            <CommandList>
              <CommandEmpty>No levels found.</CommandEmpty>
              <CommandGroup>
                {Object.entries(TrustLevels).map(([key, value]) => (
                  <CommandItem
                    key={key}
                    onSelect={() => {
                      setTrustLevel(
                        participant.publicKey.getFingerprint(),
                        key as keyof typeof TrustLevels,
                      );
                    }}
                    className="flex flex-col items-start space-y-1 px-4 py-2"
                  >
                    <p>{value.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </CommandItem>
                ))}
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
