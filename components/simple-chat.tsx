"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { DoorOpen, Send } from "lucide-react";
import Link from "next/link";
import {
  type ChatMessage,
  useChatMessageStore,
} from "@/data/chat-message-store";
import { useGlobalStore } from "@/data/global-store";
import { useParticipantStore } from "@/data/participant-store";
import { encryptAndSign } from "@/lib/crypto";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";
import { useDecryptedChatMessage } from "@/data/use-decrypted-chat-message";
import { getAvatarUrl } from "@/lib/utils";
import { SignatureShield } from "./signature-shield";

export const SimpleChat = () => {
  const messages = useChatMessageStore((state) => state.messages);
  const addMessage = useChatMessageStore((state) => state.addMessage);
  const [inputMessage, setInputMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const sendPusherEvent = useGlobalStore((state) => state.sendPusherEvent);
  const myKeys = useGlobalStore((state) => state.myKeys);
  const participants = useParticipantStore((state) => state.participants);

  const handleSendMessage = async () => {
    if (inputMessage.trim() && myKeys.public) {
      const recipients = participants.filter((r) => r.trustLevel !== "blocked");
      const encryptedContent = await encryptAndSign({
        text: inputMessage.trim(),
        recipients,
      });

      if (encryptedContent.isErr()) {
        toast({
          title: "Error encrypting message",
          description: "Failed to encrypt the chat message.",
        });
        return;
      }

      const chatMessage = {
        type: "chat-message" as const,
        id: uuidv4(),
        content: {
          encryptedText: encryptedContent.value.encryptedText,
          signature: encryptedContent.value.signature,
        },
        sender: myKeys.public.getFingerprint(),
        timestamp: Date.now(),
      };

      sendPusherEvent(chatMessage);

      addMessage({
        id: chatMessage.id,
        content: chatMessage.content,
        sender: chatMessage.sender,
        timestamp: chatMessage.timestamp,
      });

      setInputMessage("");
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;

      // needs a timeout so scrolling happens after browser paints
      // long wrapped messages can cause the scrollHeight to not update
      // immediately, so we need to wait for the next tick
      const timeout = setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [messages]);

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">Chat</h1>
        <Link
          className={buttonVariants({
            variant: "outline",
          })}
          href="/"
        >
          <DoorOpen className="size-4" />
          Leave
        </Link>
      </div>
      <div className="mx-auto flex h-[500px] w-full max-w-2xl flex-col overflow-hidden rounded-lg border">
        <div ref={scrollAreaRef} className="relative grow overflow-y-auto p-4">
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-center text-sm text-muted-foreground">
                Be the first to send a message!
              </p>
            </div>
          )}
        </div>
        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendMessage();
            }}
            className="flex space-x-2"
          >
            <Input
              type="text"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="grow"
            />
            <Button type="submit" size="icon">
              <Send className="size-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

const ChatMessageItem = ({ message }: { message: ChatMessage }) => {
  const participants = useParticipantStore((state) => state.participants);
  const decryptedMessage = useDecryptedChatMessage(message);

  const sender = useMemo(() => {
    return (
      participants.find(
        (p) => p.publicKey.getFingerprint() === message.sender,
      ) ?? unknownSender
    );
  }, [participants, message.sender]);
  const isMe = sender.isMe;

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <Avatar className="mr-2 size-8">
          <AvatarImage
            src={getAvatarUrl(sender.publicKey.getFingerprint())}
            alt={sender.username}
          />
          <AvatarFallback>{sender.username}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={`flex max-w-[80%] flex-col ${isMe ? "items-end" : "items-start"}`}
      >
        <span className="mb-1 flex items-center text-xs text-muted-foreground">
          {sender.username}
          <SignatureShield
            isValidSignature={
              decryptedMessage.isSuccess &&
              decryptedMessage.data.isValidSignature
            }
          />
        </span>
        <div
          className={`inline-block rounded-2xl px-4 py-2 ${
            isMe
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <p className="break-all text-sm">
            {decryptedMessage.isLoading
              ? "Decrypting..."
              : decryptedMessage.isError
                ? "Failed to decrypt"
                : decryptedMessage.data?.content}
          </p>
        </div>
      </div>
      {isMe && (
        <Avatar className="ml-2 size-8">
          <AvatarImage
            src={getAvatarUrl(sender.publicKey.getFingerprint())}
            alt={sender.username}
          />
          <AvatarFallback>{sender.username}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

const unknownSender = {
  username: "Unknown",
  publicKey: {
    getFingerprint: () => "unknown",
  },
  isMe: false,
};
