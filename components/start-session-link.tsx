"use client";
import { v4 } from "uuid";
import { buttonVariants } from "./ui/button";
import { useEffect, useMemo, useState } from "react";
import { isServerDefault, useCurrentServer } from "@/data/global-store";
import { useServerStatus } from "@/lib/pusher";
import { toast } from "./ui/use-toast";

// needs to be client side id generation, so we get a unique one on client router
// needs to also match what was rendered on the server...
export const StartSessionLink = () => {
  const [id, setId] = useState("");
  // using a useEffect, so we don't get a hydration error
  useEffect(() => setId(v4()), []);

  const currentServer = useCurrentServer();
  const serverStatus = useServerStatus(currentServer);
  const href = useMemo(() => {
    if (serverStatus.isLoading) {
      return "#";
    }
    if (serverStatus.data === "offline") {
      return "#";
    }
    if (isServerDefault(currentServer)) {
      return `/session?id=${id}`;
    }
    const url = new URL("/session", window.location.origin);
    url.searchParams.set("id", id);
    url.searchParams.set("domain", currentServer.domain);
    url.searchParams.set("appKey", currentServer.appKey);
    return url.toString();
  }, [id, serverStatus.data, serverStatus.isLoading, currentServer]);

  const isBtnEnabled =
    id.length > 0 && serverStatus.isSuccess && serverStatus.data === "online";

  const buttonText = useMemo(() => {
    if (serverStatus.isPending) {
      return "Connecting...";
    }
    if (serverStatus.data === "offline") {
      toast({
        title: "Server is offline",
        description: "Please try again later or select a different server.",
      });
      return "Server is offline";
    }
    return "Start a new session 🤫";
  }, [serverStatus.data, serverStatus.isPending]);

  // can't use next's Link because
  // it doesn't update window.loation before the first render
  // so we can't use the id to connect to ws
  return (
    <a
      href={href}
      className={buttonVariants({
        variant: !isBtnEnabled ? "disabled" : "default",
      })}
      aria-disabled={!isBtnEnabled}
      tabIndex={!isBtnEnabled ? -1 : undefined}
    >
      {buttonText}
    </a>
  );
};
