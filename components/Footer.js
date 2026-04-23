export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span className="mono">© {new Date().getFullYear()} Salezot</span>
        <span className="mono">Built for revenue teams.</span>
      </div>
    </footer>
  );
}
