import { useGlobalStore } from "@/data/global-store";
import type { EncryptedMessage } from "@/data/message-store";
import { useMessageStore } from "@/data/message-store";
import { useParticipantStore } from "@/data/participant-store";
import { encryptAndSign } from "@/lib/crypto";
import { useFormik } from "formik";
import { v4 } from "uuid";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useToast } from "../ui/use-toast";
import { useDecryptedMessage } from "@/data/use-decrypted-message";

type Props = {
  onSucessfulSubmit: () => void;
  existingMessageId?: string;
};
export const useNewMessageForm = ({
  onSucessfulSubmit,
  existingMessageId,
}: Props) => {
  const sendPusherEvent = useGlobalStore((state) => state.sendPusherEvent);
  const myKeys = useGlobalStore((state) => state.myKeys);
  const participants = useParticipantStore((state) => state.participants);
  const addMessage = useMessageStore((state) => state.addMessage);

  const { toast } = useToast();
  const existingMessage = useDecryptedMessage(existingMessageId);

  return useFormik({
    isInitialValid: existingMessage.data !== undefined,
    enableReinitialize: true,
    validationSchema,
    initialValues: {
      label: existingMessage.data?.label.plainText ?? "",
      content: existingMessage.data?.content.plainText ?? "",
    },
    onSubmit: async (values, form) => {
      if (myKeys.public === undefined) {
        toast({
          title: "Error missing public key",
        });
        return;
      }

      const recipients = participants.filter((p) => p.trustLevel === "trusted");

      const [label, message] = await Promise.all([
        encryptAndSign({ recipients, text: values.label }),
        encryptAndSign({ recipients, text: values.content }),
      ]);

      if (label.isErr() || message.isErr()) {
        toast({
          title: "Error encrypting message",
        });
        return;
      }

      const newMessage: EncryptedMessage = {
        id: v4(),
        validSignatures: true,
        label: {
          plainText: values.label,
          encryptedText: label.value.encryptedText,
          signature: label.value.signature,
        },
        message: {
          encryptedText: message.value.encryptedText,
          signature: message.value.signature,
        },
        sender: myKeys.public.getFingerprint(),
        recipients: recipients.map((p) => p.publicKey.getFingerprint()),
      };

      sendPusherEvent({
        type: "encrypted-message",
        ...newMessage,
      });
      addMessage(newMessage);

      form.resetForm();
      onSucessfulSubmit();

      toast({
        title: `Secret sent to ${recipients.length - 1} recipient${recipients.length - 1 > 1 ? "s" : ""}`,
      });
    },
  });
};

const validationSchema = toFormikValidationSchema(
  z.object({
    label: z
      .string({
        required_error: "Label is required",
        invalid_type_error: "Label must be a string",
      })
      .min(1, "Label cannot be empty"),
    content: z
      .string({
        required_error: "Content is required",
        invalid_type_error: "Content must be a string",
      })
      .min(1, "Content cannot be empty"),
  }),
);
