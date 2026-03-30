import { getBaseURL } from "@/client/utils";

export const StatusBar = ({ configured }: { configured: boolean }) => {
  const chatUrl =
    process.env.NEXT_PUBLIC_CHAT_URL ||
    (typeof window !== "undefined" && window.location.port === "3001"
      ? "http://localhost:3000/chat"
      : "/");

  return (
    <div className="flex w-full items-center justify-between gap-4 border-b border-border bg-muted/50 px-4 py-3 shadow-sm">
      <p className="font-mono text-sm text-muted-foreground">
        {configured ? (
          <>
            <b className="text-foreground">Configure agents, add knowledge</b>&nbsp;or&nbsp;
            <b className="text-foreground">test the chat</b>&nbsp;below. Once you&apos;re satisfied,&nbsp;
            <a
              className="text-primary hover:underline"
              href={getBaseURL()}
              target="_blank"
              rel="noreferrer"
            >
              start the app
            </a>
            &nbsp;or&nbsp;
            <a
              className="text-primary hover:underline"
              href={`${getBaseURL()}/docs`}
              target="_blank"
              rel="noreferrer"
            >
              use the API
            </a>
            .
          </>
          ) : (
          <>
            Get started by updating the&nbsp;
            <code className="font-mono font-bold text-foreground">OpenAI API Key</code>
          </>
        )}
      </p>
      <a
        href={chatUrl}
        className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent"
      >
        Abrir chat
      </a>
    </div>
  );
};
