import Link from "next/link";
import Layout from "../components/Layout";

export default function Apply() {
  return (
    <Layout
      title="Apply — Salezot"
      description="Applications are handled through the Salezot Design Partner program."
    >
      <section className="hero">
        <div className="container">
          <span className="chip">Apply</span>
          <h1 className="hero__title" style={{ marginTop: 16 }}>
            Applications run through the Design Partner program.
          </h1>
          <p className="hero__sub">
            We&apos;re only onboarding teams through our Design Partner cohort
            right now. The application lives here:
          </p>
          <div className="hero__actions">
            <Link href="/design-partners" className="btn btn--primary">
              Go to Design Partners
            </Link>
            <Link href="/" className="btn btn--ghost">
              Back home
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
