# Salezot Website

Next.js (pages router) codebase for the Salezot marketing site and the **Design Partners** program landing page + application backend.

## Stack

- Next.js 14 (pages router)
- React 18
- Plain CSS (no Tailwind, no runtime styling libs) — see `styles/globals.css`
- Node file system for MVP submission storage

## Getting started

```bash
npm install
npm run dev
```

App runs on http://localhost:3000.

## Routes

| Route                  | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `/`                    | Marketing home                                           |
| `/design-partners`     | Design Partners landing + application form               |
| `/apply`               | Legacy apply page — redirects users to `/design-partners`|
| `/api/design-partner`  | POST endpoint that validates + persists applications      |

## Design system (dark Red × Black)

All tokens live as CSS custom properties at the top of `styles/globals.css`:

- Brand: `--red: #EA3829`
- Surfaces: `--bg #000`, `--section #0a0a0a`, `--card #111`, `--hover #1a1a1a`
- Text: `--text #fff`, `--text-secondary #a0a0a0`, `--text-muted #555`
- Borders: `--border #1f1f1f`, `--border-hover #2e2e2e`, `--border-accent #EA382930`
- Type: `Sora` (sans), `DM Mono` (numbers/metrics)
- No gradients, no shadows, no glassmorphism.

Red is used only for primary CTAs, active states, highlights, and accent borders.

## Design Partners form

### Required fields

`fullName`, `workEmail`, `companyName`, `companyWebsite`, `role`, `teamSize`, `callVolume`, `crm`, `currentTool`, `painPoint`, `whyDesignPartner`

### Optional fields

`phone`, `notes`

### Validation

- Client (`pages/design-partners.js`) — required checks, email regex, URL regex, min-length on textareas, trim.
- Server (`pages/api/design-partner.js`) — mirrors client validation, enforces per-field length caps, rejects with `400` + structured `errors` map keyed by field name.

### Storage (MVP)

Submissions are appended to `data/design-partner-submissions.json`. Each entry:

```json
{
  "id": "uuid",
  "submittedAt": "ISO-8601",
  "fullName": "...",
  "workEmail": "...",
  "companyName": "...",
  "...": "...",
  "metadata": {
    "userAgent": "...",
    "referer": "...",
    "ip": "..."
  }
}
```

The storage layer in `pages/api/design-partner.js` is deliberately isolated to three tiny functions:

- `ensureStore()` — creates `data/` + the JSON file if missing
- `readAll()` — parses existing entries, safely handles empty/malformed JSON (corrupt files are renamed, never destroyed)
- `append(entry)` — writes via a temp file + atomic rename to avoid partial writes

## Upgrade storage to a database later

The handler only calls `append(entry)` — everything above it (parsing, validation, response shape) is storage-agnostic. To migrate:

1. **Pick a provider.** Supabase/Postgres, Neon, PlanetScale, Airtable, Notion, or a Google Sheet via service account all work.
2. **Swap the storage layer.** Replace the three `fs`-based helpers with your provider's SDK. Keep the function signatures (`append(entry)` especially) identical and the handler needs no changes.
3. **Move secrets to env.** Add connection strings / API keys to `.env.local` and read via `process.env.*`. Never commit `.env*`.
4. **Backfill.** Parse `data/design-partner-submissions.json` once and insert rows into the new store, then retire the file.
5. **Add a retry + idempotency key.** If moving to a real DB, use `id` (already a UUID) as a unique key to make retries safe.
6. **Consider adding a queue.** For high volume, write to a queue (e.g. Upstash QStash) from the API route and have a worker persist — keeps the form snappy.

Example Supabase swap (illustrative):

```js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function append(entry) {
  const { error } = await supabase.from("design_partner_submissions").insert(entry);
  if (error) throw error;
}
```

That's the only edit required — the handler stays the same.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint via `next lint`

## Notes

- `data/design-partner-submissions.json` is committed with `[]` as the seed, so the API can write on first run in dev. In production (Vercel, serverless), the filesystem is read-only — migrate to a DB before deploying.
