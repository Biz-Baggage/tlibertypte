import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  siteContentQuery,
  type Settings,
  type Stat,
  type WhyUs,
  type Testimonial,
} from "@/lib/site-content";
import {
  updateSiteSettings,
  upsertStat,
  deleteStat,
  upsertWhyUs,
  deleteWhyUs,
  upsertTestimonial,
  deleteTestimonial,
} from "@/lib/site-content.functions";
import {
  Card,
  Field,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  inputCls,
} from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/home")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  component: HomeAdmin,
});

type HeadingForm = Omit<Settings, "id" | "updated_at">;

function HomeAdmin() {
  const { data } = useSuspenseQuery(siteContentQuery);
  const qc = useQueryClient();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Home page"
        description="Hero image, section headings, stats, why-us cards and testimonials."
      />
      <HeadingsForm settings={data.settings} qc={qc} />
      <StatsSection items={data.stats} qc={qc} />
      <WhyUsSection items={data.whyUs} qc={qc} />
      <TestimonialsSection items={data.testimonials} qc={qc} />
    </div>
  );
}

function HeadingsForm({
  settings,
  qc,
}: {
  settings: Settings | null;
  qc: ReturnType<typeof useQueryClient>;
}) {
  const save = useServerFn(updateSiteSettings);
  const [form, setForm] = useState<HeadingForm | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (settings) {
      const { id: _id, updated_at: _u, ...rest } = settings;
      setForm(rest);
    }
  }, [settings]);

  if (!form) return null;
  const set = <K extends keyof HeadingForm>(k: K, v: HeadingForm[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    try {
      await save({ data: form });
      toast.success("Home content saved");
      qc.invalidateQueries({ queryKey: siteContentQuery.queryKey });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Hero & section headings</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Hero image URL" className="md:col-span-2" hint="Path served from the site, or a full URL">
            <input className={inputCls} value={form.hero_image_url} onChange={(e) => set("hero_image_url", e.target.value)} />
          </Field>
          <Field label="Hero eyebrow text">
            <input className={inputCls} value={form.hero_eyebrow} onChange={(e) => set("hero_eyebrow", e.target.value)} />
          </Field>
          <Field label="Hero secondary button">
            <input className={inputCls} value={form.hero_secondary_cta} onChange={(e) => set("hero_secondary_cta", e.target.value)} />
          </Field>
          <Field label="Focus areas — eyebrow">
            <input className={inputCls} value={form.focus_eyebrow} onChange={(e) => set("focus_eyebrow", e.target.value)} />
          </Field>
          <Field label="Focus areas — heading">
            <input className={inputCls} value={form.focus_heading} onChange={(e) => set("focus_heading", e.target.value)} />
          </Field>
          <Field label="Focus areas — subheading" className="md:col-span-2">
            <input className={inputCls} value={form.focus_subheading} onChange={(e) => set("focus_subheading", e.target.value)} />
          </Field>
          <Field label="Track record — eyebrow">
            <input className={inputCls} value={form.track_record_eyebrow} onChange={(e) => set("track_record_eyebrow", e.target.value)} />
          </Field>
          <Field label="Track record — heading">
            <input className={inputCls} value={form.track_record_heading} onChange={(e) => set("track_record_heading", e.target.value)} />
          </Field>
          <Field label="Why us — eyebrow">
            <input className={inputCls} value={form.why_eyebrow} onChange={(e) => set("why_eyebrow", e.target.value)} />
          </Field>
          <Field label="Why us — heading">
            <input className={inputCls} value={form.why_heading} onChange={(e) => set("why_heading", e.target.value)} />
          </Field>
          <Field label="Testimonials — eyebrow">
            <input className={inputCls} value={form.testimonials_eyebrow} onChange={(e) => set("testimonials_eyebrow", e.target.value)} />
          </Field>
          <Field label="Testimonials — heading">
            <input className={inputCls} value={form.testimonials_heading} onChange={(e) => set("testimonials_heading", e.target.value)} />
          </Field>
          <Field label="CTA band — heading" className="md:col-span-2">
            <input className={inputCls} value={form.cta_heading} onChange={(e) => set("cta_heading", e.target.value)} />
          </Field>
          <Field label="CTA band — body" className="md:col-span-2">
            <textarea rows={2} className={inputCls} value={form.cta_body} onChange={(e) => set("cta_body", e.target.value)} />
          </Field>
          <Field label="Services page — intro heading" className="md:col-span-2">
            <input className={inputCls} value={form.services_intro} onChange={(e) => set("services_intro", e.target.value)} />
          </Field>
          <Field label="Services page — intro body" className="md:col-span-2">
            <textarea rows={2} className={inputCls} value={form.services_body} onChange={(e) => set("services_body", e.target.value)} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end">
          <PrimaryButton disabled={busy}>{busy ? "Saving…" : "Save headings"}</PrimaryButton>
        </div>
      </Card>
    </form>
  );
}

// ==================== STATS ====================
function StatsSection({ items, qc }: { items: Stat[]; qc: ReturnType<typeof useQueryClient> }) {
  const upsert = useServerFn(upsertStat);
  const remove = useServerFn(deleteStat);
  const [drafts, setDrafts] = useState<Array<Partial<Stat>>>([]);
  useEffect(() => setDrafts(items.map((i) => ({ ...i }))), [items]);

  async function save(draft: Partial<Stat>, index: number) {
    try {
      await upsert({
        data: {
          id: draft.id,
          value: draft.value ?? "",
          label: draft.label ?? "",
          note: draft.note ?? "",
          sort_order: draft.sort_order ?? index,
        },
      });
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: siteContentQuery.queryKey });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }
  async function del(id?: string) {
    if (!id) {
      setDrafts((d) => d.filter((x) => x.id));
      return;
    }
    if (!confirm("Delete this stat?")) return;
    try {
      await remove({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: siteContentQuery.queryKey });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Stats (Track Record)</h2>
        <SecondaryButton
          onClick={() =>
            setDrafts((d) => [...d, { value: "", label: "", note: "", sort_order: d.length + 1 }])
          }
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add stat
        </SecondaryButton>
      </div>
      <div className="space-y-3">
        {drafts.map((s, i) => (
          <div key={s.id ?? `new-${i}`} className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[100px_1fr_1fr_80px_auto]">
            <input className={inputCls} placeholder="80+" value={s.value ?? ""} onChange={(e) => setDrafts((d) => d.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
            <input className={inputCls} placeholder="Label" value={s.label ?? ""} onChange={(e) => setDrafts((d) => d.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
            <input className={inputCls} placeholder="Note" value={s.note ?? ""} onChange={(e) => setDrafts((d) => d.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))} />
            <input type="number" className={inputCls} value={s.sort_order ?? 0} onChange={(e) => setDrafts((d) => d.map((x, j) => (j === i ? { ...x, sort_order: Number(e.target.value) } : x)))} />
            <div className="flex gap-2">
              <SecondaryButton onClick={() => save(s, i)}>Save</SecondaryButton>
              <DangerButton onClick={() => del(s.id)}><Trash2 className="h-3.5 w-3.5" /></DangerButton>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ==================== WHY US ====================
function WhyUsSection({ items, qc }: { items: WhyUs[]; qc: ReturnType<typeof useQueryClient> }) {
  const upsert = useServerFn(upsertWhyUs);
  const remove = useServerFn(deleteWhyUs);
  const [drafts, setDrafts] = useState<Array<Partial<WhyUs>>>([]);
  useEffect(() => setDrafts(items.map((i) => ({ ...i }))), [items]);

  async function save(d: Partial<WhyUs>, i: number) {
    try {
      await upsert({ data: { id: d.id, title: d.title ?? "", body: d.body ?? "", sort_order: d.sort_order ?? i } });
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: siteContentQuery.queryKey });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }
  async function del(id?: string) {
    if (!id) return setDrafts((d) => d.filter((x) => x.id));
    if (!confirm("Delete?")) return;
    try {
      await remove({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: siteContentQuery.queryKey });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Why choose us</h2>
        <SecondaryButton onClick={() => setDrafts((d) => [...d, { title: "", body: "", sort_order: d.length + 1 }])}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add card
        </SecondaryButton>
      </div>
      <div className="space-y-3">
        {drafts.map((w, i) => (
          <div key={w.id ?? `new-${i}`} className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[1fr_2fr_80px_auto]">
            <input className={inputCls} placeholder="Title" value={w.title ?? ""} onChange={(e) => setDrafts((d) => d.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
            <textarea rows={2} className={inputCls} placeholder="Body" value={w.body ?? ""} onChange={(e) => setDrafts((d) => d.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} />
            <input type="number" className={inputCls} value={w.sort_order ?? 0} onChange={(e) => setDrafts((d) => d.map((x, j) => (j === i ? { ...x, sort_order: Number(e.target.value) } : x)))} />
            <div className="flex gap-2">
              <SecondaryButton onClick={() => save(w, i)}>Save</SecondaryButton>
              <DangerButton onClick={() => del(w.id)}><Trash2 className="h-3.5 w-3.5" /></DangerButton>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ==================== TESTIMONIALS ====================
function TestimonialsSection({ items, qc }: { items: Testimonial[]; qc: ReturnType<typeof useQueryClient> }) {
  const upsert = useServerFn(upsertTestimonial);
  const remove = useServerFn(deleteTestimonial);
  const [drafts, setDrafts] = useState<Array<Partial<Testimonial>>>([]);
  useEffect(() => setDrafts(items.map((i) => ({ ...i }))), [items]);

  async function save(d: Partial<Testimonial>, i: number) {
    try {
      await upsert({ data: { id: d.id, quote: d.quote ?? "", author: d.author ?? "", company: d.company ?? "", sort_order: d.sort_order ?? i } });
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: siteContentQuery.queryKey });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }
  async function del(id?: string) {
    if (!id) return setDrafts((d) => d.filter((x) => x.id));
    if (!confirm("Delete?")) return;
    try {
      await remove({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: siteContentQuery.queryKey });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Testimonials</h2>
        <SecondaryButton onClick={() => setDrafts((d) => [...d, { quote: "", author: "", company: "", sort_order: d.length + 1 }])}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add
        </SecondaryButton>
      </div>
      <div className="space-y-4">
        {drafts.map((t, i) => (
          <div key={t.id ?? `new-${i}`} className="rounded-lg border border-border p-3">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_80px_auto]">
              <input className={inputCls} placeholder="Author" value={t.author ?? ""} onChange={(e) => setDrafts((d) => d.map((x, j) => (j === i ? { ...x, author: e.target.value } : x)))} />
              <input className={inputCls} placeholder="Company" value={t.company ?? ""} onChange={(e) => setDrafts((d) => d.map((x, j) => (j === i ? { ...x, company: e.target.value } : x)))} />
              <input type="number" className={inputCls} value={t.sort_order ?? 0} onChange={(e) => setDrafts((d) => d.map((x, j) => (j === i ? { ...x, sort_order: Number(e.target.value) } : x)))} />
              <div className="flex gap-2">
                <SecondaryButton onClick={() => save(t, i)}>Save</SecondaryButton>
                <DangerButton onClick={() => del(t.id)}><Trash2 className="h-3.5 w-3.5" /></DangerButton>
              </div>
            </div>
            <textarea
              rows={2}
              className={`${inputCls} mt-3`}
              placeholder="Quote"
              value={t.quote ?? ""}
              onChange={(e) => setDrafts((d) => d.map((x, j) => (j === i ? { ...x, quote: e.target.value } : x)))}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}