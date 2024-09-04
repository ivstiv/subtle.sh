import { MessagesTable } from "@/components/messages/messages-table";
import { Participants } from "@/components/participants";
import { ShareSession } from "@/components/share-session";
import { UsernameDialog } from "@/components/username-dialog";

export default function SessionPage() {
  return (
    <>
      <div className="grid grid-cols-1 content-stretch gap-10 p-10 md:grid-cols-10">
        <div className="h-full md:col-span-6">
          <MessagesTable />
        </div>
        <div className="h-full space-y-4 md:col-span-4">
          <Participants />
          <ShareSession />
        </div>
        <div className="h-full md:col-span-4"></div>
      </div>
      <UsernameDialog />
    </>
  );
}