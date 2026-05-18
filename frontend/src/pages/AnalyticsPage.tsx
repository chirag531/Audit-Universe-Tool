import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import toast from "react-hot-toast";
import * as auditApi from "@/services/auditService";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";

function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown";
  return d.toISOString().slice(0, 10);
}

export function AnalyticsPage() {
  const { role } = useAuth();
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [chartData, setChartData] = useState<{ day: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const s = await auditApi.stats();
        setActiveCount(typeof s?.activeCount === "number" ? s.activeCount : 0);
        const rows = await auditApi.listAudits("");
        const buckets: Record<string, number> = {};
        for (const r of rows) {
          const k = dayKey(r.createdAt);
          buckets[k] = (buckets[k] || 0) + 1;
        }
        setChartData(
          Object.entries(buckets)
            .map(([day, count]) => ({ day, count }))
            .sort((a, b) => a.day.localeCompare(b.day))
        );
      } catch {
        toast.error("Failed to load analytics");
        setActiveCount(0);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isAdmin = useMemo(() => role === "ROLE_ADMIN", [role]);

  const onExport = async () => {
    try {
      await auditApi.exportAuditsCsv();
      toast.success("CSV export started");
    } catch {
      toast.error("Export failed (admin only)");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Analytics</h1>
          <p className="mt-1 text-sm text-slate-600">Volume trends and administrator exports.</p>
        </div>
        {isAdmin ? <Badge tone="info">Administrator</Badge> : null}
      </div>

      <Card>
        <CardHeader title="Active register" description="Items currently counted as active by the API." />
        <CardContent>
          {loading || activeCount === null ? (
            <Skeleton className="h-8 w-24 rounded-md" />
          ) : (
            <p className="text-3xl font-semibold tracking-tight text-slate-900">{activeCount}</p>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Items created by day" description="Based on the loaded audit list." />
        <CardContent className="h-72 p-2">
          {loading ? (
            <Skeleton className="h-full w-full rounded-lg" />
          ) : chartData.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No chart data.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} width={36} />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Exports" description="CSV includes all active rows for administrators." />
        <CardContent className="flex flex-wrap gap-2">
          {isAdmin ? (
            <Button type="button" onClick={() => void onExport()}>
              Download CSV
            </Button>
          ) : (
            <p className="text-sm text-slate-600">CSV export is limited to administrators.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
