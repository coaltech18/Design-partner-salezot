# Deploying to Hostinger (Node.js hosting)

This guide assumes:
- You're on a Hostinger plan that supports Node.js (Business / Cloud / Premium with Node.js enabled in hPanel).
- You already created a subdomain (e.g. `dp.yourdomain.com`) and Hostinger generated a folder for it (e.g. `/domains/yourdomain.com/public_html/dp/` or `/domains/dp.yourdomain.com/public_html/`).
- You have access to **hPanel**.

---

## Architecture on Hostinger

Hostinger runs Node.js apps through **Phusion Passenger**. You point Passenger at a single **startup file** (`server.js`), it runs it, and Passenger routes all traffic from your subdomain to that Node process. We've already added `server.js` at the project root — it boots Next.js using the `PORT` Hostinger injects.

Your form data (`data/design-partner-submissions.json`) will persist because Hostinger's Node.js hosting has a normal writable filesystem.

---

## Step 1 — Prepare the upload bundle locally

On your machine, in the project root:

```bash
# 1) make sure lockfile is present
npm install

# 2) make a clean zip (exclude node_modules and .next — we'll rebuild on server)
zip -r salezot.zip . \
  -x "node_modules/*" \
  -x ".next/*" \
  -x ".git/*" \
  -x "*.DS_Store"
```

You'll upload `salezot.zip` to Hostinger and extract it in the subdomain folder.

> Tip: if you prefer Git, you can also use Hostinger's **Git deployment** feature instead of zipping. Same folder, same steps, but pulls from your repo.

---

## Step 2 — Upload and extract in the subdomain folder

1. Open **hPanel → File Manager**.
2. Navigate into the subdomain folder Hostinger created (e.g. `domains/dp.yourdomain.com/public_html/` — exact path depends on how you set up the subdomain).
3. Click **Upload** → upload `salezot.zip`.
4. Right-click the zip → **Extract** → into the current folder.
5. Delete the zip after extraction.

Expected folder contents:

```
server.js
package.json
package-lock.json
next.config.js
pages/
components/
styles/
data/
public/          (if present)
```

---

## Step 3 — Create the Node.js application in hPanel

1. In hPanel, go to **Websites** → pick the site → **Advanced** → **Node.js**.
2. Click **Create Application**.
3. Fill in:
   - **Node.js version**: `18.x` or newer (anything ≥ 18.17 works with Next.js 14).
   - **Application mode**: `Production`.
   - **Application root**: path to the subdomain folder where you extracted the zip (e.g. `domains/dp.yourdomain.com/public_html`).
   - **Application URL**: the subdomain (e.g. `dp.yourdomain.com`).
   - **Application startup file**: `server.js`.
4. Click **Create**.

---

## Step 4 — Install dependencies and build

Still in the Node.js app screen:

1. Click **Run NPM Install** — wait until it finishes (can take 1–2 min).
2. Then click **Run NPM Command** and enter:
   ```
   run build
   ```
   This runs `next build` on the server. You'll see the usual Next build output in the log. Wait for it to finish.

> If the build fails with an out-of-memory error (rare on small sites, but can happen on low-RAM plans), run this command instead:
> ```
> run build -- --no-lint
> ```
> or upgrade the plan RAM.

---

## Step 5 — Start the app

1. Back on the Node.js app screen, click **Restart Application** (or **Start** if it's not running).
2. Hostinger will now run `node server.js` with `NODE_ENV=production` and inject the `PORT` env var. Passenger proxies your subdomain to it.

Visit `https://dp.yourdomain.com` — you should see the Salezot home page. Go to `https://dp.yourdomain.com/design-partners` to confirm the landing page and form render.

---

## Step 6 — Test the form end-to-end

1. Open the subdomain in a browser.
2. Fill in and submit the form.
3. Back in **File Manager**, open `data/design-partner-submissions.json` — your entry should be at the bottom of the array.

If submissions aren't appearing:

- Check **File Manager** permissions on the `data/` folder. It must be writable by the Node.js user (typically `755` on the folder, `644` on the file is fine).
- Check the Node.js app **logs** in hPanel for errors.

---

## Step 7 — Force HTTPS (optional but recommended)

1. hPanel → **Security** → **SSL** → make sure SSL is issued for the subdomain.
2. Enable **Force HTTPS**.

Done. Your subdomain now serves the Salezot Design Partners page with a working form.

---

## Updating the site later

Any time you change code:

1. Locally: commit / verify / run `npm run build` if you want to test.
2. Re-zip or `git push` (if using Hostinger Git deployment).
3. Upload + extract, overwriting.
4. In hPanel → Node.js → **Run NPM Command** → `run build` (only needed if you changed code, not content).
5. **Restart Application**.

---

## Common gotchas

- **Blank page / 503 / "Application error"** → usually the startup file path is wrong or the build wasn't run. Re-check Step 3 (`server.js`) and Step 4 (`run build`).
- **"next: command not found"** during build → `npm install` didn't finish. Re-run it.
- **Form submits but 500 errors** → filesystem not writable. Fix permissions on `data/`.
- **Subdomain shows Hostinger default page** → the Node.js app is pointing at the wrong folder, or it's stopped. Check the **Application root** field and make sure the app is **Running**.
- **Passenger picks wrong Node version** → set Node.js version explicitly in the app config to `18.x` or `20.x`.

---

## When you outgrow file storage

Once you start getting real submissions (or you want multiple people reviewing them in real time), move off the JSON file:

- The storage layer in `pages/api/design-partner.js` is isolated to three helpers (`ensureStore`, `readAll`, `append`) — swap them for Supabase / Postgres / Airtable with a ~10-line change. README.md has the full upgrade path and a Supabase example.
- Put connection strings in hPanel → **Node.js** → **Environment variables** (never commit them). They become `process.env.*` in the app.
