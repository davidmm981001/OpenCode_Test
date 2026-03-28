import { getBaseURL } from "@/client/utils";

export const StatusBar = ({ configured }: { configured: boolean }) => {
  const chatUrl =
    process.env.NEXT_PUBLIC_CHAT_URL ||
    (typeof window !== "undefined" && window.location.port === "3001"
      ? "http://localhost:3000/"
      : "/");

  return (
    <div className="w-full items-center flex justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 px-4 py-3 shadow-sm">
      <p className="font-mono text-sm text-slate-700">
        {configured ? (
          <>
            <b>Configure agents, add knowledge</b>&nbsp;or&nbsp;
            <b>test the chat</b>&nbsp;below. Once you&apos;re satisfied,&nbsp;
            <a
              className="text-sky-700 hover:underline decoration-sky-700"
              href={getBaseURL()}
              target="_blank"
            >
              start the app
            </a>
            &nbsp;or&nbsp;
            <a
              className="text-sky-700 hover:underline decoration-sky-700"
              href={`${getBaseURL()}/docs`}
              target="_blank"
            >
              use the API
            </a>
            .
          </>
          ) : (
          <>
            Get started by updating the&nbsp;
            <code className="font-mono font-bold">OpenAI API Key</code>
          </>
        )}
      </p>
      <a
        href={chatUrl}
        className="shrink-0 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
      >
        Abrir chat
      </a>
    </div>
  );
};
