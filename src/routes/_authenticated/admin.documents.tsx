import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { Plus, Trash2, FileText, Upload, Pencil } from "lucide-react";
import { toast } from "sonner";
import { adminDocumentsQuery, formatFileSize, type DocumentRow } from "@/lib/documents";
import { upsertDocument, deleteDocument, uploadDocumentFile } from "@/lib/documents.functions";
import {
  Card,
  PageHeader,
  SecondaryButton,
  DangerButton,
  PrimaryButton,
  Field,
  inputCls,
} from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/documents")({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminDocumentsQuery),
  component: DocumentsAdmin,
});

type Draft = {
  id?: string;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  file_size: number | null;
  display_order: number;
  is_published: boolean;
};

const emptyDraft = (order: number): Draft => ({
  title: "",
  description: "",
  file_url: "",
  file_name: "",
  file_size: null,
  display_order: order,
  is_published: false,
});

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result ?? "");
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function DocumentsAdmin() {
  const { data } = useSuspenseQuery(adminDocumentsQuery);
  const qc = useQueryClient();
  const save = useServerFn(upsertDocument);
  const remove = useServerFn(deleteDocument);
  const upload = useServerFn(uploadDocumentFile);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function edit(d: DocumentRow) {
    setDraft({
      id: d.id,
      title: d.title,
      description: d.description ?? "",
      file_url: d.file_url,
      file_name: d.file_name ?? "",
      file_size: d.file_size ?? null,
      display_order: d.display_order,
      is_published: d.is_published,
    });
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !draft) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large — the maximum size is 10 MB");
      return;
    }
    setProgress(5);
    const timer = setInterval(() => setProgress((p) => (p === null ? p : Math.min(90, p + 7))), 200);
    try {
      const base64 = await fileToBase64(file);
      setProgress((p) => (p === null ? 60 : Math.max(p, 60)));
      const res = await upload({ data: { filename: file.name, base64, size: file.size } });
      setProgress(100);
      setDraft((d) =>
        d ? { ...d, file_url: res.url, file_name: res.fileName, file_size: res.fileSize } : d,
      );
      toast.success("PDF uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      clearInterval(timer);
      setTimeout(() => setProgress(null), 600);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.file_url) {
      toast.error("Please upload a PDF file first");
      return;
    }
    setSaving(true);
    try {
      await save({
        data: {
          id: draft.id,
          title: draft.title,
          description: draft.description || null,
          file_url: draft.file_url,
          file_name: draft.file_name || null,
          file_size: draft.file_size,
          display_order: draft.display_order,
          is_published: draft.is_published,
        },
      });
      toast.success("Saved");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["documents"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function del(d: DocumentRow) {
    if (!confirm(`Delete "${d.title}"? The PDF file will also be removed.`)) return;
    try {
      await remove({ data: { id: d.id } });
      toast.success("Deleted");
      if (draft?.id === d.id) setDraft(null);
      qc.invalidateQueries({ queryKey: ["documents"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <PageHeader title="Documents" description="PDF resources shown on the /resources page." />

      <div className="mb-4 flex justify-end">
        <SecondaryButton onClick={() => setDraft(emptyDraft(data.length + 1))}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add document
        </SecondaryButton>
      </div>

      {draft && (
        <Card className="mb-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title">
                <input
                  className={inputCls}
                  required
                  maxLength={200}
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </Field>
              <Field label="Display order" hint="Lower numbers appear first.">
                <input
                  type="number"
                  className={inputCls}
                  value={draft.display_order}
                  onChange={(e) => setDraft({ ...draft, display_order: Number(e.target.value) })}
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                rows={3}
                className={inputCls}
                maxLength={2000}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </Field>

            <div className="space-y-2">
              <span className="block text-sm font-medium">PDF file</span>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={onPick}
                />
                <SecondaryButton onClick={() => inputRef.current?.click()}>
                  <Upload className="mr-1 h-3.5 w-3.5" />
                  {draft.file_url ? "Replace PDF" : "Upload PDF"}
                </SecondaryButton>
                {draft.file_name && (
                  <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {draft.file_name} · {formatFileSize(draft.file_size)}
                  </span>
                )}
              </div>
              {progress !== null && (
                <div className="h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              <span className="block text-xs text-muted-foreground">PDF only, maximum 10 MB.</span>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                checked={draft.is_published}
                onChange={(e) => setDraft({ ...draft, is_published: e.target.checked })}
              />
              Published (visible on the public site)
            </label>

            <div className="flex gap-2">
              <PrimaryButton disabled={saving || progress !== null}>
                {saving ? "Saving…" : "Save document"}
              </PrimaryButton>
              <SecondaryButton onClick={() => setDraft(null)}>Cancel</SecondaryButton>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-0">
        {data.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No documents yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 font-semibold">Title</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Created</th>
                  <th className="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.id} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-3">
                      <span className="font-medium text-foreground">{d.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {d.file_name ?? "—"} · {formatFileSize(d.file_size)}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          d.is_published
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {d.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-2">
                        <SecondaryButton onClick={() => edit(d)}>
                          <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                        </SecondaryButton>
                        <DangerButton onClick={() => del(d)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </DangerButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
