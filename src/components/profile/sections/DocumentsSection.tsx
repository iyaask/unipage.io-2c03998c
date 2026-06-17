import { useEffect, useRef, useState } from "react";
import { FileText, Upload, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import SectionCard from "./SectionCard";

interface Doc {
  id: string;
  name: string;
  doc_type: string | null;
  storage_path: string;
  size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
}

const formatSize = (b: number | null) => {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentsSection = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profile_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setDocs((data || []) as Doc[]);
  };

  useEffect(() => { load(); }, [user]);

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("profile-documents")
        .upload(path, file);
      if (upErr) throw upErr;
      const { error: dbErr } = await supabase.from("profile_documents").insert({
        user_id: user.id,
        name: file.name,
        storage_path: path,
        size_bytes: file.size,
        mime_type: file.type || null,
        doc_type: file.type?.includes("pdf") ? "PDF" : null,
      });
      if (dbErr) throw dbErr;
      toast.success("Document uploaded");
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDownload = async (doc: Doc) => {
    const { data, error } = await supabase.storage
      .from("profile-documents")
      .createSignedUrl(doc.storage_path, 60);
    if (error) { toast.error(error.message); return; }
    window.open(data.signedUrl, "_blank");
  };

  const handleDelete = async (doc: Doc) => {
    if (!confirm(`Delete ${doc.name}?`)) return;
    await supabase.storage.from("profile-documents").remove([doc.storage_path]);
    const { error } = await supabase.from("profile_documents").delete().eq("id", doc.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  return (
    <SectionCard
      id="documents"
      icon={<FileText className="h-5 w-5" />}
      title="Documents"
      subtitle="Resumes, cover letters, transcripts, and more."
      action={
        <>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
          <Button
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="bg-primary text-primary-foreground"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </>
      }
    >
      {docs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No documents yet. Upload your first one.</p>
      ) : (
        <ul className="divide-y">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center justify-between py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.doc_type || d.mime_type || "File"} · {formatSize(d.size_bytes)}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => handleDownload(d)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(d)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
};

export default DocumentsSection;
