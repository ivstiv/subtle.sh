"use client";
import { RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";
import { useParticipantStore } from "@/data/participant-store";
import { useGlobalStore } from "@/data/global-store";
import { useMemo } from "react";
import { usePagination } from "@/lib/usePagination";
import { ParticipantEntry } from "./participant-entry";

export const Participants = () => {
  const participants = useParticipantStore((state) => state.participants);

  const multipleParticipantsWithSameUsername = useMemo(() => {
    const usernames = participants.map((participant) => participant.username);
    return usernames.length !== new Set(usernames).size;
  }, [participants]);

  const paginatedParticipants = usePagination({
    initialPage: 1,
    items: participants,
    pageSize: 4,
  });

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">Participants</h1>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mr-1"
          onClick={reintroduce}
        >
          <span className="sr-only">Refresh participants</span>
          <RefreshCcw className="size-4" />
        </Button>
      </div>
      <Card>
        <CardHeader>
          {/* <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="mr-1"
                onClick={reintroduce}
              >
                <span className="sr-only">Refresh participants</span>
                <RefreshCcw className="h-4 w-4" />
              </Button>
              Participants
            </CardTitle>
            <div className="flex gap-2">
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {paginatedParticipants.currentPageIndex} of{" "}
                {paginatedParticipants.totalPages}
              </div>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={paginatedParticipants.previousPage}
                disabled={paginatedParticipants.currentPageIndex === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={paginatedParticipants.nextPage}
                disabled={paginatedParticipants.currentPageIndex === paginatedParticipants.totalPages}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div> */}

          <CardDescription>
            Set trust levels to share secrets effectively.
          </CardDescription>
          {multipleParticipantsWithSameUsername && (
            <CardDescription className="font-semibold text-destructive">
              There are multiple participants with the same username! Refresh
              the list and ensure the trust levels are correct.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="grid gap-6">
          {paginatedParticipants.currentPage.map((participant) => (
            <ParticipantEntry
              key={participant.publicKey.getFingerprint()}
              participant={participant}
            />
          ))}
        </CardContent>
      </Card>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={paginatedParticipants.previousPage}
          disabled={paginatedParticipants.currentPageIndex === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={paginatedParticipants.nextPage}
          disabled={
            paginatedParticipants.currentPageIndex ===
            paginatedParticipants.totalPages
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
};

const reintroduce = () => {
  useParticipantStore.getState().removeAllParticipantsExceptMe();
  const myPublicKey = useGlobalStore.getState().myKeys.public;
  if (myPublicKey !== undefined) {
    // re-introduce myself to get all participants
    useGlobalStore.getState().sendPusherEvent({
      type: "introduction",
      participant: {
        username: useGlobalStore.getState().username,
        publicKey: myPublicKey.armor(),
      },
    });
  }
};
