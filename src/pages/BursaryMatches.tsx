import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import agentAvatar from "@/assets/agent-avatar.png";

type BursaryReq = {
  id: string;
  bursary_name: string;
  requirements: string;
  deadline: string | null;
  provider: string | null;
  source_url: string | null;
};

type Match = {
  bursary_id: string;
  bursary_name: string;
  provider?: string | null;
  deadline?: string | null;
  source_url?: string | null;
  score: number;
  reasoning: string;
};

const BursaryMatches = () => {
  const [matches, setMatches] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [agentSearching, setAgentSearching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [requirements, setRequirements] = useState<BursaryReq[]>([]);
  const [comparing, setComparing] = useState(false);
  const [comparisons, setComparisons] = useState<Match[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const loadLatestSummary = useCallback(async () => {
    if (!user) {
      const stored = localStorage.getItem("bursaryMatches");
      setMatches(stored || "");
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("given_bursary_info")
      .select("summary")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setMatches(data?.summary || "");
    setLoading(false);
  }, [user]);

  const loadRequirements = useCallback(async () => {
    const { data } = await supabase
      .from("bursary_requirements")
      .select("id, bursary_name, requirements, deadline, provider, source_url")
      .order("updated_at", { ascending: false })
      .limit(50);
    if (data) setRequirements(data as BursaryReq[]);
  }, []);

  const loadLatestComparison = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("comparagent_results")
      .select("matches")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.matches) {
      const m = data.matches as unknown as Match[];
      if (Array.isArray(m)) setComparisons(m);
    }
  }, [user]);

  useEffect(() => {
    loadLatestSummary();
    loadRequirements();
    loadLatestComparison();

    const interval = setInterval(() => {
      const searching = localStorage.getItem("bursaryAgentSearching") === "true";
      setAgentSearching(searching);
      if (!searching && !user) {
        const stored = localStorage.getItem("bursaryMatches");
        if (stored && stored !== matches) setMatches(stored);
      }
      if (!searching && user) loadLatestSummary();
    }, 1500);
    return () => clearInterval(interval);
  }, [user, loadLatestSummary, loadRequirements, loadLatestComparison, matches]);

  const handleCopy = async () => {
    if (!matches) return;
    await navigator.clipboard.writeText(matches);
    setCopied(true);
    toast({ title: "Copied!", description: "Matches copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompare = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to run comparagent.", variant: "destructive" });
      return;
    }
    setComparing(true);
    try {
      const { data, error } = await supabase.functions.invoke("comparagent", { body: {} });
      if (error) throw error;
      const payload = data as { error?: string; matches?: Match[] };
      if (payload?.error) throw new Error(payload.error);
      const next = Array.isArray(payload?.matches) ? payload!.matches! : [];
      setComparisons(next);
      toast({
        title: "Comparison ready",
        description: `${next.length} bursaries scored against your profile.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to run comparagent";
      toast({ title: "Compare failed", description: message, variant: "destructive" });
    } finally {
      setComparing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex-shrink-0 border-2 border-primary/20">
          <img src={agentAvatar} alt="Bursary Agent" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Bursary Agent</h2>
          <p className="text-xs text-muted-foreground">
            Once your agent is done searching, it will paste the response here.
          </p>
        </div>
      </div>

      {matches && (
        <div className="flex justify-end mb-2">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-1.5 text-xs">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      )}

      {agentSearching && (
        <div className="flex items-center gap-2 mb-3 py-2.5 px-4 rounded-lg bg-muted/50 border border-border">
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
          <span className="text-xs font-medium text-muted-foreground">
            Agent is live and searching — this may take some time...
          </span>
        </div>
      )}

      <div className="relative w-full min-h-[60vh] md:min-h-[65vh] rounded-2xl border border-border bg-foreground p-5 overflow-auto">
        {matches ? (
          <p className="text-sm text-background leading-relaxed whitespace-pre-wrap">{matches}</p>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[55vh] text-center px-6">
            <p className="text-sm text-background/70">
              Your AI agent is live and searching. Once it's done, you will see the results here.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dashboard/bursaries")}
          className="rounded-full px-5 text-xs"
        >
          {matches ? "Retake Quiz" : "Start the Quiz"}
        </Button>
        {user && (
          <Button
            size="sm"
            onClick={handleCompare}
            disabled={comparing}
            className="rounded-full px-5 text-xs gap-1.5"
          >
            {comparing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {comparing ? "Comparing..." : "Compare with open bursaries"}
          </Button>
        )}
      </div>

      {comparisons.length > 0 && (
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Comparagent results ({comparisons.length})
          </h3>
          <ul className="space-y-3">
            {comparisons.map((m) => (
              <li key={m.bursary_id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{m.bursary_name}</p>
                    {m.provider && <p className="text-xs text-muted-foreground truncate">{m.provider}</p>}
                  </div>
                  <span className="shrink-0 text-xs font-bold text-primary">{m.score}%</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{m.reasoning}</p>
                <div className="mt-2 flex items-center justify-between gap-3 text-[11px]">
                  <span className="text-muted-foreground">{m.deadline || ""}</span>
                  {m.source_url && (
                    <a
                      href={m.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary inline-flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {requirements.length > 0 && (
        <div className="mt-10 rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Currently open bursaries ({requirements.length})
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Updated weekly by the extractor agent.
          </p>
          <ul className="space-y-2 max-h-[40vh] overflow-auto pr-1">
            {requirements.map((r) => (
              <li key={r.id} className="rounded-md border border-border bg-background p-3">
                <p className="text-xs font-semibold text-foreground truncate">{r.bursary_name}</p>
                {r.provider && <p className="text-[11px] text-muted-foreground truncate">{r.provider}</p>}
                {r.deadline && <p className="text-[11px] text-muted-foreground">Deadline: {r.deadline}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BursaryMatches;
