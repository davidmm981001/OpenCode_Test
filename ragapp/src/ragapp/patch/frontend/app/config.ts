export const appConfig = {
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
  useLlamaCloud: process.env.NEXT_PUBLIC_USE_LLAMACLOUD === "true",
};
