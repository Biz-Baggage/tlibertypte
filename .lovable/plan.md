
# Admin Panel — Editable Website Content

## What you'll get
- A private `/admin` area, protected by login (email + password).
- Every visible piece of content on the public site becomes editable from that panel: company details, hero, focus areas, stats, "why us", testimonials, services.
- Content is stored in Lovable Cloud (managed database) instead of the hard-coded `src/content/site.ts`.
- The public site reads the latest content on every page load.

## Login credentials — important note
You shared the admin password in chat. I will NOT hardcode it in the codebase (that would be visible to anyone with repo access and would leak it in git history). Instead:

1. I'll enable Lovable Cloud and create the admin account **once** using a one-time server seed that reads the password from a secure secret, then immediately clears it.
2. The email `contact@tlibertypte.com` becomes the admin login.
3. After the first seed run you can change the password anytime from the admin panel's "Account" screen. Please rotate it soon since it was shared in plain chat.

## Pages / features

### Public site (unchanged look)
- Home, About, Services, Contact — same as today, but text/images/lists come from the database.

### Admin (behind login)
- `/auth` — sign-in page (email + password, "forgot password" link).
- `/admin` — dashboard overview.
- `/admin/company` — name, tagline, description, email, phone, address, UEN.
- `/admin/home` — hero heading/subheading/CTA + stats + why-us cards + testimonials.
- `/admin/focus-areas` — add/edit/delete/reorder the 6 focus areas (title, blurb, bullet list, image).
- `/admin/services` — add/edit/delete/reorder services.
- `/admin/account` — change password, sign out.

Only users with the `admin` role can reach `/admin/*`. Non-admins are redirected to `/`.

## Data model (Lovable Cloud tables)
- `site_settings` — one row: company info + home hero fields.
- `focus_areas` — id, slug, title, blurb, image_url, items (json array), sort_order.
- `services` — id, title, body, sort_order.
- `stats` — id, value, label, note, sort_order.
- `why_us` — id, title, body, sort_order.
- `testimonials` — id, quote, author, company, sort_order.
- `user_roles` — separate table storing `admin` / `user` roles (per security best practice — never on profiles).
- Image uploads go to Lovable Cloud storage; the URL is saved in the row.

All tables have RLS: **public read** for site content (so the marketing site works for anonymous visitors) and **admin-only write**. `user_roles` is auth-only.

## Technical notes (skip if not relevant)
- Auth: Supabase email/password via Lovable Cloud. Role check via a `has_role(uuid, app_role)` security-definer function used in RLS.
- Public reads run through TanStack Start server functions using the anon key with public SELECT policies — no service-role in loaders.
- Admin writes go through authenticated server functions (`requireSupabaseAuth`) that verify `has_role(userId, 'admin')` before touching data.
- Existing `src/content/site.ts` gets replaced by DB fetchers; a migration seeds the current content so nothing visually changes on day one.
- Admin UI uses shadcn Form + react-hook-form + zod validation.

## What I need from you before I build

1. **Confirm** you're OK with me enabling Lovable Cloud (adds managed database + auth + storage — no external accounts).
2. **Confirm** the seed approach: I create the admin user once from a temporary secret, then you rotate the password from the admin panel.
3. Should I include **password reset via email** (recommended) so you can recover if you forget?
4. Any other users besides `contact@tlibertypte.com` who need admin access now, or just you?

Reply "go" (plus answers to 3 & 4) and I'll build the whole thing in one pass.
