import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { company, focusAreas } from "@/content/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Trillion Liberty Pte Ltd" },
      {
        name: "description",
        content:
          "Contact Trillion Liberty Pte Ltd in Singapore for marine, port, diving, industrial and control-system equipment quotes. Email industrial@tlibertypte.com.",
      },
      { property: "og:title", content: "Contact — Trillion Liberty" },
      {
        property: "og:description",
        content: "Request a quote for marine and port equipment.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    category: focusAreas[0].title,
    message: "",
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Quote request — ${form.category} — ${form.company || form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nCompany: ${form.company}\nEmail: ${form.email}\nPhone: ${form.phone}\nCategory: ${form.category}\n\nRequirement:\n${form.message}`,
    );
    window.location.href = `mailto:${company.email}?subject=${subject}&body=${body}`;
  };

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-teal">
            Get in touch
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold md:text-5xl">
            Request a Quote
          </h1>
          <p className="mt-6 max-w-2xl text-primary-foreground/80">
            Tell us what you need — a single spare, a project package, or a custom control panel. We respond within one business day.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-3 md:px-8">
        <aside className="space-y-6 md:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Contact details</h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent-teal" />
                <span>{company.address}</span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent-teal" />
                <a href={`mailto:${company.email}`} className="hover:underline">{company.email}</a>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent-teal" />
                <a href={company.phoneHref} className="hover:underline">{company.phone}</a>
              </li>
            </ul>
            <p className="mt-6 text-xs text-muted-foreground">UEN: {company.uen}</p>
          </div>

          <div className="rounded-xl border border-border bg-secondary/50 p-6 text-sm">
            <p className="font-semibold">Response time</p>
            <p className="mt-1 text-muted-foreground">Within 1 business day, typically same day for in-stock spares.</p>
          </div>
        </aside>

        <form
          onSubmit={onSubmit}
          className="rounded-xl border border-border bg-card p-6 md:col-span-2 md:p-8"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name *">
              <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Company">
              <input value={form.company} onChange={(e) => set("company", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Email *">
              <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Category" className="md:col-span-2">
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                {focusAreas.map((f) => (
                  <option key={f.slug} value={f.title}>{f.title}</option>
                ))}
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Requirement *" className="md:col-span-2">
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                className={inputCls}
                placeholder="Describe the equipment or specification, quantities, delivery port and required date."
              />
            </Field>
          </div>
          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 md:w-auto"
          >
            Send Request
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            Submitting opens your email client with the message pre-filled to {company.email}.
          </p>
        </form>
      </section>
    </>
  );
}

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className ?? ""}`}>
      <span className="mb-1.5 block font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}