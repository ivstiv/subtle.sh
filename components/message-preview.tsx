import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useGlobalStore } from "@/data/global-store";
import { decryptText } from "@/lib/crypto";
import { useToast } from "./ui/use-toast";
import { Loader2, ClipboardCopy } from "lucide-react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { Button } from "./ui/button";

type Props = {
  encryptedLabel: string;
  encryptedContent: string;
};

export const MessagePreview = ({ encryptedLabel, encryptedContent }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [decryptedLabel, setDecryptedLabel] = useState<string | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const myKeys = useGlobalStore((state) => state.myKeys);
  const { toast } = useToast();

  const handleDecrypt = async () => {
    if (!myKeys.public) {
      toast({
        title: "Error",
        description: "No public key found. Unable to decrypt.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const [labelResult, contentResult] = await Promise.all([
        decryptText(encryptedLabel),
        decryptText(encryptedContent),
      ]);

      if (labelResult.isOk() && contentResult.isOk()) {
        setDecryptedLabel(labelResult.value);
        setDecryptedContent(contentResult.value);
      } else {
        throw new Error("Failed to decrypt message");
      }
    } catch {
      toast({
        title: "Decryption failed",
        description: "Failed to decrypt message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, description: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          // onClick={handleDecrypt}
          onSelect={(event) => {
            event.preventDefault();
            void handleDecrypt();
          }}
        >
          Preview
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Message Preview</DialogTitle>
        </DialogHeader>
        <div className="grow overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="size-8 animate-spin" />
            </div>
          ) : (
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Label</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      decryptedLabel ?? "",
                      "Label copied to clipboard.",
                    )
                  }
                  disabled={!decryptedLabel}
                >
                  <span className="sr-only">Copy label</span>
                  <ClipboardCopy className="size-4" />
                </Button>
              </div>
              <div className="mb-4 rounded-md border p-2">
                <p className="mt-1 whitespace-pre-wrap">{decryptedLabel}</p>
              </div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Content</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      decryptedContent ?? "",
                      "Content copied to clipboard.",
                    )
                  }
                  disabled={!decryptedContent}
                >
                  <span className="sr-only">Copy content</span>
                  <ClipboardCopy className="size-4" />
                </Button>
              </div>
              <div className="rounded-md border p-2">
                <p className="mt-1 whitespace-pre-wrap">{decryptedContent}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};