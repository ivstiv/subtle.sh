import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useToast } from "./ui/use-toast";
import { Loader2, ClipboardCopy } from "lucide-react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useDecryptedMessage } from "@/data/use-decrypted-message";

type Props = {
  messageId: string;
};

export const MessagePreview = ({ messageId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const decryptedMessage = useDecryptedMessage(messageId);
  const { toast } = useToast();

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
          onSelect={(event) => {
            event.preventDefault();
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
          {decryptedMessage.isPending ? (
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
                  onClick={() => {
                    if (!decryptedMessage.data) {
                      throw new Error("Decrypted message data is undefined");
                    }
                    void copyToClipboard(
                      decryptedMessage.data.label.plainText,
                      "Label copied to clipboard.",
                    );
                  }}
                  disabled={decryptedMessage.data === undefined}
                >
                  <span className="sr-only">Copy label</span>
                  <ClipboardCopy className="size-4" />
                </Button>
              </div>
              <div className="mb-4 rounded-md border p-2">
                <p className="mt-1 whitespace-pre-wrap">
                  {decryptedMessage.data?.label.plainText}
                </p>
              </div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Content</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!decryptedMessage.data) {
                      throw new Error("Decrypted message data is undefined");
                    }
                    void copyToClipboard(
                      decryptedMessage.data.content.plainText,
                      "Content copied to clipboard.",
                    );
                  }}
                  disabled={decryptedMessage.data === undefined}
                >
                  <span className="sr-only">Copy content</span>
                  <ClipboardCopy className="size-4" />
                </Button>
              </div>
              <div className="rounded-md border p-2">
                <p className="mt-1 whitespace-pre-wrap">
                  {decryptedMessage.data?.content.plainText}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
