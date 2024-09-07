"use client";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { StartSessionLink } from "@/components/start-session-link";
import { Icons } from "@/components/icons";
import { SettingsModal } from "@/components/settings-modal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="mx-auto flex size-64 items-center justify-center">
          <Icons.logo4 />
        </div>
        <h1 className="text-center text-2xl leading-tight tracking-tighter">
          Send encrypted messages without leaving a trace.
        </h1>

        <div className="m-auto flex gap-2">
          <Link
            className={buttonVariants({
              variant: "secondary",
            })}
            href={siteConfig.links.github}
            target="_blank"
          >
            <Icons.gitHub className="size-4" />
          </Link>
          <StartSessionLink />
          <SettingsModal />
        </div>
        <ul className="m-auto my-8 flex max-w-[789px] flex-col gap-3 font-semibold opacity-50">
          <li className="text-left">
            <HoverCard>
              <HoverCardTrigger className="text-lg underline underline-offset-8 hover:cursor-pointer">
                One click setup for quick sharing
              </HoverCardTrigger>
              <HoverCardContent className="text-center">
                No account or settings to fiddle with. Just share a link.
              </HoverCardContent>
            </HoverCard>
          </li>
          <li className="text-center">
            <HoverCard>
              <HoverCardTrigger className="text-lg underline underline-offset-8 hover:cursor-pointer">
                MiLiTaRy GrAdE pOsT qUaNtUm CrYpToGrApHy (good ol&apos; PGP)
              </HoverCardTrigger>
              <HoverCardContent className="text-center">
                No really, that&apos;s all there is. It&apos;s just a PGP client
                with in-memory keys.
              </HoverCardContent>
            </HoverCard>
          </li>
          <li className="text-right">
            <HoverCard>
              <HoverCardTrigger className="text-lg underline underline-offset-8 hover:cursor-pointer">
                Bring your own backend
              </HoverCardTrigger>
              <HoverCardContent className="text-center">
                Simple by design, no history or persistence.
              </HoverCardContent>
            </HoverCard>
          </li>
        </ul>
      </section>
    </QueryClientProvider>
  );
}
