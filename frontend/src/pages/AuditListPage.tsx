import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { ClientAuditRow, ClientAuditStatus } from "@/types/api";
import { toClientRow } from "@/lib/auditDisplay";
import { formatDateTime } from "@/lib/format";
import * as auditApi from "@/services/auditService";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tooltip } from "@/components/ui/Tooltip";

const STATUS_OPTIONS: { value: "all" | ClientAuditStatus; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "review", label: "In review" },
  { value: "completed", label: "Completed" },
  { value: "high_risk", label: "High risk" },
];

const RISK_OPTIONS: { value: "all" | "low" | "medium" | "high"; label: string }[] = [
  { value: "all", label: "All risk levels" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

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

function riskTone(r: "low" | "medium" | "high"): BadgeTone {
  if (r === "high") return "danger";
  if (r === "medium") return "warning";
  return "neutral";
}

export function AuditListPage() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]["value"]>("all");
  const [risk, setRisk] = useState<(typeof RISK_OPTIONS)[number]["value"]>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<ClientAuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = useState<"title" | "createdAt" | "clientStatus" | "clientRisk">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [bulkOpen, setBulkOpen] = useState(false);
  const [singleOpen, setSingleOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await auditApi.listAudits(q);
      setRows(data.map(toClientRow));
      setSelected(new Set());
      setPage(1);
    } catch {
      toast.error("Failed to load audits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (status !== "all" && r.clientStatus !== status) return false;
      if (risk !== "all" && r.clientRisk !== risk) return false;
      if (from) {
        const t = new Date(r.createdAt).getTime();
        if (t < new Date(from).setHours(0, 0, 0, 0)) return false;
      }
      if (to) {
        const t = new Date(r.createdAt).getTime();
        if (t > new Date(to).setHours(23, 59, 59, 999)) return false;
      }
      return true;
    });
  }, [rows, status, risk, from, to]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "title") return a.title.localeCompare(b.title) * dir;
      if (sortKey === "createdAt") return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      if (sortKey === "clientStatus") return a.clientStatus.localeCompare(b.clientStatus) * dir;
      return a.clientRisk.localeCompare(b.clientRisk) * dir;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);

  const allSelected = sorted.length > 0 && sorted.every((r) => selected.has(r.id));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(sorted.map((r) => r.id)));
  };

  const toggleRow = (id: number) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const onSort = (key: string) => {
    const k = key as typeof sortKey;
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
    setPage(1);
  };

  const confirmSingleDelete = async () => {
    if (pendingDeleteId == null) return;
    setDeleting(true);
    try {
      await auditApi.deleteAudit(pendingDeleteId);
      toast.success("Audit deleted");
      setSingleOpen(false);
      setPendingDeleteId(null);
      await load();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const confirmBulkDelete = async () => {
    setDeleting(true);
    try {
      for (const id of selected) {
        await auditApi.deleteAudit(id);
      }
      toast.success(`Deleted ${selected.size} item(s)`);
      setBulkOpen(false);
      setSelected(new Set());
      await load();
    } catch {
      toast.error("Bulk delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const rowMenu = (r: ClientAuditRow): DropdownItem[] => [
    { key: "view", label: "View details", onSelect: () => nav(`/audits/${r.id}`) },
    {
      key: "del",
      label: "Delete",
      danger: true,
      onSelect: () => {
        setPendingDeleteId(r.id);
        setSingleOpen(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Audit register</h1>
        <p className="mt-1 text-sm text-slate-600">Search, filter, and manage audit items in bulk.</p>
      </div>

      <Card>
        <CardHeader title="Filters" description="Client-side filters on the loaded dataset." />
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2">
            <label htmlFor="audit-search" className="mb-1 block text-sm font-medium text-slate-700">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                id="audit-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void load()}
                placeholder="Search titles…"
                className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/25"
              />
            </div>
          </div>
          <div>
            <label htmlFor="status-filter" className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="status-filter"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as typeof status);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/25"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="risk-filter" className="mb-1 block text-sm font-medium text-slate-700">
              Risk level
            </label>
            <select
              id="risk-filter"
              value={risk}
              onChange={(e) => {
                setRisk(e.target.value as typeof risk);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/25"
            >
              {RISK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="from-date" className="mb-1 block text-sm font-medium text-slate-700">
              From
            </label>
            <input
              id="from-date"
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/25"
            />
          </div>
          <div>
            <label htmlFor="to-date" className="mb-1 block text-sm font-medium text-slate-700">
              To
            </label>
            <input
              id="to-date"
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/25"
            />
          </div>
          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-2">
            <Button type="button" onClick={() => void load()}>
              Apply search
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setQ("");
                setStatus("all");
                setRisk("all");
                setFrom("");
                setTo("");
                void load();
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {selected.size > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-900"
          >
            <span className="font-medium">{selected.size} selected</span>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" className="h-9" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
              <Button type="button" variant="destructive" className="h-9" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setBulkOpen(true)}>
                Delete selected
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Card className="overflow-hidden p-0">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            title="No audits match filters"
            description="Try clearing filters or broadening your search."
            action={
              <Button type="button" variant="secondary" onClick={() => void load()}>
                Reload data
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="w-10 px-4 py-3">
                      <Checkbox checked={allSelected} onChange={() => toggleAll()} aria-label="Select all rows" />
                    </th>
                    {(
                      [
                        { key: "title", label: "Title" },
                        { key: "clientStatus", label: "Status" },
                        { key: "clientRisk", label: "Risk" },
                        { key: "createdAt", label: "Created" },
                        { key: "actions", label: "" },
                      ] as const
                    ).map((col) => (
                      <th key={col.key} scope="col" className="px-4 py-3 font-semibold text-slate-700">
                        {col.key !== "actions" ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-slate-100 focus-visible:focus-ring"
                            onClick={() => onSort(col.key)}
                          >
                            {col.label}
                            {sortKey === col.key ? <span className="text-xs text-slate-500">{sortDir === "asc" ? "▲" : "▼"}</span> : null}
                          </button>
                        ) : (
                          <span className="sr-only">Actions</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paged.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selected.has(r.id)}
                          onChange={() => toggleRow(r.id)}
                          aria-label={`Select ${r.title}`}
                        />
                      </td>
                      <td className="max-w-[240px] px-4 py-3">
                        <Link to={`/audits/${r.id}`} className="font-medium text-primary-700 hover:underline">
                          {r.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone(r.clientStatus)}>{statusLabel(r.clientStatus)}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={riskTone(r.clientRisk)}>{r.clientRisk}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDateTime(r.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Dropdown
                          align="right"
                          menuLabel={`Actions for ${r.title}`}
                          trigger={
                            <Tooltip label="Row actions">
                              <span className="inline-flex">
                                <Button variant="ghost" className="h-9 w-9 p-0" aria-label="Open row menu">
                                  <MoreHorizontal className="h-5 w-5" />
                                </Button>
                              </span>
                            </Tooltip>
                          }
                          items={rowMenu(r)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={sorted.length} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal
        open={singleOpen}
        title="Delete audit item?"
        description="This performs a soft delete via the API."
        onClose={() => {
          if (!deleting) {
            setSingleOpen(false);
            setPendingDeleteId(null);
          }
        }}
        footer={
          <>
            <Button type="button" variant="secondary" disabled={deleting} onClick={() => setSingleOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" loading={deleting} onClick={() => void confirmSingleDelete()}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">This action can be reversed only by restoring data in the backend.</p>
      </Modal>

      <Modal
        open={bulkOpen}
        title={`Delete ${selected.size} audit items?`}
        description="Each selected row will be soft-deleted sequentially."
        onClose={() => !deleting && setBulkOpen(false)}
        footer={
          <>
            <Button type="button" variant="secondary" disabled={deleting} onClick={() => setBulkOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" loading={deleting} onClick={() => void confirmBulkDelete()}>
              Delete all
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">You are about to remove {selected.size} items from the active register.</p>
      </Modal>
    </div>
  );
}
