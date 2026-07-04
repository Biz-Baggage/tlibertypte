import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Ship, Wrench, ShieldCheck, Globe2 } from "lucide-react";
import { company, focusAreas, heroImage, stats, testimonials, whyUs } from "@/content/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trillion Liberty — Marine & Port Equipment Suppliers Singapore" },
      {
        name: "description",
        content:
          "Marine, port, diving, industrial and control-system equipment supplied globally from Singapore. Request a quote from Trillion Liberty Pte Ltd.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <img
          src={heroImage}
          alt="Container ship docked at port at blue hour"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/60 to-primary" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-24 md:grid-cols-12 md:px-8 md:py-36">
          <div className="md:col-span-8">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary-foreground/80">
              <Ship className="h-3.5 w-3.5" /> Singapore · Global reach
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              {company.tagline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-primary-foreground/80">
              {company.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-md bg-accent-teal px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/20 transition hover:brightness-110"
              >
                Request a Quote <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10"
              >
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mb-12 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-teal">
              What we supply
            </p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Our Trading Focus Areas</h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            Five specialist categories, one accountable supplier — from bridge to berth to below the waterline.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {focusAreas.map((f) => (
            <article
              key={f.slug}
              className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={f.image}
                  alt={f.title}
                  loading="lazy"
                  width={1280}
                  height={960}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.blurb}</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {f.items.map((i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-teal" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-3 md:px-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <div className="font-display text-5xl font-bold text-primary md:text-6xl">
                {s.value}
              </div>
              <h3 className="mt-2 text-lg font-semibold">{s.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-teal">
            Why choose us
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            A supply partner your operations can trust
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((w, i) => {
            const Icon = [Globe2, Ship, ShieldCheck, Wrench][i] ?? Wrench;
            return (
              <div key={w.title} className="rounded-xl border border-border bg-card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{w.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{w.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-teal">
              What clients say
            </p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              Trusted by maritime operators
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.author} className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6">
                <blockquote className="text-primary-foreground/90">"{t.quote}"</blockquote>
                <figcaption className="mt-4 text-sm text-primary-foreground/70">
                  <span className="font-semibold text-primary-foreground">{t.author}</span> · {t.company}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-secondary/50 p-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Need a quote for your next project?</h2>
            <p className="mt-2 text-muted-foreground">
              Send us your specification and we'll respond within one business day.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Request a Quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}