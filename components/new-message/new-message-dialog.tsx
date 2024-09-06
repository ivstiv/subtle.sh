"use client";
import { type ReactNode, useMemo, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Step1 } from "./step-1";
import { Participants } from "../participants";
import { useParticipantStore } from "@/data/participant-store";
import { useGlobalStore } from "@/data/global-store";
import { useNewMessageForm } from "./use-new-message-form";

type Props = {
  trigger: ReactNode;
  existingMessageId?: string;
};
export const NewMessageDialog = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<keyof typeof steps>("secretInput");
  const CurrentStep = useMemo(() => steps[step].component, [step]);
  const participants = useParticipantStore((state) => state.participants);
  const myKeys = useGlobalStore((state) => state.myKeys);

  const isActionDisabled = useMemo(() => {
    // enable the action, so the user can continue to selecting participants
    // bit of a hack, but it works for now
    if (step !== "selectParticipants") {
      return false;
    }

    // disable submit if there are no trusted participants
    if (myKeys.public === undefined) {
      return true;
    }
    const myFingerprint = myKeys.public.getFingerprint();
    // disable submit if there are no trusted participants
    return (
      participants
        .filter(
          (participant) =>
            participant.publicKey.getFingerprint() !== myFingerprint,
        )
        .filter((participant) => participant.trustLevel === "trusted")
        .length === 0
    );
  }, [participants, myKeys, step]);

  const form = useNewMessageForm({
    existingMessageId: props.existingMessageId,
    onSucessfulSubmit: () => {
      setStep("secretInput");
      setIsOpen(false);
    },
  });

  const errors = useMemo(() => {
    return Object.values(form.errors).filter(Boolean);
  }, [form.errors]);

  const isPrimaryBtnDisabled =
    form.isSubmitting || // while loading
    !form.isValid || // when the form is invalid
    errors.length > 0 || // when missing fields
    isActionDisabled; // when no trusted participants

  const titleData = useMemo(() => {
    return {
      currentStep: Object.keys(steps).findIndex((key) => key === step) + 1,
      totalSteps: Object.keys(steps).length,
    };
  }, [step]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Step ${titleData.currentStep} of ${titleData.totalSteps}`}</DialogTitle>
          <DialogDescription>{steps[step].description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit}>
          <CurrentStep form={form} />
          {isActionDisabled && (
            <p className="text-sm font-semibold text-destructive">
              You need to trust at least one other participant to send a secret.
            </p>
          )}
          <DialogFooter className="mt-4">
            <Button
              onClick={() => setStep(getPreviousStep)}
              disabled={titleData.currentStep === 1}
              variant="secondary"
            >
              Back
            </Button>
            <Button
              type={
                titleData.currentStep === titleData.totalSteps
                  ? "submit"
                  : "button"
              }
              onClick={(e) => {
                if (titleData.currentStep !== titleData.totalSteps) {
                  e.preventDefault();
                  return setStep(getNextStep);
                }
              }}
              disabled={isPrimaryBtnDisabled}
            >
              {steps[step].buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const steps = {
  secretInput: {
    description: "Set label and content for the secret.",
    component: Step1,
    buttonText: "Continue",
  },
  selectParticipants: {
    description: "Make sure the correct participants are selected!",
    component: Participants,
    buttonText: "Send",
  },
};

const getNextStep = (step: keyof typeof steps) => {
  if (step === "secretInput") {
    return "selectParticipants" as const;
  }
  return "secretInput" as const;
};

const getPreviousStep = (step: keyof typeof steps) => {
  if (step === "selectParticipants") {
    return "secretInput" as const;
  }
  return "selectParticipants" as const;
};
