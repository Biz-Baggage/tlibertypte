import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { siteContentQuery, type Service } from "@/lib/site-content";
import { upsertService, deleteService } from "@/lib/site-content.functions";
import { Card, PageHeader, SecondaryButton, DangerButton, inputCls } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/services")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  component: ServicesAdmin,
});

function ServicesAdmin() {
  const { data } = useSuspenseQuery(siteContentQuery);
  const qc = useQueryClient();
  const upsert = useServerFn(upsertService);
  const remove = useServerFn(deleteService);
  const [drafts, setDrafts] = useState<Array<Partial<Service>>>([]);
  useEffect(() => setDrafts(data.services.map((s) => ({ ...s }))), [data.services]);

  function set(i: number, patch: Partial<Service>) {
    setDrafts((d) => d.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  }
  async function save(i: number) {
    const d = drafts[i];
    try {
      await upsert({
        data: { id: d.id, title: d.title ?? "", body: d.body ?? "", sort_order: d.sort_order ?? i },
      });
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: siteContentQuery.queryKey });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }
  async function del(i: number) {
    const d = drafts[i];
    if (!d.id) return setDrafts((arr) => arr.filter((_, j) => j !== i));
    if (!confirm(`Delete "${d.title}"?`)) return;
    try {
      await remove({ data: { id: d.id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: siteContentQuery.queryKey });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <PageHeader title="Services" description="Entries shown on the /services page." />
      <div className="mb-4 flex justify-end">
        <SecondaryButton onClick={() => setDrafts((d) => [...d, { title: "", body: "", sort_order: d.length + 1 }])}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add service
        </SecondaryButton>
      </div>
      <div className="space-y-3">
        {drafts.map((s, i) => (
          <Card key={s.id ?? `new-${i}`}>
            <div className="grid gap-3 md:grid-cols-[1fr_2fr_80px_auto]">
              <input className={inputCls} placeholder="Title" value={s.title ?? ""} onChange={(e) => set(i, { title: e.target.value })} />
              <textarea rows={2} className={inputCls} placeholder="Body" value={s.body ?? ""} onChange={(e) => set(i, { body: e.target.value })} />
              <input type="number" className={inputCls} value={s.sort_order ?? 0} onChange={(e) => set(i, { sort_order: Number(e.target.value) })} />
              <div className="flex gap-2">
                <SecondaryButton onClick={() => save(i)}>Save</SecondaryButton>
                <DangerButton onClick={() => del(i)}><Trash2 className="h-3.5 w-3.5" /></DangerButton>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}