import type { Key } from "openpgp";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useParticipantStore = create<GlobalStore>()(
  devtools(
    (set, get) => ({
      participants: [],
      rememberedParticipants: {},
      addParticipant: (participant) => {
        // don't add duplicate participants
        const participantExists = get().participants.some(
          (p) =>
            p.publicKey.getFingerprint() ===
            participant.publicKey.getFingerprint(),
        );
        if (participantExists) {
          return;
        }

        // check the trust level if the user re-introduces themselves
        const previouslyRememberedTrust =
          get().rememberedParticipants[participant.publicKey.getFingerprint()];
        set((state) => ({
          ...state,
          participants: [
            ...state.participants,
            {
              ...participant,
              trustLevel: previouslyRememberedTrust ?? participant.trustLevel,
            },
          ].sort((a, b) => a.username.localeCompare(b.username)),
        }));
      },
      removeParticipant: (fingerprint) => {
        set((state) => ({
          ...state,
          participants: state.participants
            .filter((p) => {
              return p.publicKey.getFingerprint() !== fingerprint;
            })
            .sort((a, b) => a.username.localeCompare(b.username)),
        }));
      },
      setTrustLevel: (fingerprint, trustLevel) => {
        set((state) => ({
          ...state,
          participants: state.participants.map((p) => {
            if (p.publicKey.getFingerprint() === fingerprint) {
              return {
                ...p,
                trustLevel,
              };
            }

            return p;
          }),
        }));
        // remember the trust level if the user re-introduces themselves
        set((state) => ({
          ...state,
          rememberedParticipants: {
            ...state.rememberedParticipants,
            [fingerprint]: trustLevel,
          },
        }));
      },
      removeAllParticipantsExceptMe: () => {
        set((state) => ({
          ...state,
          participants: state.participants.filter((p) => p.isMe),
        }));
      },
    }),
    {
      name: "participant-store",
    },
  ),
);

type GlobalStore = {
  participants: Participant[];
  rememberedParticipants: Record<string, Participant["trustLevel"]>;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (fingerprint: string) => void;
  setTrustLevel: (
    fingerprint: string,
    trustStatus: Participant["trustLevel"],
  ) => void;
  removeAllParticipantsExceptMe: () => void;
};

export type Participant = {
  username: string;
  publicKey: Key;
  isMe: boolean;
  trustLevel: "trusted" | "untrusted" | "blocked";
};
