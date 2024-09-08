"use client";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import { useParticipantStore } from "@/data/participant-store";
import { Badge } from "../ui/badge";
import { Recipient } from "../recipient";
import { OverlappingAvatars } from "../ui/overlapping-avatars";
import { CopyEncryptedText } from "../copy-encrypted-text";
import { useMessageStore } from "@/data/message-store";
import { toast } from "../ui/use-toast";
import { MessagePreview } from "../message-preview";
import { NewMessageDialog } from "../new-message/new-message-dialog";
import { getAvatarUrl } from "@/lib/utils";
import { SignatureShield } from "../signature-shield";

type MessageRow = {
  id: string;
  label: {
    plainText: string;
    validSignatures: boolean;
  };
  recipients: string[];
  sender: string;
};
export const columns: ColumnDef<MessageRow>[] = [
  {
    accessorKey: "label",
    header: "Label",
    cell: ({ row }) => {
      return (
        <div className="flex max-w-96 items-center overflow-hidden">
          <SignatureShield
            isValidSignature={row.original.label.validSignatures}
          />
          <span className="ml-2 cursor-pointer text-ellipsis font-bold">
            {row.original.label.plainText}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "Recipients",
    header: () => <div className="">Recipients</div>,
    cell: ({ row }) => {
      const avatars = useParticipantStore
        .getState()
        .participants.filter((p) =>
          row.original.recipients.includes(p.publicKey.getFingerprint()),
        )
        .map((p) => ({
          src: getAvatarUrl(p.publicKey.getFingerprint()),
          username: p.username,
        }));
      return <OverlappingAvatars avatars={avatars} />;
    },
  },
  {
    accessorKey: "Sender",
    header: () => <div className="">Sender</div>,
    cell: ({ row }) => {
      const participants = useParticipantStore.getState().participants;
      const sender = participants.find(
        (p) => p.publicKey.getFingerprint() === row.original.sender,
      );

      if (!sender) {
        return <Badge variant="secondary">Unknown</Badge>;
      }
      return <Recipient participant={sender} />;
    },
  },
  {
    id: "actions",
    header: () => <div className="">Actions</div>,
    cell: ({ row }) => {
      const message = useMessageStore
        .getState()
        .messages.find((m) => m.id === row.original.id);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <CopyEncryptedText encryptedText={message?.message.encryptedText} />
            <DropdownMenuItem
              onClick={async () => {
                await navigator.clipboard.writeText(
                  row.original.label.plainText,
                );
                toast({
                  title: "Label copied to your clipboard!",
                });
              }}
            >
              Copy label
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <MessagePreview messageId={row.original.id} />
            <NewMessageDialog
              existingMessageId={row.original.id}
              trigger={
                <DropdownMenuItem
                  onSelect={(event) => {
                    // prevent the dialog and dropdown from closing
                    // TO-DO: figure out how to open dialog but close dropdown
                    event.preventDefault();
                  }}
                >
                  Resend
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
