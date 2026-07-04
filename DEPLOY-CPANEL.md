# Deploying to cPanel (Node.js App)

This project is a TanStack Start SSR app. It is not a static site — it must
run as a Node.js process. cPanel exposes this via **Setup Node.js App**
(Phusion Passenger).

The database, auth, and file storage remain on Lovable Cloud; only the
frontend + SSR moves to cPanel. Nothing about Lovable Cloud needs to change.

---

## 1. Requirements

- cPanel with **Setup Node.js App** available.
- Node **20.x** or newer.
- SSH access (recommended). File Manager works but is slower.
- Your project synced to a Git repo (use Lovable's GitHub button).

## 2. Create the Node.js application in cPanel

cPanel → **Setup Node.js App** → **Create Application**:

| Field | Value |
| --- | --- |
| Node.js version | 20.x (or newer) |
| Application mode | Production |
| Application root | `apps/trillion-liberty` (relative to your home dir) |
| Application URL | your domain or subdomain |
| Application startup file | `app.js` |

Do **not** set env vars yet — do that in step 4 after the first build.

## 3. Pull the code and build

SSH into your cPanel account, then:

```bash
# 1. Activate the Node.js virtualenv cPanel created for the app.
#    The exact path is shown in the Setup Node.js App page.
source /home/USER/nodevenv/apps/trillion-liberty/20/bin/activate
cd ~/apps/trillion-liberty

# 2. Clone the repo into the app root.
git clone https://github.com/YOUR-ORG/YOUR-REPO.git .

# 3. Install bun (Lovable uses bun; npm also works but bun is faster).
npm install -g bun

# 4. Install dependencies AND build for Node.
bun install
bun run build:node        # ← must be build:node, not build
```

`build:node` sets `NITRO_PRESET=node-server` so Nitro emits a plain Node
server bundle at `.output/server/index.mjs`. The default `bun run build`
produces a Cloudflare Worker bundle and will NOT run on cPanel.

## 4. Configure environment variables

In cPanel → Setup Node.js App → your app → **Environment variables**, add:

| Name | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `VITE_SUPABASE_URL` | (copy from Lovable project `.env`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | (copy from Lovable project `.env`) |
| `VITE_SUPABASE_PROJECT_ID` | (copy from Lovable project `.env`) |
| `SUPABASE_URL` | same as `VITE_SUPABASE_URL` |
| `SUPABASE_PUBLISHABLE_KEY` | same as `VITE_SUPABASE_PUBLISHABLE_KEY` |
| `SUPABASE_PROJECT_ID` | same as `VITE_SUPABASE_PROJECT_ID` |
| `SUPABASE_SERVICE_ROLE_KEY` | see note below |
| `LOVABLE_API_KEY` | (optional, only if you use Lovable AI features) |

**About `SUPABASE_SERVICE_ROLE_KEY`.** The admin image-upload feature needs
this key server-side. On Lovable Cloud it's injected automatically and not
shown in the UI. If you cannot retrieve it, image uploads will fail on
cPanel — but the site keeps working and admins can still paste image URLs
manually. Contact Lovable support to request the service role key if you
need image uploads to work off-Lovable.

After adding env vars, click **Restart** at the top of the app page.

## 5. Point your domain

In your DNS provider, add an **A record** for the domain / subdomain
pointing to your cPanel server IP. Once DNS propagates, cPanel serves the
app under that domain automatically.

If you use Cloudflare in front, set the record to DNS-only (grey cloud)
first to confirm SSL, then re-enable the proxy.

## 6. Redeploying after Lovable edits

Every time you make changes in Lovable:

```bash
ssh USER@your-cpanel-host
source /home/USER/nodevenv/apps/trillion-liberty/20/bin/activate
cd ~/apps/trillion-liberty
git pull
bun install
bun run build:node
# Then click Restart in the cPanel Node.js App UI, or:
touch tmp/restart.txt
```

## Troubleshooting

**Passenger: "Cannot find module .output/server/index.mjs"**
You ran `bun run build` instead of `bun run build:node`, or the build
failed. Re-run `bun run build:node` and check the output.

**502 / "Application failed to start"**
Open the Passenger log (Setup Node.js App → your app → "Show application
log"). Common causes: missing env var, wrong Node version, or the build
step wasn't run after `git pull`.

**Admin panel loads but image upload fails with 500**
`SUPABASE_SERVICE_ROLE_KEY` is missing or invalid. See step 4.

**Database or auth requests hang**
Check that `SUPABASE_URL` (unprefixed) is set and identical to
`VITE_SUPABASE_URL`. The unprefixed variables are only read server-side.

**Anything else**
Because SSR on cPanel Passenger is uncommon, some fixes may require
rebuilding after upstream Lovable template changes. If a future change
breaks the Node build, run `bun run build:node` locally first to reproduce
the error before deploying.