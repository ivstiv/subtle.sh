"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { z } from "zod";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useGlobalStore } from "@/data/global-store";
import { generateKey } from "openpgp";
import { useParticipantStore } from "@/data/participant-store";

export const UsernameDialog = () => {
  const { myKeys } = useGlobalStore();
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    setIsOpen(!Boolean(myKeys.public));
  }, [myKeys.public]);

  const form = useUsernameForm();

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <form onSubmit={form.handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>What should people call you?</AlertDialogTitle>
            <AlertDialogDescription className="grid w-full items-center gap-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.values.username}
                onChange={form.handleChange}
                disabled={form.isSubmitting}
              />
              <a className={cn("text-sm text-rose-400")}>
                {form.errors.username}
              </a>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction type="submit" disabled={form.isSubmitting}>
              {form.isSubmitting && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const useUsernameForm = () => {
  const setMyKeys = useGlobalStore((state) => state.setMyKeys);
  const setUsername = useGlobalStore((state) => state.setUsername);
  const username = useGlobalStore((state) => state.username);
  const sendPusherEvent = useGlobalStore((state) => state.sendPusherEvent);
  const addParticipant = useParticipantStore((state) => state.addParticipant);

  return useFormik({
    validationSchema,
    initialValues: {
      username,
    },
    onSubmit: async (values, form) => {
      setUsername(values.username);

      const { privateKey, publicKey } = await generateKey({
        type: "ecc",
        curve: "curve25519",
        userIDs: [{ name: values.username }],
        format: "object",
      });

      setMyKeys({
        public: publicKey,
        private: privateKey,
      });

      sendPusherEvent({
        type: "introduction",
        participant: {
          username: values.username,
          publicKey: publicKey.armor(),
        },
      });

      addParticipant({
        isMe: true,
        username: values.username,
        publicKey: publicKey,
        trustLevel: "trusted",
      });

      form.resetForm();
    },
  });
};

const validationSchema = toFormikValidationSchema(
  z.object({
    username: z
      .string({
        required_error: "Username is required",
        invalid_type_error: "Username must be a string",
      })
      .min(3, "Username must be at least 3 characters long")
      .max(20, "Username must be at most 20 characters long"),
  }),
);
