# Deploying to Vercel

This project is a TanStack Start app (SSR + server functions). Vercel needs
to run the Nitro `vercel` preset so it emits `.vercel/output/`, otherwise
Vercel falls back to a plain Vite SPA build and the server functions
(admin, image upload, site content) never run.

## 1. Import the repo

1. In Vercel, **Add New → Project** and import the GitHub repo.
2. When Vercel asks to configure the framework, leave it as **Other** —
   `vercel.json` in the repo root already sets the correct build command
   (`bun run build:vercel`) and output directory (`.vercel/output`).
3. Node.js version: 20 or later (Vercel default is fine).

## 2. Environment variables

Set these in **Project Settings → Environment Variables** (Production +
Preview). Copy the values from your local `.env`.

Server-side (never prefixed with `VITE_`):

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — required for admin image upload

Client-side (exposed to the browser bundle):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

After adding or changing env vars, redeploy — Vercel does not pick up new
values until the next build.

## 3. Deploy

Push to the connected branch (usually `main`). Vercel runs
`bun install` → `bun run build:vercel` and serves the SSR output.

## Troubleshooting

**Blank page or 404 on every route (including `/`)**
Vercel ran the default Vite build instead of `build:vercel`. Confirm
`vercel.json` is at the repo root and `Framework Preset` in the Vercel
project settings is set to **Other** (not "Vite").

**500 on admin image upload**
`SUPABASE_SERVICE_ROLE_KEY` is missing from Vercel env vars. Add it and
redeploy.

**"Cannot find module …" during build**
`bun install` did not run. Delete the Vercel build cache
(Project → Settings → General → Clear Build Cache) and redeploy.

**Session functions return `Unauthorized: No authorization header`**
The client bundle needs the `VITE_SUPABASE_*` vars to sign users in.
Confirm all three are set for the environment you're deploying.