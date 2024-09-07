"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { DoorOpen, Send } from "lucide-react";
import Link from "next/link";

type Message = {
  id: number;
  sender: string;
  content: string;
  isUser: boolean;
};

const initialMessages: Message[] = [
  { id: 1, sender: "Alice", content: "Hey, how are you?", isUser: false },
  {
    id: 2,
    sender: "You",
    content: "I'm good, thanks! How about you?",
    isUser: true,
  },
  {
    id: 3,
    sender: "Alice",
    content: "I'm doing great! Just finished a big project.",
    isUser: false,
  },
  {
    id: 4,
    sender: "You",
    content: "That's awesome! Congratulations!",
    isUser: true,
  },
  {
    id: 5,
    sender: "Alice",
    content: "Thanks! It was challenging but rewarding.",
    isUser: false,
  },
];

export function SimpleChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: "You",
        content: inputMessage.trim(),
        isUser: true,
      };
      setMessages([...messages, newMessage]);
      setInputMessage("");
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
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
        </Link>
      </div>
      <div className="mx-auto flex h-[600px] w-full max-w-2xl flex-col overflow-hidden rounded-lg border">
        <ScrollArea ref={scrollAreaRef} className="grow p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                {!message.isUser && (
                  <Avatar className="mr-2 size-8">
                    <AvatarImage
                      src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${message.sender}`}
                      alt={message.sender}
                    />
                    <AvatarFallback>{message.sender[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`flex max-w-[80%] flex-col ${message.isUser ? "items-end" : "items-start"}`}
                >
                  <span className="mb-1 text-xs text-muted-foreground">
                    {message.sender}
                  </span>
                  <div
                    className={`inline-block rounded-2xl px-4 py-2 ${
                      message.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <p className="break-words text-sm">{message.content}</p>
                  </div>
                </div>
                {message.isUser && (
                  <Avatar className="ml-2 size-8">
                    <AvatarImage
                      src={`https://api.dicebear.com/9.x/thumbs/svg?seed=You`}
                      alt="You"
                    />
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
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
}
