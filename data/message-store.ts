import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useMessageStore = create<MessagesStore>()(
  devtools((set) => ({
    messages: [],
    addMessage: (message) => {
      set((state) => ({
        ...state,
        messages: [...state.messages, message],
      }));
    },
  })),
);

export type EncryptedMessage = {
  id: string;
  label: {
    plainText: string;
    encryptedText: string;
    signature: string;
  };
  message: {
    encryptedText: string;
    signature: string;
  };
  sender: string;
  recipients: string[];
  validSignatures: boolean;
};

type MessagesStore = {
  messages: EncryptedMessage[];
  addMessage: (message: EncryptedMessage) => void;
};
