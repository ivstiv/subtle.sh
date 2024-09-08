import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type ChatMessage = {
  id: string;
  sender: string;
  content: {
    encryptedText: string;
    signature: string;
  };
  timestamp: number;
};

type ChatMessageStore = {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
};

export const useChatMessageStore = create<ChatMessageStore>()(
  devtools((set) => ({
    messages: [],
    addMessage: (message) => {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    },
  })),
);
