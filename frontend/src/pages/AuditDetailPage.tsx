import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import type { AuditItem } from "@/types/api";
import * as auditApi from "@/services/auditService";
import { formatDateTime } from "@/lib/format";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { AuditAiAssistant } from "@/components/audit/AuditAiAssistant";
import { AuditTimeline, type AuditTimelineEntry } from "@/components/audit/AuditTimeline";

export function AuditDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<AuditItem | null>(null);
  const [title, setTitle] = useState("");
  const [payload, setPayload] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [titleErr, setTitleErr] = useState("");
  const [payloadErr, setPayloadErr] = useState("");
  const [hasEdited, setHasEdited] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await auditApi.getAudit(id);
      setItem(data);
      setTitle(data.title);
      setPayload(data.payload);
      setSavedAt(null);
      setHasEdited(false);
    } catch {
      toast.error("Audit item not found");
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  useEffect(() => {
    if (!id || !hasEdited) return;
    const handle = setTimeout(() => {
      void (async () => {
        try {
          const updated = await auditApi.updateAudit(id, { title: title.trim(), payload: payload.trim() });
          setItem(updated);
          setSavedAt(new Date().toISOString());
        } catch {
          toast.error("Auto-save failed");
        }
      })();
    }, 1200);
    return () => clearTimeout(handle);
  }, [title, payload, id]);

  const manualSave = async (e?: FormEvent) => {
    e?.preventDefault();
    setTitleErr("");
    setPayloadErr("");
    if (!title.trim()) setTitleErr("Title is required");
    if (!payload.trim()) setPayloadErr("Payload is required");
    if (!title.trim() || !payload.trim() || !id) return;
    setSaving(true);
    try {
      const updated = await auditApi.updateAudit(id, { title: title.trim(), payload: payload.trim() });
      setItem(updated);
      setSavedAt(new Date().toISOString());
      toast.success("Saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const timeline = useMemo<AuditTimelineEntry[]>(() => {
    if (!item) return [];
    const rows: AuditTimelineEntry[] = [
      {
        id: "created",
        title: "Record created",
        detail: "Audit item added to the register.",
        at: item.createdAt,
      },
    ];
    if (savedAt) {
      rows.push({
        id: "saved",
        title: "Changes saved",
        detail: "Title and payload were persisted to the API.",
        at: savedAt,
      });
    }
    if (item.aiSummary && item.aiSummary.trim()) {
      rows.push({
        id: "ai",
        title: "AI summary on record",
        detail: "An AI-generated summary is stored with this audit item.",
        at: item.createdAt,
      });
    }
    return rows.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  }, [item, savedAt]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
        <SkeletonText lines={3} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        This audit item could not be loaded.{" "}
        <Link to="/audits" className="font-medium text-primary-700 underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Audits</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Audit #{item.id}</h1>
          <p className="mt-1 text-sm text-slate-600">
            <Link to="/audits" className="font-medium text-primary-600 hover:text-primary-700">
              ← Back to list
            </Link>
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          {hasEdited ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-800">
              Auto-save on pause · {savedAt ? formatDateTime(savedAt) : "Waiting…"}
            </span>
          ) : (
            <span>Edits auto-save 1.2s after you stop typing.</span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Details" description="Inline edit with validation and manual save." />
            <CardContent>
              <form className="space-y-4" onSubmit={manualSave}>
                <Input
                  label="Title"
                  value={title}
                  maxLength={150}
                  onChange={(e) => {
                    setHasEdited(true);
                    setTitle(e.target.value);
                  }}
                  error={titleErr}
                />
                <TextArea
                  label="Payload"
                  value={payload}
                  maxLength={8000}
                  onChange={(e) => {
                    setHasEdited(true);
                    setPayload(e.target.value);
                  }}
                  error={payloadErr}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" loading={saving}>
                    Save now
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => void load()}>
                    Reload
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="AI summary (persisted)"
              description="Stored on the audit record from the API."
              action={
                <span className="inline-flex items-center gap-1 text-primary-700">
                  <Sparkles className="h-4 w-4" aria-hidden />
                </span>
              }
            />
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-800">{item.aiSummary?.trim() || "No summary stored yet."}</p>
            </CardContent>
          </Card>

          <AuditAiAssistant text={payload} />
        </div>

        <aside className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader title="Record" description="Identifiers and timestamps." />
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">ID</span>
                <span className="font-mono text-slate-900">{item.id}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Created</span>
                <span className="text-slate-900">{formatDateTime(item.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Card>
        <CardHeader title="Audit log" description="Key milestones for this record (derived in UI)." />
        <CardContent>
          <AuditTimeline entries={timeline} />
        </CardContent>
      </Card>
    </div>
  );
}
