
# Trillion Liberty PTE — Marine & Port Equipment Website

A multi-page marketing site inspired by mafjar.com, tailored to Trillion Liberty Pte Ltd.

## Company info (baked into site)
- Name: **Trillion Liberty Pte Ltd** (brand short: T Liberty)
- Address: 30 Roberts Lane, #02-01, Singapore
- UEN: 201935886R
- Email: industrial@tlibertypte.com
- Phone: +65 9720 8465
- Positioning: Marine & Port equipment suppliers / solutions provider

## Pages
1. **Home (`/`)**
   - Hero: tagline "Specialists in Marine & Port Trading Solutions", primary CTA "Request a Quote", secondary "Our Focus Areas"
   - Featured Products carousel (5–6 items across focus areas)
   - Track Record stats (Projects, Clients, 24/7 Support — placeholders until you send real numbers)
   - Focus Areas grid (5 cards, see below)
   - Testimonials carousel (generic placeholders, easy to swap)
   - Why Choose Us (Global Sourcing / On-Time Delivery / Certified & Compliant / Tailored Solutions)
   - Footer CTA band
2. **About (`/about`)** — company story, mission, values, UEN + registered address
3. **Services (`/services`)** — supply, sourcing, logistics, maintenance, custom control-panel design
4. **Contact (`/contact`)** — full contact block + inquiry / quote request form (client-side, submits to a mailto or a stub handler until Cloud is enabled)

Shared: sticky header with logo + nav + "Request a Quote" button, footer with contact, focus areas, quick links, and copyright.

## Focus Areas (5)
- **Marine Equipment** — Engines & Spare Parts, Navigation & Communication, Safety & Life-Saving Appliances, Electrical & Mechanical Systems
- **Port Equipment** — Cargo & Container Handling, Mooring & Dock Accessories, Terminal & Yard Infrastructure
- **Diving Equipment** — Umbilical & ROV Cable, Control Panels & Video Systems, Personal Gear, Underwater Tools
- **Industrial Support** — Welding & Fabrication Tools, PPE & Workwear, Fasteners & Hydraulic Hoses, Paints & Coatings
- **Control Systems** — Power & Control Panels, ELV & Pump Control, Service & Maintenance, Custom Solution Design

## Design direction
Pending your logo upload. Once received I'll extract the brand colors and typography from it and build the palette around that (likely a maritime navy/steel base with an accent pulled from the logo). While waiting, I'll scaffold with a neutral navy palette and swap tokens once the logo is in.

- Semantic tokens in `src/styles.css` (`--color-primary`, `--color-accent`, gradients, shadows)
- Typography: strong industrial sans for headings + clean humanist sans for body (final pair chosen after logo)
- Imagery: AI-generated hero + focus area photos (ships, cranes, divers, welding, control panels)
- Motion: subtle scroll reveals + hero parallax via framer-motion

## Technical notes
- TanStack Start file-based routes under `src/routes/`: `index.tsx`, `about.tsx`, `services.tsx`, `contact.tsx`
- Per-route `head()` metadata (title, description, og:*, canonical)
- JSON-LD Organization schema in `__root.tsx`
- shadcn/ui components (Button, Card, Input, Textarea, Carousel, Accordion)
- All content authored in one central `src/content/site.ts` file so text/stats/testimonials are easy for you to edit later
- No backend needed for v1; contact form uses `mailto:industrial@tlibertypte.com`. If you'd like real form submissions later, we can enable Lovable Cloud and store leads.

## What I still need from you
1. **Your logo** (attach it in the next message) — drives colors + typography
2. Optional: real stats (years in business, projects completed, clients served)
3. Optional: any real client testimonials/logos to feature
4. Optional: any hero photography you own (otherwise I'll generate)

Reply with the logo (and any of the optional items) and I'll implement the full site in one pass.
