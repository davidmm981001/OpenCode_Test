import type { CSSProperties, ReactNode } from "react";

/**
 * Exact gradient + mesh from Nextitestingplatform/src/app/components/layout/Sidebar.tsx
 */
const meshStyle: CSSProperties = {
  backgroundImage: `
    radial-gradient(ellipse 80% 50% at 20% 20%, rgba(88,184,136,0.12) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 80% 80%, rgba(99,102,241,0.08) 0%, transparent 50%),
    radial-gradient(ellipse 50% 60% at 50% 50%, rgba(88,184,136,0.05) 0%, transparent 60%)
  `,
  backgroundSize: "100% 100%",
};

export function NexTiHeaderChrome({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="relative w-full shrink-0 overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#202950] via-[#1a2242] to-[#131a35]" />
      {/* Mesh overlay */}
      <div className="pointer-events-none absolute inset-0" style={meshStyle} />
      {/* Glass highlight — right edge */}
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
      {/* Ambient glow top-left */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#58B888]/10 blur-3xl" />
      {/* Ambient glow bottom-right */}
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[#6366f1]/8 blur-3xl" />

      <div className="relative z-10 flex w-full items-center justify-between gap-3 px-5 py-4 text-white">
        {left}
        {right}
      </div>
    </div>
  );
}
