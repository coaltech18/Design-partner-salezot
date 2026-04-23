import { promises as fs } from "fs";
import path from "path";

/* ------------------------------------------------------------------
   Salezot — Design Partner storage layer
   Isolated so swapping JSON for Postgres / Supabase / Airtable is a
   single-file change. Callers only see ensureStore / readAll / append.

   On every append we write two files in data/:
     - design-partner-submissions.json  (source of truth, machine-readable)
     - design-partner-submissions.csv   (spreadsheet-ready snapshot)
   The CSV makes it trivial to download submissions directly from the
   Hostinger File Manager — no endpoints, no secrets.
------------------------------------------------------------------ */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "design-partner-submissions.json");
const CSV_FILE = path.join(DATA_DIR, "design-partner-submissions.csv");

const CSV_COLUMNS = [
  "id",
  "submittedAt",
  "fullName",
  "workEmail",
  "companyName",
  "companyWebsite",
  "role",
  "phone",
  "teamSize",
  "callVolume",
  "crm",
  "crmOther",
  "currentTool",
  "painPoint",
  "whyDesignPartner",
  "notes",
  "metadata.userAgent",
  "metadata.referer",
  "metadata.ip",
];

export async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

export async function readAll() {
  await ensureStore();
  let raw = "";
  try {
    raw = await fs.readFile(DATA_FILE, "utf8");
  } catch {
    return [];
  }
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Malformed JSON — do not destroy it. Rename and start fresh.
    const backup = `${DATA_FILE}.corrupt-${Date.now()}`;
    try {
      await fs.rename(DATA_FILE, backup);
    } catch {
      /* noop */
    }
    await fs.writeFile(DATA_FILE, "[]", "utf8");
    return [];
  }
}

export async function append(entry) {
  const all = await readAll();
  all.push(entry);

  const tmp = `${DATA_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(all, null, 2), "utf8");
  await fs.rename(tmp, DATA_FILE);

  await writeCsvSnapshot(all);
}

/* ---------- CSV snapshot ---------- */

function pick(obj, dottedKey) {
  return dottedKey.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

function csvEscape(value) {
  if (value == null) return "";
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function writeCsvSnapshot(rows) {
  const header = CSV_COLUMNS.join(",");
  const body = rows.map((row) => CSV_COLUMNS.map((col) => csvEscape(pick(row, col))).join(","));
  // UTF-8 BOM so Excel on Windows opens with correct encoding.
  const csv = "\uFEFF" + [header, ...body].join("\r\n") + "\r\n";

  const tmp = `${CSV_FILE}.tmp`;
  await fs.writeFile(tmp, csv, "utf8");
  await fs.rename(tmp, CSV_FILE);
}
