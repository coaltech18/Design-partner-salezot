import Link from "next/link";

export default function Nav() {
  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link href="/" className="nav__brand" aria-label="Salezot home">
          <span className="nav__mark" aria-hidden="true" />
          <span>Salezot</span>
        </Link>

        <nav className="nav__links" aria-label="Primary">
          <Link href="/#product" className="nav__link">
            Product
          </Link>
          <Link href="/#how" className="nav__link">
            How it works
          </Link>
          <Link href="/design-partners" className="nav__link">
            Design Partners
          </Link>
          <Link href="/design-partners" className="btn btn--primary btn--sm">
            Apply for early access
          </Link>
        </nav>
      </div>
    </header>
  );
}
