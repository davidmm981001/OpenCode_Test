"use client";

import { useMemo, useState } from "react";

import Header from "./header";
import ChatAvatar from "./ui/chat/chat-avatar";
import RagUploadPanel from "./ui/chat/RagUploadPanel";
import ChatInput from "./ui/chat/chat-input";
import { useClientConfig } from "./ui/chat/hooks/use-config";
import { appConfig } from "../config";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ChatSection() {
  const { backend } = useClientConfig();
  const api = useMemo(() => `${backend || appConfig.backendUrl}/api/chat`, [backend]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAssistantDraft = (content: string) => {
    setMessages((current) => {
      const draftIndex = current.findIndex(
        (message) => message.role === "assistant" && message.content === "...",
      );

      if (draftIndex === -1) {
        return [...current, { id: createId("assistant"), role: "assistant", content }];
      }

      const next = current.slice();
      next[draftIndex] = { ...next[draftIndex], content };
      return next;
    });
  };

  const setAssistantMessage = (content: string) => {
    setMessages((current) => {
      const withoutAssistantDraft = current.filter(
        (message) => !(message.role === "assistant" && message.content === "..."),
      );
      const withoutPreviousAssistant = withoutAssistantDraft.filter(
        (message) => message.role !== "assistant",
      );
      return [...withoutPreviousAssistant, { id: createId("assistant"), role: "assistant", content }];
    });
  };

  const append = async (message: { content: string }) => {
    const userMessage: ChatMessage = {
      id: createId("user"),
      role: "user",
      content: message.content,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((item) => ({
            role: item.role,
            content: item.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setMessages((current) => [
        ...current,
        { id: createId("assistant"), role: "assistant", content: "..." },
      ]);

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("La respuesta no admite streaming");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith("0:")) {
            const payload = trimmed.slice(2);
            try {
              const token = JSON.parse(payload);
              if (typeof token === "string") {
                assistantText += token;
                updateAssistantDraft(assistantText);
              }
            } catch {
              // Ignore malformed token chunks.
            }
          }
        }
      }

      if (!assistantText.trim()) {
        throw new Error("La respuesta llegó vacía");
      }

      setAssistantMessage(assistantText);
    } catch (cause) {
      const messageText = cause instanceof Error ? cause.message : "Error desconocido";
      setError(messageText);
      setMessages((current) => current.filter((message) => message.content !== "..."));
    } finally {
      setIsLoading(false);
    }
  };

  const displayedMessages = messages;

  return (
    <main className="relative min-h-screen overflow-x-hidden p-4 text-slate-900 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col gap-5 pb-6 sm:min-h-[calc(100vh-3rem)] sm:pb-8">
        <Header />

        <section className="grid gap-4 rounded-[var(--radius)] border border-[#202950]/10 bg-white/90 p-4 shadow-[0_12px_40px_rgba(32,41,80,0.08)] backdrop-blur-sm sm:grid-cols-[1.15fr_0.85fr] sm:p-6">
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-[#58B888]/35 bg-[#58B888]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#1a5c40]">
              Chat local + RAG + contexto temporal
            </div>
            <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-[#131a35] sm:text-4xl">
              Interfaz NexTI para hablar con tus datos sin perder el estilo.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Sube documentos al RAG, carga archivos locales para el mensaje actual y usa el modelo gpt 5.4 con ventana de 1M.
            </p>
          </div>

          <div className="grid gap-3 sm:self-end">
            <div className="rounded-[var(--radius)] border border-slate-200/90 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Estado</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Conectado a {backend || appConfig.backendUrl}</p>
            </div>
            <div className="rounded-[var(--radius)] border border-[#202950]/20 bg-gradient-to-br from-[#202950] to-[#131a35] p-4 text-white shadow-sm">
              <p className="text-xs uppercase tracking-wide text-white/55">Modelo</p>
              <p className="mt-1 text-sm font-semibold">{appConfig.modelName}</p>
              <p className="text-xs text-white/70">
                {appConfig.modelProviderLabel} · {new Intl.NumberFormat("es-ES").format(appConfig.modelContextWindow)} tokens
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[var(--radius)] border border-[#202950]/10 bg-white/95 shadow-[0_12px_40px_rgba(32,41,80,0.1)] backdrop-blur-sm">
          <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
            <p className="text-sm font-semibold text-[#131a35]">Conversación</p>
            <p className="text-xs text-slate-500">
              Envía el mensaje con Enter. Shift+Enter agrega una nueva línea.
            </p>
          </div>

          <div className="max-h-[52vh] overflow-y-auto px-4 py-5 sm:px-6">
            {displayedMessages.length === 0 ? (
              <div className="rounded-[var(--radius)] border border-dashed border-[#202950]/15 bg-slate-50/80 p-6 text-sm text-slate-500">
                Escribe una pregunta para empezar.
              </div>
            ) : (
              <div className="space-y-4">
                {displayedMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <ChatAvatar role={message.role} />
                    <div
                      className={`min-w-0 flex-1 rounded-[var(--radius)] p-4 text-sm leading-6 whitespace-pre-wrap shadow-sm ${
                        message.role === "user"
                          ? "border border-[#58B888]/40 bg-[#58B888]/12 text-[#131a35]"
                          : "border border-slate-200 bg-white text-slate-900"
                      }`}
                    >
                      {message.content || <span className="text-slate-400">...</span>}
                    </div>
                  </div>
                ))}
                {isLoading ? (
                  <div className="flex gap-3">
                    <ChatAvatar role="assistant" />
                    <div className="min-w-0 flex-1 rounded-[var(--radius)] border border-dashed border-[#202950]/20 bg-slate-50 p-4 text-sm text-slate-500">
                      Pensando...
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-100 p-4 sm:p-6">
            <ChatInput
              isLoading={isLoading}
              input={input}
              onFileUpload={() => undefined}
              onFileError={() => undefined}
              handleSubmit={() => undefined}
              handleInputChange={(event) => setInput(event.target.value)}
              messages={messages}
              setInput={setInput}
              append={append}
            />
          </div>
        </section>

        <RagUploadPanel backend={backend} />
      </div>
    </main>
  );
}
