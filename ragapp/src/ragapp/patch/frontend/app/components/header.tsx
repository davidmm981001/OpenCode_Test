import type { CSSProperties } from "react";

import { appConfig } from "../config";

/**
 * Exact gradient + mesh from Nextitestingplatform/src/app/pages/Login.tsx (left panel)
 * and src/app/components/layout/Sidebar.tsx
 */
const meshStyle: CSSProperties = {
  backgroundImage: `
    radial-gradient(ellipse 80% 50% at 20% 20%, rgba(88,184,136,0.12) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 80% 80%, rgba(99,102,241,0.08) 0%, transparent 50%),
    radial-gradient(ellipse 50% 60% at 50% 50%, rgba(88,184,136,0.05) 0%, transparent 60%)
  `,
  backgroundSize: "100% 100%",
};

export default function Header() {
  return (
    <header className="relative w-full shrink-0 overflow-hidden" style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.06)" }}>
      {/* Base gradient — identical to Sidebar */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#202950] via-[#1a2242] to-[#131a35]" />
      {/* Mesh overlay */}
      <div className="absolute inset-0" style={meshStyle} />
      {/* Glass highlight right edge */}
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
      {/* Ambient glow top-left */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#58B888]/10 blur-3xl" />
      {/* Ambient glow bottom-right */}
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[#6366f1]/8 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        {/* Logo block — same as Sidebar.tsx logo section */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-nexti.png"
              alt="NexTI"
              className="h-8 w-8 object-contain"
            />
          </div>
          <div>
            <div className="text-sm leading-tight text-white" style={{ fontWeight: 700, letterSpacing: "0.06em" }}>
              {appConfig.companyName}
            </div>
            <div
              className="text-xs uppercase leading-tight tracking-wider"
              style={{ color: "rgba(255,255,255,0.45)", fontWeight: 500, fontSize: "0.6rem" }}
            >
              {appConfig.companyLine}
            </div>
          </div>
        </div>

        {/* Nav pills */}
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={appConfig.adminUrl}
            className="hidden rounded-full px-3 py-1.5 text-xs font-medium text-white/90 transition sm:inline-flex"
            style={{
              backgroundColor: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
            }}
          >
            Admin
          </a>
          <div
            className="hidden max-w-[15rem] truncate rounded-full px-3 py-1.5 text-xs font-medium sm:block"
            style={{
              backgroundColor: "rgba(88,184,136,0.15)",
              border: "1px solid rgba(88,184,136,0.35)",
              color: "#b8f0d4",
            }}
            title={`${appConfig.modelName} · ${new Intl.NumberFormat("es-ES").format(appConfig.modelContextWindow)} tokens`}
          >
            {appConfig.modelName} · {new Intl.NumberFormat("es-ES").format(appConfig.modelContextWindow)} ctx
          </div>
        </div>
      </div>
    </header>
  );
}
