import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

const CreateAgent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasAgent, setHasAgent] = useState<boolean | null>(null);
  const [agentName, setAgentName] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from("student_profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();
      setHasAgent(Boolean(data));
      setAgentName(data?.full_name ?? "");
    })();
  }, [user?.id]);

  if (hasAgent === null) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Checking your agent…
      </div>
    );
  }

  if (hasAgent) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-700" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">You already have an agent</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Each account gets <strong>one</strong> AI agent.{" "}
            {agentName ? <>Yours is named after <strong>{agentName}</strong>.</> : null}
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button onClick={() => navigate("/dashboard/ai-apply")}>
              <Sparkles className="w-4 h-4 mr-2" /> Go to your agent
            </Button>
            <Button variant="outline" onClick={() => navigate("/onboarding")}>
              Edit agent profile
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Create your AI agent
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight">
          Let&rsquo;s set up your personal bursary agent.
        </h1>
        <p className="mt-3 text-muted-foreground">
          We&rsquo;ll ask a few questions about you and collect your supporting documents.
          You can create <strong>one agent per account</strong>, and it will hunt and apply for
          bursaries on your behalf 24/7.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
          {[
            "Personal details (ID, race, gender, province)",
            "Academic record (university, faculty, GPA)",
            "Financial background (household income)",
            "Upload supporting documents (ID, marksheet, proof of income)",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {t}
            </li>
          ))}
        </ul>
        <Button className="mt-8 w-full" onClick={() => navigate("/onboarding")}>
          <Sparkles className="w-4 h-4 mr-2" /> Start agent setup
        </Button>
      </Card>
    </div>
  );
};

export default CreateAgent;
