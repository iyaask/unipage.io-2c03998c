import { useEffect, useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import SectionCard from "./SectionCard";

const ApplicationDefaultsSection = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    salary_expectation: "",
    work_authorization: "",
    availability: "",
    preferred_location: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profile_application_defaults").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setForm({
          salary_expectation: data.salary_expectation || "",
          work_authorization: data.work_authorization || "",
          availability: data.availability || "",
          preferred_location: data.preferred_location || "",
          notes: data.notes || "",
        });
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profile_application_defaults").upsert({
      user_id: user.id,
      ...form,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
  };

  return (
    <SectionCard
      id="application-defaults"
      icon={<Settings2 className="h-5 w-5" />}
      title="Application defaults"
      subtitle="Defaults applied to your applications."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Salary expectation" value={form.salary_expectation} onChange={(v) => setForm({ ...form, salary_expectation: v })} placeholder="e.g. $80,000/yr" />
        <Field label="Work authorization" value={form.work_authorization} onChange={(v) => setForm({ ...form, work_authorization: v })} placeholder="e.g. Citizen, Visa required" />
        <Field label="Availability" value={form.availability} onChange={(v) => setForm({ ...form, availability: v })} placeholder="e.g. 2 weeks notice" />
        <Field label="Preferred location" value={form.preferred_location} onChange={(v) => setForm({ ...form, preferred_location: v })} placeholder="e.g. Remote, Cape Town" />
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
          <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Anything else recruiters should know" />
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <Button onClick={save} disabled={saving} className="bg-primary text-primary-foreground">
          {saving ? "Saving..." : "Save defaults"}
        </Button>
      </div>
    </SectionCard>
  );
};

const Field = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div>
    <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
    <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

export default ApplicationDefaultsSection;
