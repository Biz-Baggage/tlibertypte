import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { siteContentQuery } from "@/lib/site-content";
import defaultLogo from "@/assets/logo.png.asset.json";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { data } = useSuspenseQuery(siteContentQuery);
  const companyName = data.settings?.company_name ?? "Trillion Liberty";
  const logoSrc = data.settings?.logo_url?.trim() || defaultLogo.url;
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label={companyName}>
          <img src={logoSrc} alt={companyName} className="h-10 w-auto md:h-11" />
          <span className="hidden text-xs font-medium uppercase tracking-widest text-muted-foreground sm:inline">
            Marine & Port
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/auth"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Admin
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          className="grid h-10 w-10 place-items-center rounded-md border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary"
                activeProps={{ className: "bg-secondary text-primary" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}