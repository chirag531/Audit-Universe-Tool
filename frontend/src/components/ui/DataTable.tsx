import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  empty?: ReactNode;
  rowClassName?: string | ((row: T) => string);
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onSort,
  sortKey,
  sortDir,
  empty,
  rowClassName,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">{empty}</div>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn("px-4 py-3 font-semibold text-slate-700", c.className)}>
                {c.sortable && onSort ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-left hover:bg-slate-100 focus-visible:focus-ring"
                    onClick={() => onSort(c.key)}
                  >
                    {c.header}
                    {sortKey === c.key ? <span className="text-xs text-slate-500">{sortDir === "asc" ? "▲" : "▼"}</span> : null}
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={cn(
                "transition-colors hover:bg-slate-50/80",
                typeof rowClassName === "function" ? rowClassName(row) : rowClassName
              )}
            >
              {columns.map((c) => (
                <td key={c.key} className={cn("whitespace-nowrap px-4 py-3 text-slate-800", c.className)}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
