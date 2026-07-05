## Issue

The deployed site on Vercel is throwing `SUPABASE_SERVICE_ROLE_KEY missing` when the admin image upload runs. This is a **Vercel environment configuration issue**, not a code bug — the key exists in Lovable Cloud but has not been copied into your Vercel project.

## What to do

Add the service role key to Vercel:

1. Open **Vercel → your project → Settings → Environment Variables**.
2. Add a new variable:
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** the service role key from your local `.env` file (the `SUPABASE_SERVICE_ROLE_KEY=…` line)
   - **Environments:** check Production, Preview, and Development
3. Save.
4. Go to **Deployments → latest deployment → ⋯ → Redeploy** and uncheck "Use existing Build Cache".

## While you're there — verify these are also set

The site also needs these on Vercel (from the earlier fix):

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

If any are missing, add them from the same `.env` file before redeploying.

## Why no code change

`SUPABASE_SERVICE_ROLE_KEY` is a server-only secret used by the admin image upload server function. Lovable already stores it in the backend, but Vercel is a separate host and needs its own copy in its env-var settings. There is nothing to change in the repo.
