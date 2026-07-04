import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Building2, Home as HomeIcon, Grid3x3, Wrench, UserCircle2 } from "lucide-react";
import { siteContentQuery } from "@/lib/site-content";

export const Route = createFileRoute("/_authenticated/admin/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  component: Dashboard,
});

function Dashboard() {
  const { data } = useSuspenseQuery(siteContentQuery);
  const cards = [
    { to: "/admin/company", label: "Company info", icon: Building2, count: 1, note: "Name, contact, UEN" },
    { to: "/admin/home", label: "Home page content", icon: HomeIcon, count: data.stats.length + data.whyUs.length + data.testimonials.length, note: "Headings, stats, testimonials" },
    { to: "/admin/focus-areas", label: "Focus areas", icon: Grid3x3, count: data.focusAreas.length, note: "Cards on home page" },
    { to: "/admin/services", label: "Services", icon: Wrench, count: data.services.length, note: "Services page entries" },
    { to: "/admin/account", label: "Account", icon: UserCircle2, count: 0, note: "Password & sign out" },
  ] as const;
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage every piece of content shown on the public site.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.note}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}