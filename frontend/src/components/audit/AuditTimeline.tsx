import { formatDateTime } from "@/lib/format";

export interface AuditTimelineEntry {
  id: string;
  title: string;
  detail: string;
  at: string;
}

export interface AuditTimelineProps {
  entries: AuditTimelineEntry[];
}

export function AuditTimeline({ entries }: AuditTimelineProps) {
  return (
    <ol className="relative border-l border-slate-200 pl-6">
      {entries.map((e) => (
        <li key={e.id} className="mb-8 ml-1 last:mb-0">
          <span className="absolute -left-[7px] mt-1.5 flex h-3 w-3 items-center justify-center rounded-full border border-white bg-primary-600 ring-2 ring-primary-100" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">{e.title}</p>
            <p className="text-xs text-slate-500">{formatDateTime(e.at)}</p>
            <p className="text-sm text-slate-600">{e.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
