import * as React from "react";

import { cn } from "./lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
};

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "default" && "bg-slate-900 text-white hover:bg-slate-800",
        variant === "secondary" &&
          "bg-slate-100 text-slate-900 hover:bg-slate-200",
        variant === "outline" && "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
        variant === "ghost" && "bg-transparent text-slate-700 hover:bg-slate-100",
        size === "default" && "px-4 py-2 text-sm",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "icon" && "h-10 w-10 shrink-0 p-0",
        className,
      )}
      {...props}
    />
  );
}
