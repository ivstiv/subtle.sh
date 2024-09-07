import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const IS_SERVER = typeof window === "undefined";

export const isErrorWithMessage = (
  error: unknown,
): error is { message: string } => {
  return typeof error === "object" && error !== null && "message" in error;
};

type WebSocketError = {
  type: string;
  error: {
    type: string;
    data: {
      code: number;
      message: string;
    };
  };
};

export const isWebSocketError = (error: unknown): error is WebSocketError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    "error" in error
  );
};
