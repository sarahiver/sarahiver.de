import { FOOTER } from '@/lib/content';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__row">
        <div className="footer__brand">SARAHIVER<span>.</span>DE</div>
        <div className="footer__links">
          {FOOTER.links.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </div>
      </div>
      <div className="footer__small">{FOOTER.copyright}</div>
    </footer>
  );
}
