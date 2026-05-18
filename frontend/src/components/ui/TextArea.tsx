import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  maxLength?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { id, label, error, maxLength, className, value, onChange, ...props },
  ref
) {
  const inputId = id ?? label.replace(/\s+/g, "-").toLowerCase();
  const len = typeof value === "string" ? value.length : 0;
  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        {maxLength != null ? (
          <span className="text-xs text-slate-500" aria-live="polite">
            {len}/{maxLength}
          </span>
        ) : null}
      </div>
      <textarea
        ref={ref}
        id={inputId}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        className={cn(
          "block min-h-[120px] w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600/25",
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-primary-600",
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-err` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-err`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
