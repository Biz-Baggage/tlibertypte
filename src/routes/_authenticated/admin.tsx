import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Building2,
  Home as HomeIcon,
  Grid3x3,
  Wrench,
  UserCircle2,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { myRoleQuery } from "@/lib/site-content";

export const Route = createFileRoute("/_authenticated/admin")({
  loader: ({ context }) => context.queryClient.ensureQueryData(myRoleQuery),
  component: AdminLayout,
});

type NavItem = {
  to: "/admin" | "/admin/company" | "/admin/home" | "/admin/focus-areas" | "/admin/services" | "/admin/account";
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};
const nav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/company", label: "Company info", icon: Building2 },
  { to: "/admin/home", label: "Home page", icon: HomeIcon },
  { to: "/admin/focus-areas", label: "Focus areas", icon: Grid3x3 },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/account", label: "Account", icon: UserCircle2 },
];

function AdminLayout() {
  const { data: role } = useSuspenseQuery(myRoleQuery);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!role.isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-primary">Not authorized</h1>
        <p className="mt-3 text-muted-foreground">
          Your account is signed in but does not have admin access. Sign in with the
          authorized admin email to manage the site.
        </p>
        <button
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          onClick={async () => {
            await supabase.auth.signOut();
            queryClient.clear();
            navigate({ to: "/auth" });
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[220px_1fr] md:px-8">
      <aside className="md:sticky md:top-20 md:self-start">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Admin
          </p>
          <nav className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-primary"
                activeProps={{ className: "bg-primary/10 text-primary" }}
                activeOptions={{ exact: n.exact }}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 border-t border-border pt-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
            >
              <ExternalLink className="h-4 w-4" /> View site
            </a>
            <button
              onClick={signOut}
              className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}