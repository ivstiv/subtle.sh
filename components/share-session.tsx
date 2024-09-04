"use client";
import { ClipboardCopy } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";
import { useQRCode } from "next-qrcode";
import { toast } from "./ui/use-toast";
import { IS_SERVER } from "@/lib/utils";

export const ShareSession = () => {
  const { Canvas } = useQRCode();

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">Invite</h1>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mr-1"
          onClick={async () => {
            await navigator.clipboard.writeText(window.location.href);
            toast({
              title: "Link copied to your clipboard!",
              description:
                "Share this link with someone to invite them to the session.",
            });
          }}
        >
          <span className="sr-only">Refresh participants</span>
          <ClipboardCopy className="size-4" />
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardDescription>
            Share this session with someone by sending the link or showing the
            QR code.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Canvas
            text={IS_SERVER ? "" : window.location.href}
            options={{
              errorCorrectionLevel: "L",
              margin: 2,
              scale: 5,
              color: {
                dark: "#000",
                light: "#fff",
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};
