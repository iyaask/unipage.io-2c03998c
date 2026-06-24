import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw, Loader2, Database, CheckCircle2, AlarmClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Bursary = {
  id: string;
  name: string | null;
  provider: string | null;
  amount: string | null;
  deadline: string | null;
  url: string | null;
  status: string | null;
  eligibility: any;
  fields_of_study: string[] | null;
};

const parseDeadline = (raw: string | null): Date | null => {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

const formatDeadline = (raw: string | null) => {
  const d = parseDeadline(raw);
  if (!d) return raw || "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const isUrgent = (raw: string | null) => {
  const d = parseDeadline(raw);
  if (!d) return false;
  const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
};

const statusVariant = (status: string | null) => {
  const s = (status || "unknown").toLowerCase();
  if (s === "open") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (s === "closed") return "bg-red-100 text-red-800 border-red-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

const renderRequirements = (b: Bursary) => {
  const parts: string[] = [];
  if (b.fields_of_study?.length) parts.push(...b.fields_of_study);
  if (b.eligibility) {
    if (typeof b.eligibility === "string") parts.push(b.eligibility);
    else if (Array.isArray(b.eligibility)) parts.push(...b.eligibility.map(String));
    else if (typeof b.eligibility === "object") {
      for (const [k, v] of Object.entries(b.eligibility)) {
        parts.push(`${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);
      }
    }
  }
  return parts.length ? parts.join(" • ") : "—";
};

const BursariesLive = () => {
  const [bursaries, setBursaries] = useState<Bursary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    const { data, error } = await supabase
      .from("bursaries")
      .select("id,name,provider,amount,deadline,url,status,eligibility,fields_of_study")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load bursaries", description: error.message, variant: "destructive" });
    } else {
      setBursaries((data || []) as Bursary[]);
      if (manual) toast({ title: "Bursaries refreshed", description: `${data?.length ?? 0} bursaries loaded.` });
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const open = bursaries.filter((b) => (b.status || "").toLowerCase() === "open").length;
    const soon = bursaries.filter((b) => isUrgent(b.deadline)).length;
    return { total: bursaries.length, open, soon };
  }, [bursaries]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Live database</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Bursaries discovered by your AI Agent</h1>
          <p className="mt-1 text-sm text-slate-500">Real-time view of every bursary stored in your Lovable Cloud database.</p>
        </div>
        <Button onClick={() => load(true)} disabled={refreshing} className="gap-2">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Bursaries Found</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Currently Open</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-700">{stats.open}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Closing Soon</CardTitle>
            <AlarmClock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{stats.soon}</p>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : bursaries.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-500">
            No bursaries discovered yet. Your AI agent will populate this table as it runs.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/60">
                <TableHead>Bursary</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="max-w-xs">Requirements</TableHead>
                <TableHead>Link</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bursaries.map((b) => {
                const urgent = isUrgent(b.deadline);
                return (
                  <TableRow key={b.id} className="hover:bg-slate-50/60">
                    <TableCell className="font-semibold text-slate-900">{b.name || "Untitled"}</TableCell>
                    <TableCell className="text-slate-500">{b.provider || "—"}</TableCell>
                    <TableCell className="font-medium text-slate-700">{b.amount || "—"}</TableCell>
                    <TableCell className={urgent ? "font-bold text-red-600" : "text-slate-700"}>
                      {formatDeadline(b.deadline)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusVariant(b.status)}>
                        {(b.status || "unknown").toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-slate-500" title={renderRequirements(b)}>
                      {renderRequirements(b)}
                    </TableCell>
                    <TableCell>
                      {b.url ? (
                        <a href={b.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline-offset-2 hover:underline">
                          Apply
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {b.url ? (
                        <Button asChild size="icon" variant="ghost">
                          <a href={b.url} target="_blank" rel="noreferrer" aria-label="Open application">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
};

export default BursariesLive;
