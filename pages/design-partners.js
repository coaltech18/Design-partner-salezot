import { useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";

const CALENDLY_URL = "https://calendly.com/adithya-salezot/30min";

const TEAM_SIZES = [
  "1–5",
  "6–20",
  "21–50",
  "51–200",
  "200+",
];

const CALL_VOLUMES = [
  "< 10 calls / week",
  "10–25 calls / week",
  "25–50 calls / week",
  "50–100 calls / week",
  "100+ calls / week",
];

const CRMS = [
  "HubSpot",
  "Salesforce",
  "Pipedrive",
  "Attio",
  "Close",
  "Zoho",
  "None",
  "Other",
];

const CURRENT_TOOLS = [
  "Gong",
  "Chorus",
  "Fathom",
  "Fireflies",
  "Otter",
  "Grain",
  "Zoom (native only)",
  "Nothing yet",
  "Other",
];

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i;

const FIELD_LABELS = {
  fullName: "Full name",
  workEmail: "Work email",
  companyName: "Company name",
  companyWebsite: "Company website",
  role: "Role",
  teamSize: "Team size",
  callVolume: "Call volume",
  crm: "CRM",
  currentTool: "Current tool",
  painPoint: "Main pain point",
  whyDesignPartner: "Why design partner",
};

const INITIAL = {
  fullName: "",
  workEmail: "",
  companyName: "",
  companyWebsite: "",
  role: "",
  teamSize: "",
  callVolume: "",
  crm: "",
  crmOther: "",
  currentTool: "",
  painPoint: "",
  whyDesignPartner: "",
  phone: "",
  notes: "",
};

function validate(values) {
  const errors = {};
  for (const key of REQUIRED_FIELDS) {
    if (!String(values[key] ?? "").trim()) {
      errors[key] = `${FIELD_LABELS[key]} is required.`;
    }
  }
  if (values.workEmail && !EMAIL_RE.test(values.workEmail.trim())) {
    errors.workEmail = "Enter a valid work email.";
  }
  if (values.companyWebsite && !URL_RE.test(values.companyWebsite.trim())) {
    errors.companyWebsite = "Enter a valid URL (e.g. acme.com).";
  }
  if (values.crm === "Other" && !String(values.crmOther ?? "").trim()) {
    errors.crmOther = "Tell us which CRM you use.";
  }
  if (values.painPoint && values.painPoint.trim().length < 20) {
    errors.painPoint = "Give us a little more detail (20+ characters).";
  }
  if (
    values.whyDesignPartner &&
    values.whyDesignPartner.trim().length < 20
  ) {
    errors.whyDesignPartner = "Give us a little more detail (20+ characters).";
  }
  return errors;
}

export default function DesignPartners() {
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setValues((v) => {
      const next = { ...v, [name]: value };
      if (name === "crm" && value !== "Other") next.crmOther = "";
      return next;
    });
    if (errors[name] || (name === "crm" && errors.crmOther)) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        if (name === "crm") delete next.crmOther;
        return next;
      });
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    const trimmed = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
    );
    const found = validate(trimmed);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0];
      const el = document.querySelector(`[name="${firstKey}"]`);
      if (el && typeof el.focus === "function") el.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/design-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trimmed),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 400 && data?.errors) {
          setErrors(data.errors);
          setSubmitError("Please fix the highlighted fields and try again.");
        } else {
          setSubmitError(
            data?.message || "Something went wrong. Please try again."
          );
        }
        return;
      }

      setSubmitted(true);
      setValues(INITIAL);
    } catch (err) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout
      title="Design Partners — Salezot"
      description="Early access, direct product influence, and priority onboarding. Built with revenue teams."
    >
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="container">
          <span className="chip chip--accent hero__chip">
            <span className="chip__dot" aria-hidden="true" />
            Limited cohort — 20 teams
          </span>
          <h1 className="hero__title">
            Become a Salezot <em>Design Partner.</em>
          </h1>
          <p className="hero__sub">
            Early access. Direct product influence. Built with revenue teams.
          </p>

          <div className="hero__actions">
            <a href="#apply" className="btn btn--primary">
              Apply to the cohort
            </a>
            <a href="#why" className="btn btn--ghost">
              Why design partners
            </a>
          </div>

          <div className="hero__meta">
            <div className="hero__meta-item">
              <span className="hero__meta-value mono">20</span>
              <span className="hero__meta-label">Cohort size</span>
            </div>
            <div className="hero__meta-item">
              <span className="hero__meta-value mono">~8 wks</span>
              <span className="hero__meta-label">Build cycle</span>
            </div>
            <div className="hero__meta-item">
              <span className="hero__meta-value mono">0 $</span>
              <span className="hero__meta-label">Cost during program</span>
            </div>
            <div className="hero__meta-item">
              <span className="hero__meta-value mono">1:1</span>
              <span className="hero__meta-label">Founder feedback loop</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- WHY ---------- */}
      <section id="why" className="section anchor-offset">
        <div className="container">
          <p className="section__eyebrow">Why design partners</p>
          <h2 className="section__title">
            We&apos;re building Salezot with the teams that will use it.
          </h2>
          <p className="section__lede">
            Salezot is a revenue layer for B2B SaaS — it captures every sales
            call, structures what matters, and pushes the right signal back
            into CRM, coaching, and pipeline. Design partners shape the
            product roadmap directly with the founding team.
          </p>

          <div className="grid grid-3" style={{ marginTop: 32 }}>
            <div className="card">
              <div className="card__icon mono">01</div>
              <h3 className="card__title">We build against real workflows</h3>
              <p className="card__body">
                No imagined personas. Features ship against the exact call
                motions your reps run today.
              </p>
            </div>
            <div className="card">
              <div className="card__icon mono">02</div>
              <h3 className="card__title">You set what matters</h3>
              <p className="card__body">
                Partners rank the roadmap. If it&apos;s not moving your
                pipeline, it doesn&apos;t ship next.
              </p>
            </div>
            <div className="card">
              <div className="card__icon mono">03</div>
              <h3 className="card__title">Short loops, real output</h3>
              <p className="card__body">
                Weekly 30-min syncs, a private channel with the founders, and
                builds pushed in days — not quarters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- WHO THIS IS FOR ---------- */}
      <section className="section section--bg">
        <div className="container">
          <p className="section__eyebrow">Who this is for</p>
          <h2 className="section__title">Built for teams that sell.</h2>
          <p className="section__lede">
            The program is optimized for four kinds of teams.
          </p>

          <div className="grid grid-4" style={{ marginTop: 32 }}>
            <div className="card">
              <h3 className="card__title">B2B SaaS teams</h3>
              <p className="card__body">
                Subscription revenue, repeatable motion, measurable deal
                velocity.
              </p>
            </div>
            <div className="card">
              <h3 className="card__title">Sales-led orgs</h3>
              <p className="card__body">
                Founder-led or AE-led motion where calls drive pipeline.
              </p>
            </div>
            <div className="card">
              <h3 className="card__title">High-demo teams</h3>
              <p className="card__body">
                Running frequent demos and discovery — coaching surface area
                is huge.
              </p>
            </div>
            <div className="card">
              <h3 className="card__title">Revenue-focused teams</h3>
              <p className="card__body">
                RevOps, CROs, and heads of sales who treat calls as signal,
                not artifacts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- BENEFITS ---------- */}
      <section className="section">
        <div className="container">
          <p className="section__eyebrow">What you get</p>
          <h2 className="section__title">Design partner benefits.</h2>

          <div className="grid grid-4" style={{ marginTop: 32 }}>
            <div className="card">
              <div className="card__icon mono">A</div>
              <h3 className="card__title">Early access</h3>
              <p className="card__body">
                First builds, first features — pre-public launch.
              </p>
            </div>
            <div className="card">
              <div className="card__icon mono">B</div>
              <h3 className="card__title">Founder feedback loop</h3>
              <p className="card__body">
                Direct line to the people building it. No support tier.
              </p>
            </div>
            <div className="card">
              <div className="card__icon mono">C</div>
              <h3 className="card__title">Priority onboarding</h3>
              <p className="card__body">
                Concierge setup, CRM wiring, and team rollout handled with
                you.
              </p>
            </div>
            <div className="card">
              <div className="card__icon mono">D</div>
              <h3 className="card__title">Roadmap influence</h3>
              <p className="card__body">
                Partners vote on what ships next. Your wedge becomes our
                wedge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- QUALIFICATION / FIT ---------- */}
      <section className="section section--bg">
        <div className="container">
          <p className="section__eyebrow">Fit check</p>
          <h2 className="section__title">Is this the right program for you?</h2>
          <p className="section__lede">
            We&apos;re being deliberate about who we work with in cohort one.
          </p>

          <div className="fit" style={{ marginTop: 32 }}>
            <div className="fit__col fit__col--accent">
              <p className="fit__heading">
                <span className="chip__dot" aria-hidden="true" /> Ideal for
              </p>
              <ul className="fit__list">
                <li className="fit__item">B2B SaaS with a repeatable sales motion</li>
                <li className="fit__item">5+ sales calls per week across the team</li>
                <li className="fit__item">Active, staffed sales function (not side-of-desk)</li>
                <li className="fit__item">Using or ready to use a modern CRM</li>
                <li className="fit__item">Willing to give real, specific feedback weekly</li>
              </ul>
            </div>

            <div className="fit__col">
              <p className="fit__heading">Not a fit yet</p>
              <ul className="fit__list">
                <li className="fit__item">Solo founders without a sales motion</li>
                <li className="fit__item">Pre-call / pre-pipeline teams</li>
                <li className="fit__item">No call data to work from</li>
                <li className="fit__item">Consumer / transactional products</li>
                <li className="fit__item">Looking for a finished, polished tool today</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FORM ---------- */}
      <section id="apply" className="section anchor-offset">
        <div className="container" style={{ maxWidth: 820 }}>
          <p className="section__eyebrow">Apply</p>
          <h2 className="section__title">Apply to the design partner cohort.</h2>
          <p className="section__lede">
            We read every application personally. If there&apos;s a fit,
            you&apos;ll hear back within 3 business days.
          </p>

          <div className="form-wrap" style={{ marginTop: 32 }}>
            {submitted ? (
              <div className="success">
                <span className="success__tag">
                  <span className="chip__dot" aria-hidden="true" />
                  Application received
                </span>
                <h3 className="success__title">Thanks — we got it.</h3>
                <p className="success__body">
                  We&apos;ll review your application and respond within 3
                  business days. If you want to move faster, grab a slot on
                  the founder&apos;s calendar below.
                </p>
                <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary"
                  >
                    Book a 30-min call
                  </a>
                  <Link href="/" className="btn btn--ghost">
                    Back to home
                  </Link>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setSubmitted(false)}
                  >
                    Submit another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <div className="form-wrap__header">
                  <h3 className="h3" style={{ marginBottom: 4 }}>
                    Design Partner application
                  </h3>
                  <p className="small muted" style={{ marginBottom: 10 }}>
                    Required fields are marked with <span style={{ color: "var(--red)" }}>*</span>.
                  </p>
                  <p className="small" style={{ margin: 0, color: "var(--text-secondary)" }}>
                    Prefer to talk first?{" "}
                    <a
                      href={CALENDLY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-accent"
                    >
                      Book a 30-min intro call →
                    </a>
                  </p>
                </div>

                {submitError && <div className="alert alert--error">{submitError}</div>}

                <div className="form-grid">
                  <Field
                    name="fullName"
                    label="Full name"
                    required
                    value={values.fullName}
                    onChange={onChange}
                    error={errors.fullName}
                    placeholder="Jane Cooper"
                    autoComplete="name"
                  />
                  <Field
                    name="workEmail"
                    label="Work email"
                    type="email"
                    required
                    value={values.workEmail}
                    onChange={onChange}
                    error={errors.workEmail}
                    placeholder="jane@acme.com"
                    autoComplete="email"
                  />
                  <Field
                    name="companyName"
                    label="Company name"
                    required
                    value={values.companyName}
                    onChange={onChange}
                    error={errors.companyName}
                    placeholder="Acme, Inc."
                    autoComplete="organization"
                  />
                  <Field
                    name="companyWebsite"
                    label="Company website"
                    required
                    value={values.companyWebsite}
                    onChange={onChange}
                    error={errors.companyWebsite}
                    placeholder="acme.com"
                    autoComplete="url"
                  />
                  <Field
                    name="role"
                    label="Role"
                    required
                    value={values.role}
                    onChange={onChange}
                    error={errors.role}
                    placeholder="Head of Sales"
                    autoComplete="organization-title"
                  />
                  <Field
                    name="phone"
                    label="Phone (optional)"
                    value={values.phone}
                    onChange={onChange}
                    error={errors.phone}
                    placeholder="+1 555 555 5555"
                    autoComplete="tel"
                  />

                  <SelectField
                    name="teamSize"
                    label="Team size"
                    required
                    value={values.teamSize}
                    onChange={onChange}
                    error={errors.teamSize}
                    options={TEAM_SIZES}
                    placeholder="Select team size"
                  />
                  <SelectField
                    name="callVolume"
                    label="Call volume"
                    required
                    value={values.callVolume}
                    onChange={onChange}
                    error={errors.callVolume}
                    options={CALL_VOLUMES}
                    placeholder="Select call volume"
                  />
                  <SelectField
                    name="crm"
                    label="CRM"
                    required
                    value={values.crm}
                    onChange={onChange}
                    error={errors.crm}
                    options={CRMS}
                    placeholder="Select CRM"
                  />
                  {values.crm === "Other" ? (
                    <Field
                      name="crmOther"
                      label="Which CRM?"
                      required
                      value={values.crmOther}
                      onChange={onChange}
                      error={errors.crmOther}
                      placeholder="e.g. Copper, Freshsales, custom build"
                      autoComplete="off"
                    />
                  ) : null}
                  <SelectField
                    name="currentTool"
                    label="Current call / note tool"
                    required
                    value={values.currentTool}
                    onChange={onChange}
                    error={errors.currentTool}
                    options={CURRENT_TOOLS}
                    placeholder="Select current tool"
                  />

                  <TextareaField
                    name="painPoint"
                    label="Main pain point"
                    required
                    value={values.painPoint}
                    onChange={onChange}
                    error={errors.painPoint}
                    placeholder="What's the one thing broken in your sales motion today?"
                    full
                  />
                  <TextareaField
                    name="whyDesignPartner"
                    label="Why do you want to be a design partner?"
                    required
                    value={values.whyDesignPartner}
                    onChange={onChange}
                    error={errors.whyDesignPartner}
                    placeholder="What would a great outcome from this program look like for your team?"
                    full
                  />
                  <TextareaField
                    name="notes"
                    label="Anything else we should know? (optional)"
                    value={values.notes}
                    onChange={onChange}
                    error={errors.notes}
                    placeholder="Context, constraints, timing, etc."
                    full
                  />
                </div>

                <div className="form__footer">
                  <span className="form__note">
                    Rather skip the form?{" "}
                    <a
                      href={CALENDLY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-accent"
                    >
                      Book a 30-min intro call
                    </a>
                    .
                  </span>
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting…" : "Submit application"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Field({
  name,
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
  placeholder,
  autoComplete,
}) {
  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      <label htmlFor={name} className="field__label">
        {label}
        {required && <span className="req" aria-hidden="true">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="field__input"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <span id={`${name}-error`} className="field__error">
          {error}
        </span>
      )}
    </div>
  );
}

function SelectField({
  name,
  label,
  value,
  onChange,
  error,
  required,
  options,
  placeholder,
}) {
  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      <label htmlFor={name} className="field__label">
        {label}
        {required && <span className="req" aria-hidden="true">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="field__select"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        <option value="" disabled>
          {placeholder || "Select…"}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${name}-error`} className="field__error">
          {error}
        </span>
      )}
    </div>
  );
}

function TextareaField({
  name,
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  full,
}) {
  return (
    <div className={`field ${error ? "field--error" : ""} ${full ? "full" : ""}`}>
      <label htmlFor={name} className="field__label">
        {label}
        {required && <span className="req" aria-hidden="true">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="field__textarea"
        rows={4}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <span id={`${name}-error`} className="field__error">
          {error}
        </span>
      )}
    </div>
  );
}
