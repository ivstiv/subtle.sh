"use client";
import { useMessageStore } from "@/data/message-store";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useMemo } from "react";

// TO-DO: implement better handling of invalid signatures
export const MessagesTable = () => {
  const messages = useMessageStore((state) => state.messages);
  const data = useMemo(
    () =>
      messages.map((m) => ({
        id: m.id,
        label: {
          plainText: m.label.plainText,
          validSignatures: m.validSignatures,
        },
        recipients: m.recipients,
        sender: m.sender,
      })),
    [messages],
  );

  return <DataTable columns={columns} data={data} />;
};
