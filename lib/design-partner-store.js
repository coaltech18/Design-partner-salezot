import { promises as fs } from "fs";
import path from "path";

/* ------------------------------------------------------------------
   Salezot — Design Partner storage layer
   Isolated so swapping JSON for Postgres / Supabase / Airtable is a
   single-file change. Callers only see ensureStore / readAll / append.
------------------------------------------------------------------ */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "design-partner-submissions.json");

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
}
