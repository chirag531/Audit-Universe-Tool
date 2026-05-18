import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { aiDescribe, aiRecommend, aiReport } from "@/services/aiService";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export interface AuditAiAssistantProps {
  text: string;
}

type ActionKey = "describe" | "recommend" | "report" | null;

export function AuditAiAssistant({ text }: AuditAiAssistantProps) {
  const [busy, setBusy] = useState<ActionKey>(null);
  const [result, setResult] = useState("");
  const [source, setSource] = useState("");
  const [expanded, setExpanded] = useState(true);

  const run = async (key: Exclude<ActionKey, null>, fn: (t: string) => Promise<{ summary?: string; recommendations?: string; report?: string; source?: string }>) => {
    setBusy(key);
    setResult("");
    setSource("");
    try {
      const body = await fn(text || "");
      const line =
        body.summary ?? body.recommendations ?? body.report ?? JSON.stringify(body);
      setResult(line);
      setSource(body.source || "");
      setExpanded(true);
      toast.success("AI response ready");
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e !== null && "response" in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(msg || "AI request failed");
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const chip = (key: Exclude<ActionKey, null>, label: string, fn: typeof aiDescribe) => {
    const active = busy === key;
    return (
      <Button
        type="button"
        variant="secondary"
        className={cn("rounded-full border-dashed px-3 py-1.5 text-xs font-medium", active && "border-primary-300 bg-primary-50")}
        loading={active}
        disabled={!text.trim() || (busy !== null && !active)}
        onClick={() => void run(key, fn)}
      >
        {label}
      </Button>
    );
  };

  return (
    <Card>
      <CardHeader
        title="AI assistant"
        description="Summaries and drafts are proxied through the backend."
        action={
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-800">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Groq
          </span>
        }
      />
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {chip("describe", "Summarize", aiDescribe)}
          {chip("recommend", "Recommendations", aiRecommend)}
          {chip("report", "Draft report", aiReport)}
        </div>

        {result ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50/80">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium text-slate-800 hover:bg-slate-100/80 focus-visible:focus-ring rounded-t-lg"
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
            >
              <span>Model output</span>
              {expanded ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
            </button>
            {expanded ? (
              <div className="space-y-2 border-t border-slate-200 px-3 py-3">
                <p className="whitespace-pre-wrap text-sm text-slate-800">{result}</p>
                {source ? <p className="text-xs text-slate-500">Source: {source}</p> : null}
                <div className="flex justify-end">
                  <Button type="button" variant="secondary" className="h-8 px-3 text-xs" leftIcon={<Copy className="h-3.5 w-3.5" />} onClick={() => void copy()}>
                    Copy
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Run an action to see results here.</p>
        )}
      </CardContent>
    </Card>
  );
}
