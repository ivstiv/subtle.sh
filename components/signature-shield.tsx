import { Shield, ShieldAlert } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type SignatureShieldProps = {
  isValidSignature: boolean;
};

export const SignatureShield = ({ isValidSignature }: SignatureShieldProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="ml-1">
            {isValidSignature ? (
              <Shield className="size-3 text-green-500" />
            ) : (
              <ShieldAlert className="size-3 text-yellow-500" />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {isValidSignature
            ? "Verified signature"
            : "Invalid signature - message may have been tampered with"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
