# Add Vercel deployment support

The project's Nitro build currently targets Cloudflare Workers by default (and has a `build:node` variant for cPanel). Vercel needs its own preset so Nitro emits the `.vercel/output/` directory Vercel expects. Without it, Vercel treats the repo as a plain Vite SPA, so the SSR server never runs and server functions (admin, image upload, site content) fail at runtime.

## Changes

1. **`package.json`** — add a `build:vercel` script:
   ```
   "build:vercel": "NITRO_PRESET=vercel vite build"
   ```

2. **`vercel.json`** (new, repo root) — tell Vercel to use that script and serve Nitro's output:
   ```json
   {
     "buildCommand": "bun run build:vercel",
     "installCommand": "bun install",
     "outputDirectory": ".vercel/output",
     "framework": null
   }
   ```

3. **`DEPLOY-VERCEL.md`** (new) — short guide covering:
   - Import repo in Vercel
   - Required env vars (same set as cPanel: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, plus the `VITE_SUPABASE_*` public vars)
   - Node version note (Vercel auto-detects; 20+ is fine)
   - Troubleshooting: blank page or 404 on refresh = wrong preset (Vercel picked SPA instead of running `build:vercel`); 500 on admin image upload = missing `SUPABASE_SERVICE_ROLE_KEY`

## Not changing

- Cloudflare (Lovable Publish) and cPanel (`build:node` + `app.js`) paths stay intact.
- No code changes to routes, server functions, or Supabase integration — only build target and docs.

## Note on the screenshot

The lines you saw (`[plugin tanstack-start-core::server-fn:ssr] …?tss-serverfn-split`) are **informational**, not errors. The actual failure is almost certainly that Vercel ran the default Vite build (SPA output) instead of the Nitro server build, so hitting the site produces a 404 or blank page. The `build:vercel` script + `vercel.json` above fix that. If after redeploying you still see an error, paste the red error line from the Vercel build log and I'll adjust.
