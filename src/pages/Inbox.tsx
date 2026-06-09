import { useEffect, useState } from "react";
import { Loader2, Inbox as InboxIcon, AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Application = Database["public"]["Tables"]["applications"]["Row"];

const Inbox = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

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
    const ch = supabase
      .channel(`inbox:${user.id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "applications", filter: `user_id=eq.${user.id}` },
        () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  const needsHuman = apps.filter(a => a.status === "reviewing");
  const submitted = apps.filter(a => a.status === "submitted");

  const handleUpload = async (app: Application, files: FileList | null) => {
    if (!user || !files?.length) return;
    setBusy(app.id);
    try {
      const bucket = supabase.storage.from("student-documents");
      for (const file of Array.from(files)) {
        const name = `${user.id}/${Date.now()}-${file.name}`;
        const { error } = await bucket.upload(name, file, { upsert: true });
        if (error) throw error;
      }
      await supabase.from("applications").update({
        status: "pending",
        agent_log: `Human uploaded ${files.length} document(s). Resuming agent…`,
      }).eq("id", app.id);
      toast({ title: "Documents sent", description: "Agent will continue." });
      load();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e?.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const handleApprove = async (app: Application) => {
    setBusy(app.id);
    await supabase.from("applications").update({
      status: "pending",
      agent_log: "Human approved. Agent resuming submission…",
    }).eq("id", app.id);
    setBusy(null);
    load();
  };

  if (loading) {
    return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading inbox…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary flex items-center gap-2">
          <InboxIcon className="w-3.5 h-3.5" /> Inbox
        </p>
        <h1 className="mt-2 text-3xl font-bold">Session results &amp; human-in-the-loop</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Successes, failures, and any moments your agent needs you to step in.
        </p>
      </header>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-3 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Needs your attention ({needsHuman.length})
        </h2>
        {needsHuman.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground text-center">Nothing waiting on you. </Card>
        ) : (
          <div className="space-y-3">
            {needsHuman.map(a => (
              <Card key={a.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Badge variant="outline" className="bg-blue-100 text-blue-900 border-blue-200">Human review needed</Badge>
                    <p className="mt-2 font-semibold">Bursary application</p>
                    <p className="text-xs text-muted-foreground font-mono">{a.bursary_id.slice(0, 8)}</p>
                    {a.agent_log && (
                      <p className="mt-3 text-sm text-foreground whitespace-pre-wrap">{a.agent_log}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <label className="inline-flex">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleUpload(a, e.target.files)}
                    />
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-input text-sm hover:bg-muted cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Upload documents
                    </span>
                  </label>
                  <Button size="sm" disabled={busy === a.id} onClick={() => handleApprove(a)}>
                    {busy === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                    Approve &amp; resume
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Successfully applied ({submitted.length})
        </h2>
        {submitted.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground text-center">No completed applications yet.</Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {submitted.map(a => (
              <Card key={a.id} className="p-4">
                <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Submitted
                </Badge>
                <p className="mt-2 font-semibold">Bursary application</p>
                <p className="text-xs text-muted-foreground font-mono">{a.bursary_id.slice(0, 8)}</p>
                {a.agent_log && <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{a.agent_log}</p>}
                <p className="mt-3 text-[11px] text-muted-foreground">{new Date(a.updated_at).toLocaleString()}</p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Inbox;
