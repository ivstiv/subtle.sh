import Pusher from "pusher-js";
import { IS_SERVER } from "./utils";
import { z } from "zod";
import { readKey } from "openpgp";
import { useParticipantStore } from "@/data/participant-store";
import { useGlobalStore } from "@/data/global-store";
import { decryptText, verifySignature } from "./crypto";
import { useMessageStore } from "@/data/message-store";
import { toast } from "@/components/ui/use-toast";
import { env } from "@/env";

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
      // TO-DO: Add error to error store and report to UI
      // we don't have a public key, we can't decrypt the message
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
      // TO-DO: sender was not found, propagate error to user
      // tell the user that the sender is not known
      // this could be a malicious actor or to refresh the particopants list
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
      // TO-DO: Add error to error store and report to UI
      // failed to decrypt message
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
    // TO-DO: Add error to error store and report to UI
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

  if (!id?.trim()) {
    return;
  }

  const pusher = new Pusher(env.NEXT_PUBLIC_WEBSOCKET_APP_ID, {
    cluster: "eu",
    wsHost: env.NEXT_PUBLIC_WEBSOCKET_HOST,
    forceTLS: true,
    enabledTransports: ["ws", "wss"],
  });
  const channel = pusher.subscribe(`session-${id}`);
  channel.bind("client-event", handlePusherEvent);
  return channel;
};
