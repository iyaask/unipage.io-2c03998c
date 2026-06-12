import { useEffect, useState } from "react";
import { Loader2, Activity, CheckCircle2, Clock, Eye, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Application = Database["public"]["Tables"]["applications"]["Row"];

const statusMeta: Record<Application["status"], { label: string; icon: any; className: string }> = {
  pending:   { label: "Queued",     icon: Clock,        className: "bg-amber-100 text-amber-900 border-amber-200" },
  reviewing: { label: "In review",  icon: Eye,          className: "bg-blue-100 text-blue-900 border-blue-200" },
  submitted: { label: "Submitted",  icon: CheckCircle2, className: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  failed:    { label: "Failed",     icon: XCircle,      className: "bg-red-100 text-red-900 border-red-200" },
};

const Sessions = () => {
  const { user } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setApps(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel(`sessions:${user.id}`)
        .on("postgres_changes",
          { event: "*", schema: "public", table: "applications", filter: `user_id=eq.${user.id}` },
          () => load());
      channel.subscribe();
    } catch (e) {
      console.warn("Realtime unavailable (likely preview proxy). Falling back to manual refresh.", e);
    }
    return () => { if (channel) { try { supabase.removeChannel(channel); } catch {} } };
  }, [user?.id]);

  const active = apps.filter(a => a.status === "pending" || a.status === "reviewing");
  const done = apps.filter(a => a.status === "submitted" || a.status === "failed");

  if (loading) {
    return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading sessions…</div>;
  }

  const Row = (a: Application) => {
    const m = statusMeta[a.status];
    const Icon = m.icon;
    return (
      <Card key={a.id} className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold truncate">Bursary application</p>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{a.bursary_id.slice(0, 8)}</p>
          </div>
          <Badge variant="outline" className={`${m.className} shrink-0`}><Icon className="w-3 h-3 mr-1" />{m.label}</Badge>
        </div>
        {a.agent_log && <p className="mt-3 text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">{a.agent_log}</p>}
        <p className="mt-3 text-[11px] text-muted-foreground">Updated {new Date(a.updated_at).toLocaleString()}</p>
      </Card>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Sessions</p>
        <h1 className="mt-2 text-3xl font-bold">Agent progress &amp; work in progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every active or completed run your agent has performed.</p>
      </header>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-3 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" /> Active ({active.length})
        </h2>
        {active.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground text-center">No agents currently working.</Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">{active.map(Row)}</div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-3">Completed ({done.length})</h2>
        {done.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground text-center">No completed sessions yet.</Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">{done.map(Row)}</div>
        )}
      </section>
    </div>
  );
};

export default Sessions;
