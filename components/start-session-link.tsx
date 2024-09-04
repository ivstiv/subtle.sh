"use client";
import { v4 } from "uuid";
import { buttonVariants } from "./ui/button";
import { useEffect, useState } from "react";

// needs to be client side id generation, so we get a unique one on client router
// needs to also match what was rendered on the server...
export const StartSessionLink = () => {
  const [id, setId] = useState("");
  useEffect(() => setId(v4()), []);
  const isReady = id.length > 0;

  // can't use next's Link because
  // it doesn't update window.loation before the first render
  // so we can't use the id to connect to ws
  return (
    <a
      href={`/session?id=${id}`}
      className={buttonVariants({
        variant: !isReady ? "disabled" : "default",
      })}
      aria-disabled={!isReady}
      tabIndex={!isReady ? -1 : undefined}
    >
      Start a new session 🤫
    </a>
  );
};
