import { decryptText, verifySignature } from "@/lib/crypto";
import { useGlobalStore } from "@/data/global-store";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { type ChatMessage } from "@/data/chat-message-store";
import { useParticipantStore } from "./participant-store";

export const useDecryptedChatMessage = (message: ChatMessage) => {
  const myKeys = useGlobalStore((state) => state.myKeys);

  return useQuery({
    queryKey: ["decrypted-chat-message", message.id],
    queryFn: async () => {
      if (!myKeys.private) {
        throw new Error("No private key available");
      }

      const sender = useParticipantStore
        .getState()
        .participants.find(
          (p) => p.publicKey.getFingerprint() === message.sender,
        );

      if (sender === undefined) {
        toast({
          title: "Error unknown sender",
          description:
            "Please refresh the participants list or start a new session.",
        });
        throw new Error("Unknown sender");
      }

      try {
        const signatureCheck = await verifySignature({
          armoredMessage: message.content.encryptedText,
          armoredSignature: message.content.signature,
          sender: sender,
        });
        const decrypted = await decryptText(message.content.encryptedText);
        if (decrypted.isErr()) {
          throw new Error("Failed to decrypt message");
        }
        return {
          content: decrypted.value,
          isValidSignature: signatureCheck.isOk(),
        };
      } catch (error) {
        toast({
          title: "Decryption failed",
          description: "Failed to decrypt chat message.",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!myKeys.private,
    staleTime: Infinity,
    retry: false,
  });
};
