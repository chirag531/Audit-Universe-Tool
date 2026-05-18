import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trendPct: number;
  trendLabel?: string;
}

export function KpiCard({ title, value, icon: Icon, trendPct, trendLabel = "vs last period" }: KpiCardProps) {
  const up = trendPct >= 0;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
            <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
            <p className={cn("inline-flex items-center gap-1 text-xs font-medium", up ? "text-emerald-700" : "text-red-700")}>
              {up ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />}
              {Math.abs(trendPct)}% {trendLabel}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
