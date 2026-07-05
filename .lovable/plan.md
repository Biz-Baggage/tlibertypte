## The situation

`SUPABASE_SERVICE_ROLE_KEY` is a privileged backend secret. On Lovable Cloud it is managed internally and **not shown to you** — there is no `.env` file you can open to read it, and I can't display it here either. It only exists inside Lovable's backend runtime, which is why the app works in the Lovable preview but fails on Vercel.

This means the current admin image upload code path (which uses the service role to bypass RLS) **cannot run on Vercel** as-is.

## Two ways forward

### Option A — Remove the need for the service role on Vercel (recommended)

Rewrite the admin image upload so it uses the **signed-in admin's own session** instead of the service role. Concretely:

1. Change `src/lib/site-image.functions.ts` to upload with `context.supabase` (the user-scoped client from `requireSupabaseAuth`) instead of `supabaseAdmin`.
2. Add Storage RLS policies on the `site-images` bucket that allow `INSERT` and `SELECT` when `public.has_role(auth.uid(), 'admin')` is true.
3. Deploy — no service role key needed on Vercel.

Trade-off: uploads are gated by the admin's session + storage policies rather than by a server-only key. Functionally identical for your admin-only use case.

### Option B — Stay on Lovable hosting

Keep using the published Lovable URL (`tlibertypte.lovable.app` or your custom domain pointed at it) instead of Vercel. Everything already works there because Lovable Cloud injects the service role key at runtime.

## Recommendation

Go with **Option A**. It's a small, contained change (one server function + one migration adding two storage policies) and removes the Vercel deployment blocker permanently.

Reply with **A** or **B** and I'll implement it.
