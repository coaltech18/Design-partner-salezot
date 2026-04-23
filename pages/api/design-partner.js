import crypto from "crypto";
import { append } from "../../lib/design-partner-store";

/* ------------------------------------------------------------------
   Salezot — Design Partner submissions API
   - POST only
   - Server-side validation mirrors the client
   - Storage lives in lib/design-partner-store.js so future providers
     (Postgres, Supabase, Airtable, Notion) are a one-file swap.
------------------------------------------------------------------ */

const REQUIRED_FIELDS = [
  "fullName",
  "workEmail",
  "companyName",
  "companyWebsite",
  "role",
  "teamSize",
  "callVolume",
  "crm",
  "currentTool",
  "painPoint",
  "whyDesignPartner",
];

const OPTIONAL_FIELDS = ["phone", "notes", "crmOther"];
const ALLOWED_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

const FIELD_LABELS = {
  fullName: "Full name",
  workEmail: "Work email",
  companyName: "Company name",
  companyWebsite: "Company website",
  role: "Role",
  teamSize: "Team size",
  callVolume: "Call volume",
  crm: "CRM",
  crmOther: "Which CRM",
  currentTool: "Current tool",
  painPoint: "Main pain point",
  whyDesignPartner: "Why design partner",
};

const LIMITS = {
  fullName: 120,
  workEmail: 200,
  companyName: 160,
  companyWebsite: 300,
  role: 120,
  teamSize: 40,
  callVolume: 60,
  crm: 60,
  crmOther: 120,
  currentTool: 80,
  painPoint: 2000,
  whyDesignPartner: 2000,
  phone: 40,
  notes: 2000,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i;

function sanitizeString(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim();
}

function validatePayload(raw) {
  const clean = {};
  for (const key of ALLOWED_FIELDS) {
    clean[key] = sanitizeString(raw?.[key]);
  }

  const errors = {};

  for (const key of REQUIRED_FIELDS) {
    if (!clean[key]) {
      errors[key] = `${FIELD_LABELS[key]} is required.`;
    }
  }

  for (const key of ALLOWED_FIELDS) {
    const max = LIMITS[key];
    if (max && clean[key].length > max) {
      errors[key] = `${FIELD_LABELS[key] || key} is too long.`;
    }
  }

  if (clean.workEmail && !EMAIL_RE.test(clean.workEmail)) {
    errors.workEmail = "Enter a valid work email.";
  }

  if (clean.companyWebsite && !URL_RE.test(clean.companyWebsite)) {
    errors.companyWebsite = "Enter a valid URL.";
  }

  if (clean.crm === "Other" && !clean.crmOther) {
    errors.crmOther = "Tell us which CRM you use.";
  }

  if (clean.painPoint && clean.painPoint.length < 20 && !errors.painPoint) {
    errors.painPoint = "Give us a little more detail (20+ characters).";
  }

  if (
    clean.whyDesignPartner &&
    clean.whyDesignPartner.length < 20 &&
    !errors.whyDesignPartner
  ) {
    errors.whyDesignPartner = "Give us a little more detail (20+ characters).";
  }

  return { clean, errors };
}

/* ---------- Handler ---------- */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed." });
  }

  const body = typeof req.body === "string"
    ? safeJson(req.body)
    : req.body || {};

  const { clean, errors } = validatePayload(body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Validation failed.",
      errors,
    });
  }

  const entry = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    ...clean,
    metadata: {
      userAgent: req.headers["user-agent"] || null,
      referer: req.headers["referer"] || null,
      ip:
        (req.headers["x-forwarded-for"] || "")
          .toString()
          .split(",")[0]
          .trim() ||
        req.socket?.remoteAddress ||
        null,
    },
  };

  try {
    await append(entry);
  } catch (err) {
    console.error("[design-partner] write failure:", err);
    return res.status(500).json({
      message: "Could not save application. Please try again.",
    });
  }

  return res.status(201).json({
    ok: true,
    id: entry.id,
    submittedAt: entry.submittedAt,
  });
}

function safeJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
