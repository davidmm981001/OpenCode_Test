import Image from "next/image";

export default function Header() {
  return (
    <div className="flex w-full items-center justify-between gap-4 rounded-full border border-slate-200/70 bg-white/90 px-4 py-3 shadow-lg shadow-slate-200/50 backdrop-blur-sm sm:px-5">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-slate-950 px-3 py-2 shadow-sm ring-1 ring-slate-900/10">
          <Image
            src="/logo.png"
            alt="RAGapp Logo"
            width={108}
            height={34}
            priority
          />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide text-slate-900">
            NexTI RAG Lab
          </p>
          <p className="text-xs text-slate-500">
            Chat, RAG y archivos locales en un solo lugar.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <a
          href="http://localhost:3001/admin"
          className="hidden rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:block"
        >
          Ir a admin
        </a>
        <a
          href="http://localhost:3000"
          className="hidden rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:block"
        >
          Ir al chat
        </a>
        <div className="hidden rounded-full bg-gradient-to-r from-slate-100 to-sky-50 px-3 py-1 text-xs font-medium text-slate-600 sm:block">
          gpt-5.4 · 1M context
        </div>
      </div>
    </div>
  );
}
