"use client";

import { useMemo, useState } from "react";

import Header from "./header";
import ChatAvatar from "./ui/chat/chat-avatar";
import RagUploadPanel from "./ui/chat/RagUploadPanel";
import ChatInput from "./ui/chat/chat-input";
import { useClientConfig } from "./ui/chat/hooks/use-config";

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
  const api = useMemo(
    () => `${backend || "http://localhost:8000"}/api/chat`,
    [backend],
  );

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
    <main className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#ffffff,_#f8fafc_30%,_#eef2ff_56%,_#e2e8f0_100%)] p-4 text-slate-900 sm:p-6">
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle,_rgba(15,23,42,0.08)_0%,_transparent_65%)]" />
      <div className="absolute left-0 top-24 -z-10 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
      <div className="absolute right-0 top-40 -z-10 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col gap-5 pb-6 sm:min-h-[calc(100vh-3rem)] sm:pb-8">
        <Header />

        <section className="grid gap-4 rounded-[2rem] border border-slate-200/70 bg-white/65 p-4 shadow-2xl shadow-slate-200/50 backdrop-blur-md sm:grid-cols-[1.15fr_0.85fr] sm:p-6">
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
              Chat local + RAG + contexto temporal
            </div>
            <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Interfaz NexTI para hablar con tus datos sin perder el estilo.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Sube documentos al RAG, carga archivos locales para el mensaje actual y usa el modelo gpt 5.4 con ventana de 1M.
            </p>
          </div>

          <div className="grid gap-3 sm:self-end">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Estado</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Conectado a {backend || "http://localhost:8000"}</p>
            </div>
            <div className="rounded-2xl border border-slate-900/10 bg-slate-950 p-4 text-white shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-300">Modelo</p>
              <p className="mt-1 text-sm font-semibold">gpt-5.4</p>
              <p className="text-xs text-slate-300">OpenAI · 1,048,576 tokens</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200/70 bg-white/88 shadow-2xl shadow-slate-200/60 backdrop-blur-sm">
          <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
            <p className="text-sm font-semibold text-slate-900">Conversación</p>
            <p className="text-xs text-slate-500">
              Envía el mensaje con Enter. Shift+Enter agrega una nueva línea.
            </p>
          </div>

          <div className="max-h-[52vh] overflow-y-auto px-4 py-5 sm:px-6">
            {displayedMessages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-[linear-gradient(180deg,_rgba(248,250,252,0.95),_rgba(241,245,249,0.95))] p-6 text-sm text-slate-500">
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
                      className={`min-w-0 flex-1 rounded-2xl p-4 text-sm leading-6 whitespace-pre-wrap shadow-sm ${
                        message.role === "user"
                          ? "border border-sky-200 bg-sky-50/90 text-slate-900"
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
                    <div className="min-w-0 flex-1 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
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
