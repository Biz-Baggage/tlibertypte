import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { siteContentQuery } from "@/lib/site-content";

export const Route = createFileRoute("/about")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  head: () => ({
    meta: [
      { title: "About — Trillion Liberty Pte Ltd" },
      {
        name: "description",
        content:
          "Trillion Liberty Pte Ltd is a Singapore-based marine and port equipment supplier serving operators across the region with global sourcing and IMO/SOLAS compliant products.",
      },
      { property: "og:title", content: "About — Trillion Liberty Pte Ltd" },
      {
        property: "og:description",
        content: "Singapore-based marine and port equipment supplier.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data } = useSuspenseQuery(siteContentQuery);
  const s = data.settings;
  if (!s) return null;
  const focusAreas = data.focusAreas;
  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-teal">
            About us
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold md:text-5xl">
            Empowering ports. Supporting ships. Trading with integrity.
          </h1>
          <p className="mt-6 max-w-2xl text-primary-foreground/80">
            {s.about_body || `${s.company_name} is a Singapore-registered supplier of marine and port equipment.`}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:px-8">
        <div>
          <h2 className="text-3xl font-bold">Who we are</h2>
          <p className="mt-4 text-muted-foreground">
            Headquartered in Singapore, we combine a global sourcing network
            with local delivery expertise across five specialist categories:
            marine, port, diving, industrial support and control systems.
          </p>
          <p className="mt-4 text-muted-foreground">
            Whether it is a single urgent spare or a full equipment package for
            a new terminal, our team owns the entire process — sourcing,
            quality checks, consolidation and delivery to your vessel or port.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary/40 p-8">
          <h3 className="text-lg font-semibold">Registered details</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Legal name</dt>
              <dd className="font-medium">{s.company_name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">UEN</dt>
              <dd className="font-medium">{s.uen}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Address</dt>
              <dd className="font-medium">{s.address}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">
                <a href={`mailto:${s.email}`} className="hover:underline">
                  {s.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">
                <a href={s.phone_href} className="hover:underline">
                  {s.phone}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <h2 className="text-3xl font-bold">Our values</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { title: "Integrity", body: "Straightforward pricing, honest lead times, and no surprises after the PO." },
              { title: "Reliability", body: "Vetted brands, tested products, and delivery you can plan around." },
              { title: "Partnership", body: "We work as an extension of your procurement and technical teams." },
            ].map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <h2 className="text-3xl font-bold">What we cover</h2>
        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {focusAreas.map((f) => (
            <li key={f.id} className="flex items-start gap-3 rounded-md border border-border bg-card p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-teal" />
              <div>
                <p className="font-semibold">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.blurb}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}