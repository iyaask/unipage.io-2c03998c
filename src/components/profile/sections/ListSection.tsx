import { useEffect, useState, ReactNode } from "react";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import SectionCard from "./SectionCard";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea";
  placeholder?: string;
  required?: boolean;
}

interface ListSectionProps {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  table: "profile_experience" | "profile_education" | "profile_skills" | "profile_certifications" | "profile_projects";
  fields: FieldDef[];
  renderItem: (row: any) => ReactNode;
}

const ListSection = ({ id, icon, title, subtitle, table, fields, renderItem }: ListSectionProps) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from(table as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setRows(data || []);
  };

  useEffect(() => { load(); }, [user]);

  const startAdd = () => {
    setForm(Object.fromEntries(fields.map((f) => [f.key, ""])));
    setEditingId("new");
  };

  const startEdit = (row: any) => {
    setForm(Object.fromEntries(fields.map((f) => [f.key, row[f.key] ?? ""])));
    setEditingId(row.id);
  };

  const cancel = () => { setEditingId(null); setForm({}); };

  const save = async () => {
    if (!user) return;
    for (const f of fields) {
      if (f.required && !form[f.key]?.trim()) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    const payload: any = { ...form };
    Object.keys(payload).forEach((k) => { if (payload[k] === "") payload[k] = null; });

    if (editingId === "new") {
      const { error } = await supabase.from(table as any).insert({ ...payload, user_id: user.id });
      if (error) { toast.error(error.message); return; }
      toast.success("Added");
    } else {
      const { error } = await supabase.from(table as any).update(payload).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      toast.success("Updated");
    }
    cancel();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  return (
    <SectionCard
      id={id}
      icon={icon}
      title={title}
      subtitle={subtitle}
      action={
        editingId !== "new" && (
          <Button size="sm" variant="outline" onClick={startAdd}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        )
      }
    >
      <div className="space-y-3">
        {editingId === "new" && (
          <EditForm fields={fields} form={form} setForm={setForm} onSave={save} onCancel={cancel} />
        )}
        {rows.length === 0 && editingId !== "new" && (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        )}
        {rows.map((row) =>
          editingId === row.id ? (
            <EditForm key={row.id} fields={fields} form={form} setForm={setForm} onSave={save} onCancel={cancel} />
          ) : (
            <div key={row.id} className="flex items-start justify-between gap-3 rounded-lg border p-4">
              <div className="min-w-0 flex-1">{renderItem(row)}</div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => startEdit(row)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(row.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        )}
      </div>
    </SectionCard>
  );
};

const EditForm = ({
  fields, form, setForm, onSave, onCancel,
}: {
  fields: FieldDef[];
  form: Record<string, string>;
  setForm: (f: Record<string, string>) => void;
  onSave: () => void;
  onCancel: () => void;
}) => (
  <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
          {f.type === "textarea" ? (
            <Textarea
              value={form[f.key] || ""}
              placeholder={f.placeholder}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              rows={3}
            />
          ) : (
            <Input
              value={form[f.key] || ""}
              placeholder={f.placeholder}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          )}
        </div>
      ))}
    </div>
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="ghost" onClick={onCancel}>
        <X className="h-4 w-4 mr-1" /> Cancel
      </Button>
      <Button size="sm" onClick={onSave} className="bg-primary text-primary-foreground">
        <Check className="h-4 w-4 mr-1" /> Save
      </Button>
    </div>
  </div>
);

export default ListSection;
