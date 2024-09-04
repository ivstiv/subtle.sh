import { useState } from "react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { useGlobalStore } from "@/data/global-store";
import { decryptText } from "@/lib/crypto";
import { useToast } from "./ui/use-toast";

type Props = {
  encryptedText?: string;
};
export const CopyEncryptedText = ({ encryptedText }: Props) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const myKeys = useGlobalStore((state) => state.myKeys);
  const { toast } = useToast();

  return (
    <DropdownMenuItem
      disabled={
        loading || myKeys.public === undefined || encryptedText === undefined
      }
      onClick={async () => {
        if (encryptedText === undefined) {
          return;
        }

        setLoading(true);
        const decrypted = await decryptText(encryptedText);

        if (decrypted.isErr()) {
          // TO-DO: show error decrypting failed
          console.error(decrypted.error);
          setLoading(false);
          return;
        }

        await navigator.clipboard.writeText(decrypted.value);
        setCopied(true);
        setLoading(false);

        toast({
          title: "Content copied to your clipboard!",
        });
      }}
    >
      {`${copied ? "Copied" : "Copy"} content`}
    </DropdownMenuItem>
  );
};
