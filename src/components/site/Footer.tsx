import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { siteContentQuery } from "@/lib/site-content";
import defaultLogo from "@/assets/logo.png.asset.json";

export function Footer() {
  const { data } = useSuspenseQuery(siteContentQuery);
  const s = data.settings;
  const focusAreas = data.focusAreas;
  if (!s) return null;
  const logoSrc = s.logo_url?.trim() || defaultLogo.url;
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div>
          <img
            src={logoSrc}
            alt={s.company_name}
            className="h-11 w-auto brightness-0 invert"
          />
          <p className="mt-3 text-sm text-primary-foreground/70">
            {s.company_name}. Marine & port equipment supply, sourcing and control-system solutions.
          </p>
          <p className="mt-2 text-xs text-primary-foreground/60">UEN: {s.uen}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">
            Focus Areas
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {focusAreas.map((f) => (
              <li key={f.id} className="text-primary-foreground/80">
                {f.title}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/about" className="hover:underline">About</Link></li>
            <li><Link to="/services" className="hover:underline">Services</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{s.address}</li>
            <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0" /><a href={`mailto:${s.email}`} className="hover:underline">{s.email}</a></li>
            <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0" /><a href={s.phone_href} className="hover:underline">{s.phone}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-primary-foreground/60 md:flex-row md:items-center md:justify-between md:px-8">
          <p>© {new Date().getFullYear()} {s.company_name}. All rights reserved.</p>
          <p>{s.domain}</p>
        </div>
      </div>
    </footer>
  );
}