import Link from "next/link";
import Layout from "../components/Layout";

export default function Home() {
  return (
    <Layout title="Salezot — built for revenue teams">
      <section className="hero">
        <div className="container">
          <span className="chip chip--accent hero__chip">
            <span className="chip__dot" aria-hidden="true" />
            Now accepting design partners
          </span>
          <h1 className="hero__title">
            The revenue layer for B2B&nbsp;SaaS <em>sales teams.</em>
          </h1>
          <p className="hero__sub">
            Salezot turns every sales call into compounding pipeline signal —
            captured, structured, and routed back to the team that closes.
          </p>
          <div className="hero__actions">
            <Link href="/design-partners" className="btn btn--primary">
              Become a Design Partner
            </Link>
            <Link href="/#product" className="btn btn--ghost">
              See the product
            </Link>
          </div>
        </div>
      </section>

      <section id="product" className="section anchor-offset">
        <div className="container">
          <p className="section__eyebrow">Product</p>
          <h2 className="section__title">Revenue you can actually measure.</h2>
          <p className="section__lede">
            Salezot works alongside your existing CRM and call tooling — no rip
            and replace.
          </p>
        </div>
      </section>

      <section id="how" className="section section--bg anchor-offset">
        <div className="container">
          <p className="section__eyebrow">How it works</p>
          <h2 className="section__title">
            Launching with 20 design partners.
          </h2>
          <p className="section__lede">
            We&apos;re hand-picking the first 20 teams we build this with.
          </p>
          <div style={{ marginTop: 24 }}>
            <Link href="/design-partners" className="btn btn--primary">
              Apply for early access
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
