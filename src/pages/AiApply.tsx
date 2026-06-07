import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Loader2, ExternalLink, CheckCircle2, Clock, XCircle, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { matchBursaries, type BursaryMatch } from "@/lib/matchBursaries";
import type { Database } from "@/integrations/supabase/types";

type Application = Database["public"]["Tables"]["applications"]["Row"];

const APPLY_WEBHOOK_URL = (import.meta.env.VITE_APPLY_AGENT_WEBHOOK_URL as string | undefined) ?? "";

const statusMeta: Record<Application["status"], { label: string; icon: any; className: string }> = {
  pending:    { label: "Pending",    icon: Clock,        className: "bg-amber-100 text-amber-900 border-amber-200" },
  reviewing:  { label: "Reviewing",  icon: Eye,          className: "bg-blue-100 text-blue-900 border-blue-200" },
  submitted:  { label: "Submitted",  icon: CheckCircle2, className: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  failed:     { label: "Failed",     icon: XCircle,      className: "bg-red-100 text-red-900 border-red-200" },
};

const scoreBadge = (score: number) => {
  if (score >= 75) return "bg-emerald-100 text-emerald-900 border-emerald-200";
  if (score >= 55) return "bg-amber-100 text-amber-900 border-amber-200";
  return "bg-muted text-muted-foreground border-border";
};

const AiApply = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [matches, setMatches] = useState<BursaryMatch[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [{ data: profile }, ms, { data: apps, error: appErr }] = await Promise.all([
        supabase.from("student_profiles").select("id").eq("user_id", user.id).maybeSingle(),
        matchBursaries(user.id),
        supabase.from("applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setHasProfile(Boolean(profile));
      setMatches(ms);
      if (appErr) throw appErr;
      setApplications(apps ?? []);
    } catch (e: any) {
      toast({ title: "Failed to load", description: e?.message ?? "Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Realtime updates on the applications table for this user
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`apps:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setApplications((prev) => {
            if (payload.eventType === "INSERT") return [payload.new as Application, ...prev];
            if (payload.eventType === "UPDATE")
              return prev.map((a) => (a.id === (payload.new as Application).id ? (payload.new as Application) : a));
            if (payload.eventType === "DELETE")
              return prev.filter((a) => a.id !== (payload.old as Application).id);
            return prev;
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const appsByBursary = useMemo(() => {
    const map = new Map<string, Application>();
    for (const a of applications) if (!map.has(a.bursary_id)) map.set(a.bursary_id, a);
    return map;
  }, [applications]);

  const activeAgents = applications.filter((a) => a.status === "pending" || a.status === "reviewing").length;

  const handleApply = async (bursaryId: string) => {
    if (!user) return;
    setApplyingId(bursaryId);
    try {
      // 1. Create a pending application row so the dashboard updates instantly
      const { data: inserted, error: insErr } = await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          bursary_id: bursaryId,
          status: "pending",
          agent_log: "Queued — waiting for AI agent to start…",
        })
        .select()
        .single();
      if (insErr) throw insErr;

      // 2. Fire the Railway webhook (apply agent). Fire-and-forget; agent
      //    writes back to the `applications` row via service-role.
      if (!APPLY_WEBHOOK_URL) {
        toast({
          title: "Application queued",
          description: "Set VITE_APPLY_AGENT_WEBHOOK_URL to wire up the agent.",
        });
      } else {
        const res = await fetch(APPLY_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            application_id: inserted.id,
            user_id: user.id,
            bursary_id: bursaryId,
            human_in_the_loop: true,
          }),
        });
        if (!res.ok) {
          await supabase
            .from("applications")
            .update({ status: "failed", agent_log: `Webhook returned ${res.status}` })
            .eq("id", inserted.id);
          throw new Error(`Agent webhook failed (${res.status})`);
        }
        toast({ title: "AI agent started", description: "We'll update this card as the agent works." });
      }
    } catch (e: any) {
      toast({ title: "Could not start agent", description: e?.message ?? "Try again.", variant: "destructive" });
    } finally {
      setApplyingId(null);
    }
  };

  if (hasProfile === false) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">Finish your profile first</h1>
        <p className="mt-2 text-muted-foreground">
          We need your academic and financial details before the AI can match and apply.
        </p>
        <Button asChild className="mt-6"><Link to="/onboarding">Complete onboarding</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">AI Bursary Agent</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Matched bursaries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked by fit with your profile. Tap “Let AI Apply” to send the agent.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeAgents > 0 && (
            <span className="inline-flex items-center gap-2 text-sm text-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
              </span>
              {activeAgents} agent{activeAgents > 1 ? "s" : ""} running
            </span>
          )}
          <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </header>

      {/* Application status timeline */}
      {applications.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-3">
            Recent applications
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {applications.slice(0, 6).map((a) => {
              const meta = statusMeta[a.status];
              const Icon = meta.icon;
              const bursaryName = matches.find((m) => m.bursary.id === a.bursary_id)?.bursary.name ?? "Bursary";
              return (
                <Card key={a.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-foreground line-clamp-2">{bursaryName}</p>
                    <Badge variant="outline" className={`shrink-0 ${meta.className}`}>
                      <Icon className="w-3 h-3 mr-1" /> {meta.label}
                    </Badge>
                  </div>
                  {a.agent_log && (
                    <p className="mt-3 text-xs text-muted-foreground whitespace-pre-wrap line-clamp-3">{a.agent_log}</p>
                  )}
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Matches */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-3">
          Top matches
        </h2>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Scoring bursaries…</div>
        ) : matches.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-foreground font-semibold">No bursaries in the database yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Run the discovery agent on Railway to populate the <code>bursaries</code> table.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {matches.slice(0, 25).map(({ bursary, score, reasons }) => {
              const existing = appsByBursary.get(bursary.id);
              return (
                <Card key={bursary.id} className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground">{bursary.name}</h3>
                        <Badge variant="outline" className={scoreBadge(score)}>{score}% match</Badge>
                        {bursary.status === "closed" && (
                          <Badge variant="outline" className="bg-muted">Closed</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {bursary.provider ?? "Unknown provider"}
                        {bursary.amount ? ` · ${bursary.amount}` : ""}
                        {bursary.deadline ? ` · Deadline ${bursary.deadline}` : ""}
                      </p>
                      {reasons.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-1.5">
                          {reasons.slice(0, 4).map((r) => (
                            <li key={r} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{r}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {bursary.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={bursary.url} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" /> View
                          </a>
                        </Button>
                      )}
                      {existing ? (
                        <Badge variant="outline" className={statusMeta[existing.status].className}>
                          {statusMeta[existing.status].label}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleApply(bursary.id)}
                          disabled={applyingId === bursary.id || bursary.status === "closed"}
                        >
                          {applyingId === bursary.id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4 mr-1" />
                          )}
                          Let AI Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AiApply;
