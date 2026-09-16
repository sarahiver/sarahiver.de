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
  background: '#2D211C', color: '#F4EDE2', padding: '10px 18px', fontSize: 13.5,
  fontFamily: 'Inter, system-ui, sans-serif', borderBottom: '1px solid rgba(181,116,106,.45)',
};
const txt: React.CSSProperties = { color: '#C4B8A9' };
const cta: React.CSSProperties = {
  background: '#B5746A', color: '#FFFFFF', fontWeight: 500, textDecoration: 'none',
  padding: '8px 16px', borderRadius: 999, whiteSpace: 'nowrap',
};
