import { useCallback, useEffect, useMemo, useState } from "react";
import { Bot, Clock, ExternalLink, Loader2, Play, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

type Match = {
  id: string;
  name: string;
  provider: string | null;
  deadline: string | null;
  amount: string | null;
  application_url: string | null;
  status: "open" | "closed" | "unknown";
  match_score: number;
  reason: string;
};

type Application = {
  id: string;
  bursary_id: string;
  status: "pending" | "submitted" | "failed" | "reviewing";
  agent_log: string | null;
  submitted_at: string | null;
  screenshot_url: string | null;
  created_at: string;
  bursaries?: {
    name: string;
    provider: string | null;
  } | null;
};

const statusStyles: Record<Application["status"], string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  reviewing: "bg-blue-100 text-blue-800 border-blue-200",
  submitted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  failed: "bg-red-100 text-red-800 border-red-200",
};

const DashboardHome = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [applyingBursaryId, setApplyingBursaryId] = useState<string | null>(null);

  const agentRunning = discovering || Boolean(applyingBursaryId) || applications.some((app) => app.status === "pending");

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const healthResponse = await fetch("/api/health").catch(() => null);
    const hasApi = Boolean(healthResponse?.ok);
    setApiAvailable(hasApi);

    if (hasApi) {
      const [matchesResponse, applicationsResponse] = await Promise.all([
        fetch(`/api/matches/${user.id}`),
        fetch(`/api/applications/${user.id}`),
      ]);

      if (matchesResponse.ok) {
        const matchesPayload = await matchesResponse.json();
        setMatches(matchesPayload.matches || []);
      }

      if (applicationsResponse.ok) {
        const applicationsPayload = await applicationsResponse.json();
        setApplications(applicationsPayload.applications || []);
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Dashboard error", description: error.message, variant: "destructive" });
    } else {
      setApplications((data || []) as Application[]);
      setMatches([]);
    }

    setLoading(false);
  }, [toast, user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`applications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "applications",
          filter: `user_id=eq.${user.id}`,
        },
        () => loadDashboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDashboard, user]);

  const latestAgentLog = useMemo(() => {
    return applications.find((app) => app.agent_log)?.agent_log || "No agent activity yet.";
  }, [applications]);

  const runDiscovery = async () => {
    if (!apiAvailable) {
      toast({
        title: "Agent API offline",
        description: "Start npm run api with SUPABASE_SERVICE_ROLE_KEY and ANTHROPIC_API_KEY to run discovery.",
        variant: "destructive",
      });
      return;
    }

    setDiscovering(true);
    try {
      const response = await fetch("/api/agents/discover", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Discovery failed.");
      toast({ title: "Discovery complete", description: `${payload.stored} bursaries stored from ${payload.found} found.` });
      await loadDashboard();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Discovery failed.";
      toast({ title: "Discovery failed", description: message, variant: "destructive" });
    } finally {
      setDiscovering(false);
    }
  };

  const applyForBursary = async (bursaryId: string) => {
    if (!user) return;
    if (!apiAvailable) {
      toast({
        title: "Agent API offline",
        description: "Start npm run api with server credentials before running the apply agent.",
        variant: "destructive",
      });
      return;
    }

    setApplyingBursaryId(bursaryId);
    try {
      const response = await fetch("/api/agents/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bursary_id: bursaryId, user_id: user.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Apply agent failed.");
      toast({
        title: "Agent run complete",
        description: payload.application?.status === "reviewing"
          ? "Application is ready for human review before submission."
          : "Application status updated.",
      });
      await loadDashboard();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Apply agent failed.";
      toast({ title: "Apply failed", description: message, variant: "destructive" });
    } finally {
      setApplyingBursaryId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">AI bursary agents</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Funding dashboard</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${agentRunning ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
            {agentRunning ? "Agent running" : "Agents idle"}
          </div>
          {!apiAvailable && (
            <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
              Agent API offline
            </div>
          )}
          <Button onClick={runDiscovery} disabled={discovering} className="gap-2">
            {discovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Discover bursaries
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Matched bursaries</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{matches.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Applications</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{applications.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Submitted</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {applications.filter((app) => app.status === "submitted").length}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Best matches</h2>
          </div>

          {matches.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
              Complete onboarding and run discovery to populate real bursary matches from Supabase.
            </div>
          ) : (
            <div className="grid gap-3">
              {matches.map((match) => (
                <article key={match.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground">{match.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{match.provider || "Provider unknown"}</p>
                    </div>
                    <span className="w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                      {match.match_score}%
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{match.reason}</p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {match.deadline && <span><Clock className="mr-1 inline h-3 w-3" />{match.deadline}</span>}
                      {match.amount && <span>{match.amount}</span>}
                      {match.application_url && (
                        <a href={match.application_url} target="_blank" rel="noreferrer" className="text-primary">
                          View application <ExternalLink className="ml-1 inline h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => applyForBursary(match.id)}
                      disabled={applyingBursaryId === match.id}
                      className="gap-2"
                    >
                      {applyingBursaryId === match.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      Let AI Apply
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Applications</h2>
          </div>

          <div className="space-y-3">
            {applications.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
                No application runs yet.
              </div>
            ) : (
              applications.map((application) => (
                <div key={application.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {application.bursaries?.name || "Bursary application"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(application.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[application.status]}`}>
                      {application.status}
                    </span>
                  </div>
                  {application.agent_log && (
                    <pre className="mt-3 max-h-32 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-[11px] text-muted-foreground">
                      {application.agent_log}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="rounded-lg border border-border bg-foreground p-4 text-background">
            <p className="text-sm font-semibold">Live agent log</p>
            <pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap text-xs text-background/80">{latestAgentLog}</pre>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default DashboardHome;
