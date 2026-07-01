'use client';

/**
 * DemoBanner — erscheint nur in Sandbox-Dashboards (Slug `demo-…`). Weist auf
 * den Test-Modus hin und fuehrt zur Kontoerstellung. Der Slug wird an /signup
 * uebergeben, damit die gewaehlte Konfiguration spaeter uebernommen werden kann.
 */
export default function DemoBanner({ slug }: { slug: string }) {
  if (!slug.startsWith('demo-')) return null;
  return (
    <div style={bar} role="region" aria-label="Test-Modus">
      <span style={txt}>
        <b>Test-Modus</b> — probier alles aus. Änderungen sind nur zum Testen und werden automatisch gelöscht.
      </span>
      <a style={cta} href={`/signup?from=demo&slug=${encodeURIComponent(slug)}`}>
        Konto anlegen &amp; behalten →
      </a>
    </div>
  );
}

const bar: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '10px 18px',
  background: '#0A0908', color: '#F3EFE9', padding: '10px 18px', fontSize: 13.5,
  fontFamily: 'Inter, system-ui, sans-serif', borderBottom: '1px solid rgba(212,175,55,.35)',
};
const txt: React.CSSProperties = { color: '#d8d1c7' };
const cta: React.CSSProperties = {
  background: '#D4AF37', color: '#0A0908', fontWeight: 600, textDecoration: 'none',
  padding: '7px 14px', borderRadius: 8, whiteSpace: 'nowrap',
};
