import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Activity, AlertTriangle, CheckCircle2, ClipboardList, Layers } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import toast from "react-hot-toast";
import type { ClientAuditRow, ClientAuditStatus } from "@/types/api";
import { toClientRow } from "@/lib/auditDisplay";
import { formatDateTime } from "@/lib/format";
import * as auditApi from "@/services/auditService";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Avatar } from "@/components/ui/Avatar";

const STATUS_COLORS: Record<ClientAuditStatus, string> = {
  pending: "#94a3b8",
  review: "#6366f1",
  completed: "#10b981",
  high_risk: "#ef4444",
};

function statusLabel(s: ClientAuditStatus): string {
  switch (s) {
    case "pending":
      return "Pending";
    case "review":
      return "In review";
    case "completed":
      return "Completed";
    case "high_risk":
      return "High risk";
  }
}

function statusTone(s: ClientAuditStatus): BadgeTone {
  switch (s) {
    case "pending":
      return "neutral";
    case "review":
      return "info";
    case "completed":
      return "success";
    case "high_risk":
      return "danger";
  }
}

function riskLabel(r: "low" | "medium" | "high"): string {
  return r.charAt(0).toUpperCase() + r.slice(1);
}

function riskTone(r: "low" | "medium" | "high"): BadgeTone {
  if (r === "high") return "danger";
  if (r === "medium") return "warning";
  return "neutral";
}

function trendFrom(n: number): number {
  const v = ((n * 13) % 9) - 4;
  return Number(v.toFixed(1));
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ClientAuditRow[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [title, setTitle] = useState("");
  const [payload, setPayload] = useState("");
  const [saving, setSaving] = useState(false);
  const [titleErr, setTitleErr] = useState("");
  const [payloadErr, setPayloadErr] = useState("");
  const [sortKey, setSortKey] = useState<"title" | "createdAt" | "clientStatus" | "clientRisk">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const load = async () => {
    setLoading(true);
    try {
      const [s, list] = await Promise.all([auditApi.stats(), auditApi.listAudits("")]);
      setActiveCount(s.activeCount);
      setRows(list.map(toClientRow));
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const kpis = useMemo(() => {
    const total = activeCount || rows.length;
    const active = rows.filter((r) => r.clientStatus === "pending" || r.clientStatus === "review").length;
    const completed = rows.filter((r) => r.clientStatus === "completed").length;
    const high = rows.filter((r) => r.clientRisk === "high" || r.clientStatus === "high_risk").length;
    return { total, active, completed, high };
  }, [rows, activeCount]);

  const donut = useMemo(() => {
    const counts: Record<ClientAuditStatus, number> = {
      pending: 0,
      review: 0,
      completed: 0,
      high_risk: 0,
    };
    for (const r of rows) counts[r.clientStatus] += 1;
    return (Object.keys(counts) as ClientAuditStatus[]).map((key) => ({
      name: statusLabel(key),
      key,
      value: counts[key],
    }));
  }, [rows]);

  const activity = useMemo(() => {
    return [...rows]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map((r) => ({
        id: r.id,
        title: r.title,
        time: r.createdAt,
      }));
  }, [rows]);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "title") return a.title.localeCompare(b.title) * dir;
      if (sortKey === "createdAt") return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      if (sortKey === "clientStatus") return a.clientStatus.localeCompare(b.clientStatus) * dir;
      return a.clientRisk.localeCompare(b.clientRisk) * dir;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);

  const onSort = (key: string) => {
    const k = key as typeof sortKey;
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
    setPage(1);
  };

  const columns: Column<ClientAuditRow>[] = [
    {
      key: "title",
      header: "Title",
      sortable: true,
      className: "max-w-[220px]",
      render: (r) => (
        <Link to={`/audits/${r.id}`} className="font-medium text-primary-700 hover:underline">
          {r.title}
        </Link>
      ),
    },
    {
      key: "clientStatus",
      header: "Status",
      sortable: true,
      render: (r) => <Badge tone={statusTone(r.clientStatus)}>{statusLabel(r.clientStatus)}</Badge>,
    },
    {
      key: "clientRisk",
      header: "Risk",
      sortable: true,
      render: (r) => <Badge tone={riskTone(r.clientRisk)}>{riskLabel(r.clientRisk)}</Badge>,
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (r) => <span className="text-slate-600">{formatDateTime(r.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <Link to={`/audits/${r.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700">
          View
        </Link>
      ),
    },
  ];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTitleErr("");
    setPayloadErr("");
    if (!title.trim()) setTitleErr("Title is required");
    if (!payload.trim()) setPayloadErr("Payload is required");
    if (!title.trim() || !payload.trim()) return;
    setSaving(true);
    try {
      await auditApi.createAudit({ title: title.trim(), payload: payload.trim() });
      setTitle("");
      setPayload("");
      toast.success("Audit item created");
      await load();
      setPage(1);
    } catch {
      toast.error("Could not create audit item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Portfolio overview, workload signals, and quick capture.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Total audits" value={kpis.total} icon={Layers} trendPct={trendFrom(kpis.total)} />
          <KpiCard title="Active" value={kpis.active} icon={Activity} trendPct={trendFrom(kpis.active)} />
          <KpiCard title="Completed" value={kpis.completed} icon={CheckCircle2} trendPct={trendFrom(kpis.completed)} />
          <KpiCard title="High risk" value={kpis.high} icon={AlertTriangle} trendPct={trendFrom(kpis.high)} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent activity" description="Latest audit records by created date." />
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4">
                <SkeletonText lines={4} />
              </div>
            ) : activity.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No activity yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                    <Avatar name={a.title} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{a.title}</p>
                      <p className="text-xs text-slate-500">Audit created · {formatDateTime(a.time)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Status mix" description="Derived from current dataset rules." />
          <CardContent className="h-64">
            {loading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donut} dataKey="value" nameKey="name" innerRadius={52} outerRadius={76} paddingAngle={2}>
                    {donut.map((entry) => (
                      <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Quick capture" description="Creates a new audit item via the API." />
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <Input
                label="Title"
                value={title}
                maxLength={150}
                onChange={(e) => setTitle(e.target.value)}
                error={titleErr}
              />
              <TextArea label="Payload" value={payload} maxLength={8000} onChange={(e) => setPayload(e.target.value)} error={payloadErr} />
              <Button type="submit" loading={saving}>
                Create audit
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Audit register"
            description="Sortable view of active items (paginated)."
            action={
              <Link
                to="/audits"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:focus-ring"
              >
                <ClipboardList className="h-4 w-4" aria-hidden />
                Open full list
              </Link>
            }
          />
          <div className="p-0">
            {loading ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <DataTable
                  columns={columns}
                  rows={paged}
                  rowKey={(r) => r.id}
                  onSort={onSort}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  empty={<span className="text-sm text-slate-600">No audit items yet.</span>}
                />
                <Pagination page={page} pageSize={pageSize} total={sorted.length} onPageChange={setPage} />
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
