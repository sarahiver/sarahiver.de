import Link from 'next/link';
import { NAV } from '@/lib/content';

export default function SiteHeader() {
  return (
    <nav className="nav">
      <Link href="/" className="nav__logo">
        SARAHIVER<span>.</span>DE
      </Link>
      <div className="nav__links">
        {NAV.links.map((l) => (
          <a key={l.href} href={l.href}>{l.label}</a>
        ))}
        <a href={NAV.cta.href} className="nav__cta">{NAV.cta.label}</a>
      </div>
    </nav>
  );
}
