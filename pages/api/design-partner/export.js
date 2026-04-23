import { readAll } from "../../../lib/design-partner-store";

/* ------------------------------------------------------------------
   Salezot — Design Partner CSV export
   - GET only
   - Protected by a shared secret (ADMIN_EXPORT_KEY env var)
     Accepted via either:
       Authorization: Bearer <key>
       ?key=<key>  (query string, so you can bookmark the link)
   - Returns a CSV download with every submission + flattened metadata
------------------------------------------------------------------ */

const COLUMNS = [
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

function toCSV(rows) {
  const header = COLUMNS.join(",");
  const body = rows.map((row) => COLUMNS.map((col) => csvEscape(pick(row, col))).join(","));
  return [header, ...body].join("\r\n") + "\r\n";
}

function getProvidedKey(req) {
  const auth = req.headers["authorization"];
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7).trim();
  if (typeof req.query.key === "string") return req.query.key;
  return "";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed." });
  }

  const expected = process.env.ADMIN_EXPORT_KEY;
  if (!expected) {
    return res.status(503).json({
      message:
        "Export is not configured. Set ADMIN_EXPORT_KEY in the server environment.",
    });
  }

  const provided = getProvidedKey(req);
  if (!provided || provided !== expected) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    const rows = await readAll();
    const csv = toCSV(rows);

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `salezot-design-partners-${stamp}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.setHeader("Cache-Control", "no-store");
    // Prepend UTF-8 BOM so Excel on Windows opens it with the right encoding.
    return res.status(200).send("\uFEFF" + csv);
  } catch (err) {
    console.error("[design-partner/export] failure:", err);
    return res.status(500).json({ message: "Could not export submissions." });
  }
}
