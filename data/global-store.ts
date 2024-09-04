import { IS_SERVER } from "@/lib/utils";
import type { PrivateKey, PublicKey } from "openpgp";
import type { Channel } from "pusher-js";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { PusherEvent } from "@/lib/pusher";
import { initialisePusher } from "@/lib/pusher";

export const useGlobalStore = create<GlobalStore>()(
  devtools((set, get) => ({
    channel: initialisePusher(),
    username: IS_SERVER ? "" : (localStorage.getItem("username") ?? ""),
    myKeys: {
      public: undefined,
      private: undefined,
    },
    setUsername: (username) => {
      if (!IS_SERVER) {
        localStorage.setItem("username", username);
      }

      set((state) => ({
        ...state,
        username,
      }));
    },
    setMyKeys: (keys) => {
      set((state) => ({
        ...state,
        myKeys: keys,
      }));
    },
    sendPusherEvent: (event) => {
      return get().channel?.trigger("client-event", event) ?? false;
    },
  })),
);

type GlobalStore = {
  username: string;
  myKeys: {
    public: PublicKey | undefined;
    private: PrivateKey | undefined;
  };
  channel: Channel | undefined;
  sendPusherEvent: (event: PusherEvent) => boolean;
  setUsername: (username: string) => void;
  setMyKeys: (keys: { public: PublicKey; private: PrivateKey }) => void;
};
