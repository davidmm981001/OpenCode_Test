export const appConfig = {
  /** Wordmark line (matches NexTI Testing Platform header) */
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME ?? "NexTI",
  companyLine:
    process.env.NEXT_PUBLIC_COMPANY_LINE ?? "RAG Lab",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "NexTI RAG Lab",
  appSubtitle:
    process.env.NEXT_PUBLIC_APP_SUBTITLE ??
    "Chat, RAG y archivos locales en un solo lugar.",
  modelName: process.env.NEXT_PUBLIC_MODEL ?? "gpt-5.4",
  modelProvider: process.env.NEXT_PUBLIC_MODEL_PROVIDER ?? "openai",
  modelProviderLabel:
    process.env.NEXT_PUBLIC_MODEL_PROVIDER_LABEL ?? "OpenAI",
  modelContextWindow:
    Number(process.env.NEXT_PUBLIC_MODEL_CONTEXT_WINDOW ?? "1048576") || 1048576,
  backendUrl:
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_CHAT_API ??
    "http://localhost:8000",
  /** Admin UI: same origin when served with FastAPI (e.g. /admin on :8000). Override for split dev servers. */
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL ?? "/admin",
  /** Chat UI entry: root when bundled with the API; override if chat dev server is another port. */
  chatUrl: process.env.NEXT_PUBLIC_CHAT_URL ?? "/",
  useLlamaCloud: process.env.NEXT_PUBLIC_USE_LLAMACLOUD === "true",
  /** Public path to the NexTI logo (copied from Nextitestingplatform/public/logo-nexti.png). */
  logoPath: process.env.NEXT_PUBLIC_LOGO_PATH ?? "/logo-nexti.png",
};
