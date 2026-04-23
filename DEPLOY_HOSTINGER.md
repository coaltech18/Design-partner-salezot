# Deploying to Hostinger — `dp.salezot.com`

This guide follows Hostinger's **official Node.js Web Apps** flow (2026), not the legacy "Advanced → Node.js / Passenger" path. Sources:

- [Hostinger official Next.js starter (`hostinger/deploy-nextjs`)](https://github.com/hostinger/deploy-nextjs)
- [Hostinger support — How to add a Node.js Web App](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)
- [Hostinger support — How to migrate a Node.js application](https://www.hostinger.com/support/how-to-migrate-a-node-js-application-to-hostinger/)

Plan requirement: **Business** or any **Cloud** plan (Startup / Professional / Enterprise / Enterprise Plus). The Node.js Apps website type does not exist on entry-level Premium/Single plans.

---

## Important Hostinger rule

> "Node.js websites must be deployed as a new website. If the domain/subdomain is already added to your hosting plan, remove it first before adding the Node.js website."

Translation: if `dp.salezot.com` already exists as a regular subdomain, **you must delete it** before creating the Node.js app — otherwise the "Add Website" flow will refuse to claim it.

---

## Phase 1 — Clean up the old setup

### 1.1 Delete the old subdomain
1. hPanel → **Domains → Subdomains**.
2. Delete `dp.salezot.com` with the red trash icon.

### 1.2 Delete leftover files
1. hPanel → **File Manager**.
2. Open `public_html/` and delete the `dp/` folder.
3. If there's a leftover `.htaccess` that was auto-created for `dp`, leave the root `public_html/.htaccess` alone — it belongs to `salezot.com`.

### 1.3 (Optional) Delete any old Node.js app
If you created a Node.js application under **Advanced → Node.js** earlier, delete it there too. A stale app will hold onto the port/process.

---

## Phase 2 — Ship the code

Pick **one** of these two paths. Git is the recommended path.

### Path A — Git (recommended)

Why: redeploys become a `git push`, Hostinger handles install + build + restart automatically, and your code has a proper source of truth.

1. Push this project to a GitHub repo (public or private).
   ```bash
   # If you haven't set up the remote yet
   gh repo create salezot-dp --private --source=. --push
   # or manually
   git remote add origin git@github.com:<you>/salezot-dp.git
   git push -u origin cursor/design-partners-landing-and-hostinger-deploy
   ```

2. In hPanel: **Websites → Add Website**.
3. Select **Node.js Apps**.
4. Select **Import Git Repository**.
5. Click **Authorize GitHub** → approve → pick the repo + branch.
6. When asked for the domain, enter `dp.salezot.com`. Hostinger will create the subdomain automatically and wire it to this Node.js app.
7. Review/override the auto-detected build settings (Next section).
8. Click **Deploy**.

### Path B — ZIP upload

Use this if you don't want to put the code on GitHub yet.

1. In hPanel: **Websites → Add Website**.
2. Select **Node.js Apps**.
3. Select **Upload your website files**.
4. Upload `salezot.zip` (already in the project root). Do **not** include `node_modules/` or `.next/`.
5. Domain: `dp.salezot.com`.
6. Review build settings (next section).
7. Click **Deploy**.

---

## Phase 3 — Build settings (identical for both paths)

Hostinger auto-detects Next.js. If it picks "Other", set these manually:

| Field | Value |
|---|---|
| Framework | `Next.js` (auto-detected) or `Other` |
| Node.js version | `20` (LTS; 18 or 22 also fine) |
| Application mode | `Production` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Start command | `npm start` |
| Entry file | `server.js` |
| Output directory | `.next` |

> We use a custom `server.js` so we own port/host binding. Hostinger injects `PORT` into the process; `server.js` reads it. If you'd rather use vanilla `next start`, change Start command to `npm run start -- -p $PORT` and leave Entry file blank — both work.

### Environment variables

Set these in the Node.js app's **Environment variables** tab (never commit them):

| Name | Value |
|---|---|
| `NODE_ENV` | `production` (usually auto-set by the Production mode toggle) |
| `NEXT_PUBLIC_APP_URL` | `https://dp.salezot.com` |
| `ADMIN_EXPORT_KEY` | a long random string, e.g. `openssl rand -hex 32` |

`ADMIN_EXPORT_KEY` guards the CSV export endpoint. Without it, `GET /api/design-partner/export` returns `503`. Keep this key private — anyone with it can download every submission.

Add more later as the app grows (database URLs, other API keys, etc.).

### Downloading submissions as CSV

Once deployed, bookmark this URL (replace the key with the one you set):

```
https://dp.salezot.com/api/design-partner/export?key=YOUR_ADMIN_EXPORT_KEY
```

Clicking it downloads `salezot-design-partners-<timestamp>.csv` with every submission. Opens cleanly in Excel, Numbers, Google Sheets.

---

## Phase 4 — Where Hostinger puts your files

Hostinger's modern Node.js Apps flow splits frontend build from the app process. You'll see this in File Manager after deploy:

```
/home/u376055756/domains/salezot.com/
├── nodejs/                <-- Node.js app lives here (source + node_modules + .next)
│   └── dp/                <-- your app root
└── public_html/
    └── .htaccess          <-- auto-created, forwards dp.salezot.com traffic to Node.js
```

Do not edit the auto-generated `.htaccess`. Do not manually upload into `public_html/dp/` — the modern flow doesn't use it.

---

## Phase 5 — Verify

1. Wait for the build log to say `Deployed successfully` (usually 2–5 minutes).
2. Visit `https://dp.salezot.com`.
3. Hit `/design-partners` and submit a test application.
4. Back in File Manager, open `nodejs/dp/data/design-partner-submissions.json` — your entry should be there.
5. hPanel → **Security → SSL** → issue + force HTTPS if it wasn't automatic.

### Persistent storage reminder

Hostinger Node.js hosting has a persistent writable filesystem, so `data/design-partner-submissions.json` works today. When traffic grows, migrate to a database (Supabase/Postgres/Airtable) — the storage layer in `pages/api/design-partner.js` is deliberately isolated to three functions and is a ~10-line swap. See `README.md` for the migration recipe.

---

## Phase 6 — Updating the site later

**With Git path:** push to the tracked branch → Hostinger auto-deploys.

**With ZIP path:** hPanel → your Node.js app → **Deploy → Upload New Version** → upload the new `salezot.zip`.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Add Website" doesn't show **Node.js Apps** | Plan too low | Upgrade to Business / Cloud |
| Add Website refuses `dp.salezot.com` | Subdomain still exists | Delete it under Domains → Subdomains |
| Build fails: `next: command not found` | Install command not run | Re-check Install command is `npm ci` |
| 502 / 503 on the live URL | App crashed on boot | Check **Runtime logs** tab — usually a missing env var or wrong entry file |
| Home page works but `/design-partners` 404s | Wrong output dir | Set Output directory to `.next` |
| Form returns 500 | `data/` not writable | File Manager → `nodejs/dp/data/` → right-click → Permissions → `755` |
| SSL missing / insecure badge | Cert not issued for subdomain | Security → SSL → issue for `dp.salezot.com`, then Force HTTPS |

---

## Quick reference — why this flow and not the old one

| Legacy "Advanced → Node.js" | Modern "Node.js Apps" (this guide) |
|---|---|
| Manually configure Passenger via `.htaccess` | Hostinger writes and owns `.htaccess` |
| Files live in `public_html/<subdomain>/` | App lives in `domains/<domain>/nodejs/`, static shell in `public_html/` |
| No Git integration | Native GitHub import with auto-deploy on push |
| No build log UI | Full build + runtime log UI |
| Framework auto-detection: none | Native detection for Next.js, Nuxt, Astro, etc. |

The modern flow is the only one Hostinger support will debug with you today, so using it is the right call.
