import Pusher from "pusher-js";
import { IS_SERVER, isErrorWithMessage, isWebSocketError } from "./utils";
import { z } from "zod";
import { readKey } from "openpgp";
import { useParticipantStore } from "@/data/participant-store";
import { type Server, useGlobalStore } from "@/data/global-store";
import { decryptText, verifySignature } from "./crypto";
import { useMessageStore } from "@/data/message-store";
import { toast } from "@/components/ui/use-toast";
import { env } from "@/env";
import { err, ok, type Result } from "neverthrow";
import { useQuery } from "@tanstack/react-query";

type IntroductionEvent = z.infer<typeof IntroductionEvent>;
const IntroductionEvent = z.object({
  type: z.literal("introduction"),
  participant: z.object({
    username: z.string().min(1),
    publicKey: z.string().min(1),
  }),
});

type IntroductionResponseEvent = z.infer<typeof IntroductionResponseEvent>;
const IntroductionResponseEvent = z.object({
  type: z.literal("introduction-response"),
  receiver: z.string().min(1),
  participant: z.object({
    username: z.string().min(1),
    publicKey: z.string().min(1),
  }),
});

type EncryptedMessageEvent = z.infer<typeof EncryptedMessageEvent>;
const EncryptedMessageEvent = z.object({
  type: z.literal("encrypted-message"),
  id: z.string().min(1),
  label: z.object({
    encryptedText: z.string().min(1),
    signature: z.string().min(1),
  }),
  message: z.object({
    encryptedText: z.string().min(1),
    signature: z.string().min(1),
  }),
  sender: z.string().min(1),
  recipients: z.array(z.string().min(1)),
});

export type PusherEvent = z.infer<typeof PusherEvent>;
const PusherEvent = z.discriminatedUnion("type", [
  IntroductionEvent,
  IntroductionResponseEvent,
  EncryptedMessageEvent,
]);

const EventHandlers = {
  introduction: async (event: IntroductionEvent) => {
    const participantKey = await readKey({
      armoredKey: event.participant.publicKey,
    });

    const myPublicKey = useGlobalStore.getState().myKeys.public;
    if (myPublicKey !== undefined) {
      // send our own public key to the new participant
      useGlobalStore.getState().sendPusherEvent({
        type: "introduction-response",
        receiver: participantKey.getFingerprint(),
        participant: {
          username: useGlobalStore.getState().username,
          publicKey: myPublicKey.armor(),
        },
      });
    }

    useParticipantStore.getState().addParticipant({
      ...event.participant,
      publicKey: participantKey,
      isMe: false,
      trustLevel: "untrusted",
    });

    toast({
      title: "New participant",
      description: `${event.participant.username} has joined the session!`,
    });
  },
  "introduction-response": async (event: IntroductionResponseEvent) => {
    const myFingerPrint = useGlobalStore
      .getState()
      .myKeys.public?.getFingerprint();
    if (myFingerPrint === undefined) {
      return;
    }

    if (myFingerPrint !== event.receiver) {
      return;
    }

    useParticipantStore.getState().addParticipant({
      ...event.participant,
      publicKey: await readKey({ armoredKey: event.participant.publicKey }),
      isMe: false,
      trustLevel: "untrusted",
    });
  },
  "encrypted-message": async (event: EncryptedMessageEvent) => {
    const myFingerPrint = useGlobalStore
      .getState()
      .myKeys.public?.getFingerprint();
    if (myFingerPrint === undefined) {
      toast({
        title: "Error missing public key",
      });
      return;
    }

    // check if we are in the recipients list
    if (!event.recipients.includes(myFingerPrint)) {
      return;
    }

    const sender = useParticipantStore
      .getState()
      .participants.find((p) => p.publicKey.getFingerprint() === event.sender);
    if (sender === undefined) {
      // tell the user that the sender is not known
      // this could be a malicious actor or to refresh the participants list
      toast({
        title:
          "Error unknown sender, please refresh the participants list or start a new session.",
      });
      return;
    }

    // check if the sender is not blocked
    if (sender.trustLevel === "blocked") {
      return;
    }

    // check if the signatures match
    const [labelVerification, messageVerification] = await Promise.all([
      verifySignature({
        armoredMessage: event.label.encryptedText,
        armoredSignature: event.label.signature,
        sender,
      }),
      verifySignature({
        armoredMessage: event.message.encryptedText,
        armoredSignature: event.message.signature,
        sender,
      }),
    ]);

    const decryptedLabel = await decryptText(event.label.encryptedText);
    if (decryptedLabel.isErr()) {
      // failed to decrypt message
      toast({
        title: "Error decrypting message",
      });
      return;
    }

    useMessageStore.getState().addMessage({
      id: event.id,
      label: {
        ...event.label,
        plainText: decryptedLabel.value,
      },
      message: event.message,
      sender: event.sender,
      recipients: event.recipients,
      validSignatures: labelVerification.isOk() && messageVerification.isOk(),
    });
  },
} as const;

const handlePusherEvent = (event: unknown) => {
  const parsedEvent = PusherEvent.safeParse(event);

  if (!parsedEvent.success) {
    toast({
      title: "Error parsing event",
      description: `Failed to parse event: ${parsedEvent.error.message}`,
    });
    return;
  }

  if (parsedEvent.data.type === "introduction") {
    return EventHandlers[parsedEvent.data.type](parsedEvent.data);
  }
  if (parsedEvent.data.type === "introduction-response") {
    return EventHandlers[parsedEvent.data.type](parsedEvent.data);
  }
  if (parsedEvent.data.type === "encrypted-message") {
    return EventHandlers[parsedEvent.data.type](parsedEvent.data);
  }

  console.error("UNHANDLED EVENT TYPE!");
};

export const initialisePusher = () => {
  if (IS_SERVER) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const domain = urlParams.get("domain") ?? env.NEXT_PUBLIC_WEBSOCKET_HOST;
  const appKey = urlParams.get("appKey") ?? env.NEXT_PUBLIC_WEBSOCKET_APP_KEY;

  if (!id?.trim()) {
    return;
  }

  const pusher = new Pusher(appKey, {
    cluster: "eu",
    wsHost: domain,
    forceTLS: true,
    enabledTransports: ["ws", "wss"],
  });
  const channel = pusher.subscribe(`session-${id}`);
  channel.bind("client-event", handlePusherEvent);
  return channel;
};

export const waitCheckServer = async (
  server: Server,
): Promise<Result<null, string>> => {
  return new Promise((resolve) => {
    const pusher = new Pusher(server.appKey, {
      cluster: "eu",
      wsHost: server.domain,
      forceTLS: true,
      enabledTransports: ["ws", "wss"],
    });

    const timeoutId = setTimeout(() => {
      pusher.disconnect();
      resolve(err("Connection timed out"));
    }, 2000); // 2 seconds timeout

    pusher.connection.bind("connected", () => {
      clearTimeout(timeoutId);
      pusher.disconnect();
      resolve(ok(null));
    });

    pusher.connection.bind("error", (error: unknown) => {
      clearTimeout(timeoutId);
      pusher.disconnect();
      const errorMessage = (() => {
        if (isWebSocketError(error)) {
          return error.error.data.message;
        }
        if (isErrorWithMessage(error)) {
          return error.message;
        }
        return "unknown";
      })();
      resolve(err(`Connection error: ${errorMessage}`));
    });
  });
};

export const useServerStatus = (server: Server) => {
  return useQuery({
    queryKey: ["server-status", server.domain],
    queryFn: async () => {
      const result = await waitCheckServer(server);
      return result.isOk() ? "online" : "offline";
    },
  });
};
