"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Cog } from "lucide-react";
import { Trash2 } from "lucide-react";
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { env } from "@/env";
import { toast } from "./ui/use-toast";
import { isServerDefault, useGlobalStore } from "@/data/global-store";
import { waitCheckServer } from "@/lib/pusher";
import Link from "next/link";

type Server = {
  domain: string;
  appKey: string;
};

const defaultServer: Server = {
  domain: env.NEXT_PUBLIC_WEBSOCKET_HOST,
  appKey: env.NEXT_PUBLIC_WEBSOCKET_APP_KEY,
};

export const SettingsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    servers,
    selectedServer,
    addServer,
    removeServer,
    setSelectedServer,
  } = useGlobalStore();

  const handleRemoveServer = (domain: string) => {
    removeServer(domain);
    setSelectedServer(defaultServer.domain);
  };

  const form = useServerForm({
    onSuccess: (newServer) => {
      addServer(newServer);
      toast({
        title: "Server added",
        description: "You can now use this server to connect",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon">
          <Cog className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup
            value={selectedServer}
            onValueChange={setSelectedServer}
            className="grid gap-2"
          >
            {servers.map((server, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={server.domain} id={server.domain} />
                <Label htmlFor={server.domain}>
                  {server.domain} {isServerDefault(server) ? "(Public)" : ""}
                </Label>
                {!isServerDefault(server) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveServer(server.domain)}
                    className="ml-auto p-0"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </RadioGroup>
          <form onSubmit={form.handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="domain">Server Domain</Label>
              <Input
                id="domain"
                value={form.values.domain}
                onChange={form.handleChange}
                disabled={form.isSubmitting}
              />
              <p className={cn("text-sm font-semibold text-destructive")}>
                {form.errors.domain}
              </p>
            </div>
            <div>
              <Label htmlFor="appKey">App Key</Label>
              <Input
                id="appKey"
                value={form.values.appKey}
                onChange={form.handleChange}
                disabled={form.isSubmitting}
              />
              <p className={cn("text-sm font-semibold text-destructive")}>
                {form.errors.appKey}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              To learn more about setting up your own server{" "}
              <Link
                className="text-primary underline"
                href="https://github.com/ivstiv/subtle.sh/tree/main/docs/self-host-soketi"
                target="_blank"
              >
                click here
              </Link>
              .
            </p>
            <Button type="submit" disabled={form.isSubmitting}>
              Add Server
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const useServerForm = ({
  onSuccess,
}: {
  onSuccess: (newServer: Server) => void;
}) => {
  return useFormik({
    validationSchema,
    initialValues: {
      domain: "",
      appKey: "",
    },
    onSubmit: async (values, form) => {
      form.setFieldError("domain", "Couldn't connect to server: asd");
      const serverResponse = await waitCheckServer(values);
      if (serverResponse.isErr()) {
        form.setFieldError("domain", serverResponse.error);
        return;
      }
      onSuccess(values);
      form.resetForm();
    },
  });
};

const validationSchema = toFormikValidationSchema(
  z.object({
    domain: z
      .string({
        required_error: "Domain is required",
        invalid_type_error: "Domain must be a string",
      })
      .min(1, "Domain cannot be empty")
      .refine(
        (value) => {
          const storedServers = localStorage.getItem("servers");
          const servers = storedServers
            ? [defaultServer, ...(JSON.parse(storedServers) as Server[])]
            : [defaultServer];
          return !servers.some((server) => server.domain === value);
        },
        {
          message: "Server already exists",
        },
      ),
    appKey: z
      .string({
        required_error: "App Key is required",
        invalid_type_error: "App Key must be a string",
      })
      .min(1, "App Key cannot be empty"),
  }),
);
