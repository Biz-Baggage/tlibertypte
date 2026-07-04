## Deploying to cPanel (Node.js App)

Your project is a TanStack Start app (SSR + server functions for the admin panel and image uploads). It is NOT a static site, so you cannot just drag `dist/` into `public_html`. It must run as a Node.js app under cPanel's **Setup Node.js App** (Passenger).

The Lovable Cloud backend (database, auth, storage) will keep working from cPanel — the API is reachable from any server. Only the frontend + SSR moves.

### What you need on cPanel

- A cPanel plan with **Setup Node.js App** available (Node 20+).
- SSH access (recommended) or File Manager.
- Ability to set **Environment Variables** in the Node.js App UI.
- A domain or subdomain pointed at the cPanel account.

### One-time preparation in the project

I will make these changes in build mode so the project can run under plain Node instead of the current Cloudflare Worker target:

1. **Switch the build target to Node.**
   - Update `vite.config.ts` so TanStack Start builds for a Node server (`target: 'node-server'`) instead of the Cloudflare Worker target.
   - Verify no server code depends on Worker-only APIs (this app doesn't; it only uses Supabase over HTTPS).
2. **Add a Passenger entry point.**
   - Create `app.js` at the project root that imports the built server (`.output/server/index.mjs`) and starts it. cPanel Passenger expects a single startup file.
3. **Add a build script for deployment.**
   - `package.json` gets a `deploy:build` script that runs `bun install --production=false && bun run build`.
4. **Document required env vars** (copied from `.env`, minus dev-only entries):
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID`
   - `SUPABASE_SERVICE_ROLE_KEY` (needed for admin image uploads — this is currently managed by Lovable Cloud and I will show you how to retrieve a value to paste into cPanel; if it cannot be exposed, image upload will not work off-Lovable and we fall back to pasted image URLs.)
   - `NODE_ENV=production`

### Deployment steps you'll run on cPanel

```text
1. Sync the project to GitHub (Lovable → GitHub button).
2. In cPanel → Setup Node.js App → Create Application:
   - Node version: 20.x
   - Application mode: Production
   - Application root: /home/USER/apps/trillion-liberty
   - Application URL: your domain / subdomain
   - Application startup file: app.js
3. SSH in, cd into the app root, then:
     git clone <your repo> .
     source /home/USER/nodevenv/apps/trillion-liberty/20/bin/activate
     npm install -g bun
     bun install
     bun run build
4. In the Node.js App UI, add all env vars listed above, then Restart.
5. Point your domain's A record (or the subdomain) to the cPanel server IP.
```

### Honest trade-offs you should know

- **Fragility.** cPanel Passenger + Node + Vite SSR is a supported combo but not a common one. Any future Lovable template update that adds Worker-only features could break your cPanel build; you'd have to re-do the Node target patch.
- **No auto-deploy.** Each change made in Lovable requires you to pull the latest commit on cPanel, re-run `bun install && bun run build`, and restart the app. There is no CI wired up unless we add GitHub Actions.
- **Backend still lives on Lovable Cloud.** The database, auth, storage bucket, and admin logins are all Lovable Cloud. Only the frontend moves. If you also want the database off Lovable, that's a much larger migration.
- **Simpler alternative.** If the only reason you want cPanel is because you already own the domain there, you can leave the app on Lovable hosting and just point the domain's DNS to Lovable. Same result, zero deployment work. I'd genuinely recommend this unless you have a hard requirement to run the server on cPanel.

### After you approve

In build mode I will:
- Patch `vite.config.ts` to the Node server target.
- Add `app.js` (Passenger entry).
- Add a `DEPLOY-CPANEL.md` with the exact commands, env-var checklist, and troubleshooting for the common Passenger errors (missing startup file, wrong Node version, missing env vars).
- I will NOT modify anything in Lovable Cloud, so your current preview keeps working.
