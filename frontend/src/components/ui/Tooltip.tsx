import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TooltipProps extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  children: ReactNode;
}

export function Tooltip({ label, children, className, ...props }: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex", className)} {...props}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-md group-hover:block group-focus-within:block"
      >
        {label}
      </span>
    </span>
  );
}
