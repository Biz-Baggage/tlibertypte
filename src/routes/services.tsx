import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, Truck, Wrench, Cpu, Globe2 } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { siteContentQuery } from "@/lib/site-content";

export const Route = createFileRoute("/services")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  head: () => ({
    meta: [
      { title: "Services — Trillion Liberty Pte Ltd" },
      {
        name: "description",
        content:
          "Equipment supply, global sourcing, port delivery, service & maintenance, and custom control-panel design from Trillion Liberty Pte Ltd.",
      },
      { property: "og:title", content: "Services — Trillion Liberty" },
      {
        property: "og:description",
        content: "Supply, sourcing, logistics, maintenance and custom solution design.",
      },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

const icons = [Boxes, Globe2, Truck, Wrench, Cpu];

function ServicesPage() {
  const { data } = useSuspenseQuery(siteContentQuery);
  const s = data.settings;
  if (!s) return null;
  const { focusAreas, services } = data;
  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-teal">
            What we do
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold md:text-5xl">
            {s.services_intro}
          </h1>
          <p className="mt-6 max-w-2xl text-primary-foreground/80">
            {s.services_body}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((svc, i) => {
            const Icon = icons[i] ?? Wrench;
            return (
              <article key={svc.id} className="rounded-xl border border-border bg-card p-8">
                <span className="grid h-12 w-12 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-xl font-bold">{svc.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{svc.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <h2 className="text-3xl font-bold">Product categories we serve</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {focusAreas.map((f) => (
              <div key={f.id} className="rounded-lg border border-border bg-card p-5">
                <p className="font-semibold text-primary">{f.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary p-10 text-primary-foreground md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Have a specification ready?</h2>
            <p className="mt-2 text-primary-foreground/80">
              Share your BOQ or drawing and we will come back with pricing and lead times.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-accent-teal px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            Request a Quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}