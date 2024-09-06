import { decryptText } from "@/lib/crypto";
import { useMessageStore } from "./message-store";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export const useDecryptedMessage = (messageId?: string) => {
  const message = useMessageStore((state) => {
    return state.messages.find((message) => message.id === messageId);
  });

  return useQuery({
    staleTime: Infinity,
    enabled: messageId !== undefined && message !== undefined,
    queryKey: ["decrypted-message", messageId],
    queryFn: async () => {
      if (!message) {
        throw new Error("Message not found");
      }

      try {
        const [labelResult, contentResult] = await Promise.all([
          decryptText(message.label.encryptedText),
          decryptText(message.message.encryptedText),
        ]);

        if (labelResult.isErr() || contentResult.isErr()) {
          throw new Error("Failed to decrypt message");
        }

        return {
          label: {
            plainText: labelResult.value,
          },
          content: {
            plainText: contentResult.value,
          },
        };
      } catch (error) {
        toast({
          title: "Decryption failed",
          description: "Failed to decrypt message.",
          variant: "destructive",
        });

        throw error;
      }
    },
  });
};
