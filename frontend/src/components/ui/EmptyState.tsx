import type { ReactNode } from "react";
import { FileQuestion } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <FileQuestion className="h-7 w-7" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-slate-900">{title}</p>
        {description ? <p className="max-w-sm text-sm text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
