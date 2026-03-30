"use client";

import { fetchIsAppConfigured } from "@/client/config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { AgentConfig } from "@/sections/config/agent";
import { ChatConfig } from "@/sections/config/chat";
import { ModelConfig } from "@/sections/config/model";
import { NexTiHeaderChrome } from "@/components/nexti-header-chrome";
import { DemoChat } from "@/sections/demoChat";
import { Footer } from "@/sections/footer";
import { Knowledge } from "@/sections/knowledge";
import { StatusBar } from "@/sections/statusBar";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [configured, setConfigured] = useState<boolean>();

  useEffect(() => {
    if (router.asPath.split("#")[1] === "new") {
      setShowWelcome(true);
    }
  }, [router.asPath]);

  useEffect(() => {
    if (configured === undefined) {
      fetchIsAppConfigured().then((data) => {
        setConfigured(data);
      });
    }
  }, [configured]);

  function handleDialogState(isOpen: boolean) {
    setShowWelcome(isOpen);
    if (!isOpen) {
      if (window.location.hash === "#new") {
        window.history.pushState({}, document.title, window.location.pathname);
      }
    }
  }

  function handleModelConfigChange() {
    // Fetch the app configuration again to update the state
    fetchIsAppConfigured().then((data) => {
      setConfigured(data);
    });
  }

  return (
    <>
      <main className="nexti-admin-shell h-screen w-screen">
        <div className="flex max-h-full h-full flex-col">
          <NexTiHeaderChrome
            left={
              <div className="flex items-center gap-2">
                {/* Logo — same markup as Sidebar.tsx */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-nexti.png"
                    alt="NexTI"
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <div>
                  <div
                    className="text-sm leading-tight text-white"
                    style={{ fontWeight: 700, letterSpacing: "0.06em" }}
                  >
                    NexTI
                  </div>
                  <div
                    className="uppercase leading-tight tracking-wider"
                    style={{ color: "rgba(255,255,255,0.45)", fontWeight: 500, fontSize: "0.6rem" }}
                  >
                    RAG Lab
                  </div>
                </div>
              </div>
            }
            right={
              <div className="flex shrink-0 items-center gap-2">
                {/* Chat static app is at site root; not a page in this Next app (basePath /admin). */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/"
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-white/90 transition"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  Ir al chat
                </a>
                <Link
                  href="/"
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-white/90 transition"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  Recargar
                </Link>
              </div>
            }
          />
          <div className="w-full shrink-0">
            <StatusBar configured={configured ?? false} />
          </div>
          <div className="w-full flex-1 overflow-auto flex">
            <div
              className={cn("w-1/2 overflow-y-auto p-4", {
                "m-auto": !configured,
              })}
            >
              {configured && (
                <>
                  <AgentConfig />
                  <Knowledge />
                  <ChatConfig />
                </>
              )}
              <ModelConfig
                sectionTitle={configured ? "Update model" : "Start"}
                sectionDescription={
                  configured
                    ? "Change to a different model or use another provider"
                    : "Set up an AI model to start the app."
                }
                configured={configured}
                onConfigChange={handleModelConfigChange}
              />
            </div>
            {configured && (
              <div className="flex-1 overflow-y-auto p-4">
                <DemoChat />
              </div>
            )}
          </div>
          <div className="w-full shrink-0">
            <Footer />
          </div>
        </div>
      </main>
      <Toaster />
      <Dialog open={showWelcome} onOpenChange={handleDialogState}>
        <DialogContent>
          <DialogTitle className="text-green-500">
            Congratulations 🎉
          </DialogTitle>
          <DialogDescription>
            You have successfully installed RAGapp. Now, let&apos;s go ahead and
            configure it.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
