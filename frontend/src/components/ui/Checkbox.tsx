import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { id, label, className, ...props },
  ref
) {
  const inputId = id ?? `cb-${(label || "option").replace(/\s+/g, "-").toLowerCase()}`;
  const body = (
    <input
      ref={ref}
      id={inputId}
      type="checkbox"
      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-600/30"
      {...props}
    />
  );
  if (!label) {
    return <span className={cn("inline-flex", className)}>{body}</span>;
  }
  return (
    <label htmlFor={inputId} className={cn("inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700", className)}>
      {body}
      {label}
    </label>
  );
});
