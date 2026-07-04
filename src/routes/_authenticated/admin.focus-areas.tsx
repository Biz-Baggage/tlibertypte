import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { siteContentQuery, type FocusArea } from "@/lib/site-content";
import { upsertFocusArea, deleteFocusArea } from "@/lib/site-content.functions";
import { Card, Field, PageHeader, SecondaryButton, DangerButton, inputCls } from "@/components/admin/AdminUI";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/focus-areas")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  component: FocusAreasAdmin,
});

type Draft = {
  id?: string;
  slug: string;
  title: string;
  blurb: string;
  image_url: string;
  items: string[];
  sort_order: number;
};

function toDraft(f: FocusArea): Draft {
  return {
    id: f.id,
    slug: f.slug,
    title: f.title,
    blurb: f.blurb,
    image_url: f.image_url,
    items: Array.isArray(f.items) ? (f.items as string[]) : [],
    sort_order: f.sort_order,
  };
}

function FocusAreasAdmin() {
  const { data } = useSuspenseQuery(siteContentQuery);
  const qc = useQueryClient();
  const upsert = useServerFn(upsertFocusArea);
  const remove = useServerFn(deleteFocusArea);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  useEffect(() => setDrafts(data.focusAreas.map(toDraft)), [data.focusAreas]);

  function set(i: number, patch: Partial<Draft>) {
    setDrafts((d) => d.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  }

  async function save(i: number) {
    const d = drafts[i];
    try {
      await upsert({ data: d });
      toast.success("Focus area saved");
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
      <PageHeader
        title="Focus areas"
        description="The category cards shown on the home page and About page."
      />
      <div className="mb-4 flex justify-end">
        <SecondaryButton
          onClick={() =>
            setDrafts((d) => [
              ...d,
              { slug: "", title: "", blurb: "", image_url: "", items: [], sort_order: d.length + 1 },
            ])
          }
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add focus area
        </SecondaryButton>
      </div>
      <div className="space-y-6">
        {drafts.map((d, i) => (
          <Card key={d.id ?? `new-${i}`}>
            <div className="space-y-4">
              <ImageUpload
                label="Card image"
                value={d.image_url}
                onChange={(url) => set(i, { image_url: url })}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Title">
                  <input className={inputCls} value={d.title} onChange={(e) => set(i, { title: e.target.value })} />
                </Field>
                <Field label="Slug" hint="lowercase, hyphenated (e.g. marine-equipment)">
                  <input className={inputCls} value={d.slug} onChange={(e) => set(i, { slug: e.target.value })} />
                </Field>
                <Field label="Blurb" className="md:col-span-2">
                  <textarea rows={2} className={inputCls} value={d.blurb} onChange={(e) => set(i, { blurb: e.target.value })} />
                </Field>
                <Field label="Bullet list (one per line)" className="md:col-span-2">
                  <textarea
                    rows={4}
                    className={inputCls}
                    value={d.items.join("\n")}
                    onChange={(e) => set(i, { items: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                  />
                </Field>
                <Field label="Sort order">
                  <input type="number" className={inputCls} value={d.sort_order} onChange={(e) => set(i, { sort_order: Number(e.target.value) })} />
                </Field>
                <div className="flex items-end justify-end gap-2">
                  <DangerButton onClick={() => del(i)}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                  </DangerButton>
                  <SecondaryButton onClick={() => save(i)}>Save</SecondaryButton>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}