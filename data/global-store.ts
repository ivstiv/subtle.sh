import { IS_SERVER } from "@/lib/utils";
import type { PrivateKey, PublicKey } from "openpgp";
import type { Channel } from "pusher-js";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { PusherEvent } from "@/lib/pusher";
import { initialisePusher } from "@/lib/pusher";
import { env } from "@/env";
import { useMemo } from "react";

export type Server = {
  domain: string;
  appKey: string;
};

export const defaultServer: Server = {
  domain: env.NEXT_PUBLIC_WEBSOCKET_HOST,
  appKey: env.NEXT_PUBLIC_WEBSOCKET_APP_KEY,
};

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
    servers: IS_SERVER
      ? [defaultServer]
      : [
          defaultServer,
          ...(JSON.parse(localStorage.getItem("servers") ?? "[]") as Server[]),
        ],
    selectedServer: IS_SERVER
      ? defaultServer.domain
      : (localStorage.getItem("selectedServer") ?? defaultServer.domain),
    addServer: (newServer) => {
      if (!IS_SERVER) {
        const currentServers = get().servers;
        const updatedServers = [...currentServers, newServer];
        localStorage.setItem("servers", JSON.stringify(updatedServers));
      }
      set((state) => ({ servers: [...state.servers, newServer] }));
    },
    removeServer: (domain) => {
      if (!IS_SERVER) {
        const currentServers = get().servers;
        const updatedServers = currentServers.filter(
          (s: Server) => s.domain !== domain,
        );
        localStorage.setItem("servers", JSON.stringify(updatedServers));
      }
      set((state) => ({
        servers: state.servers.filter((s) => s.domain !== domain),
      }));
    },
    setSelectedServer: (domain: string) => {
      if (!IS_SERVER) {
        localStorage.setItem("selectedServer", domain);
      }
      set((state) => ({ ...state, selectedServer: domain }));
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
  servers: Server[];
  selectedServer: string;
  addServer: (server: Server) => void;
  removeServer: (domain: string) => void;
  setSelectedServer: (domain: string) => void;
};

export const useCurrentServer = () => {
  const selectedServer = useGlobalStore((state) => state.selectedServer);
  const servers = useGlobalStore((state) => state.servers);
  return useMemo(() => {
    return servers.find((s) => s.domain === selectedServer) ?? defaultServer;
  }, [selectedServer, servers]);
};

export const isServerDefault = (server: Server) => {
  return server.domain === defaultServer.domain;
};
