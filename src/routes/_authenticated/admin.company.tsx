import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { siteContentQuery, type Settings } from "@/lib/site-content";
import { updateSiteSettings } from "@/lib/site-content.functions";
import { Card, Field, PageHeader, PrimaryButton, inputCls } from "@/components/admin/AdminUI";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/company")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  component: CompanyPage,
});

type Form = Omit<Settings, "id" | "updated_at">;

function CompanyPage() {
  const { data } = useSuspenseQuery(siteContentQuery);
  const qc = useQueryClient();
  const save = useServerFn(updateSiteSettings);
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data.settings) {
      const { id: _id, updated_at: _u, ...rest } = data.settings;
      setForm(rest);
    }
  }, [data.settings]);

  if (!form) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    try {
      await save({ data: form });
      toast.success("Company info saved");
      qc.invalidateQueries({ queryKey: siteContentQuery.queryKey });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Company info" description="Shown across the header, footer, About and Contact pages." />
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Identity</h2>
          <div className="mb-6">
            <ImageUpload
              label="Company logo"
              hint="Displayed in the header and footer. PNG with transparent background recommended."
              aspect="logo"
              value={form.logo_url ?? ""}
              onChange={(url) => set("logo_url", url)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Company name">
              <input className={inputCls} value={form.company_name} onChange={(e) => set("company_name", e.target.value)} />
            </Field>
            <Field label="Short name / brand">
              <input className={inputCls} value={form.short_name} onChange={(e) => set("short_name", e.target.value)} />
            </Field>
            <Field label="UEN" className="md:col-span-1">
              <input className={inputCls} value={form.uen} onChange={(e) => set("uen", e.target.value)} />
            </Field>
            <Field label="Domain" className="md:col-span-1">
              <input className={inputCls} value={form.domain} onChange={(e) => set("domain", e.target.value)} />
            </Field>
            <Field label="Tagline" className="md:col-span-2">
              <input className={inputCls} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
            </Field>
            <Field label="Short description" className="md:col-span-2">
              <textarea rows={3} className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Contact</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Email">
              <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Phone (display)">
              <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
            <Field label="Phone link (tel:)" hint='e.g. "tel:+6597208465"'>
              <input className={inputCls} value={form.phone_href} onChange={(e) => set("phone_href", e.target.value)} />
            </Field>
            <Field label="Address">
              <input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">About page body</h2>
          <Field label="About paragraph">
            <textarea rows={5} className={inputCls} value={form.about_body ?? ""} onChange={(e) => set("about_body", e.target.value)} />
          </Field>
        </Card>

        <div className="flex justify-end">
          <PrimaryButton disabled={busy}>{busy ? "Saving…" : "Save changes"}</PrimaryButton>
        </div>
      </form>
    </div>
  );
}