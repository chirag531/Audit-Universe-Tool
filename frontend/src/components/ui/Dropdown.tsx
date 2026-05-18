import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DropdownItem {
  key: string;
  label: string;
  onSelect: () => void;
  danger?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  menuLabel?: string;
}

export function Dropdown({ trigger, items, align = "right", menuLabel = "Menu" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnId = useId();
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={rootRef}>
      <button
        id={btnId}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="inline-flex"
        onClick={() => setOpen((v) => !v)}
      >
        {trigger}
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={menuLabel}
          className={cn(
            "absolute z-40 mt-1 min-w-[10rem] rounded-md border border-slate-200 bg-white py-1 shadow-card-md",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((it) => (
            <button
              key={it.key}
              type="button"
              role="menuitem"
              className={cn(
                "flex w-full items-center px-3 py-2 text-left text-sm hover:bg-slate-50 focus:bg-slate-50 focus:outline-none",
                it.danger ? "text-red-700" : "text-slate-800"
              )}
              onClick={() => {
                it.onSelect();
                setOpen(false);
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
