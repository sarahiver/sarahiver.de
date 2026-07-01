'use client';

import { useEffect, useState } from 'react';

/**
 * /testen — Einstieg in die Sandbox. Legt (oder findet) eine Wegwerf-Site an
 * und leitet ins echte Dashboard weiter. Kein Login noetig.
 */
export default function TestenPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const style = new URLSearchParams(window.location.search).get('style');
    const qs = style ? `?style=${encodeURIComponent(style)}` : '';
    fetch(`/api/demo/start${qs}`, { method: 'POST' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && d.slug) window.location.href = `/dashboard/${d.slug}`;
        else setError(d?.error || 'Konnte kein Test-Dashboard anlegen.');
      })
      .catch(() => setError('Netzwerkfehler — bitte erneut versuchen.'));
  }, []);

  return (
    <main style={wrap}>
      <div style={box}>
        {!error ? (
          <>
            <div style={spinner} aria-hidden="true" />
            <h1 style={h1}>Wir richten dein Test-Dashboard ein …</h1>
            <p style={p}>Ein fertig gefülltes Beispielprojekt — gleich kannst du alles ausprobieren.</p>
          </>
        ) : (
          <>
            <h1 style={h1}>Das hat nicht geklappt</h1>
            <p style={p}>{error}</p>
            <a href="/testen" style={btn}>Nochmal versuchen</a>
            <a href="/" style={{ ...p, color: '#9a938a', marginTop: 8, textDecoration: 'underline' }}>Zurück zur Startseite</a>
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}

const wrap: React.CSSProperties = { minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#0A0908', color: '#F3EFE9', fontFamily: 'Inter, system-ui, sans-serif', padding: 24 };
const box: React.CSSProperties = { textAlign: 'center', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 };
const spinner: React.CSSProperties = { width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(212,175,55,.25)', borderTopColor: '#D4AF37', animation: 'spin .8s linear infinite', marginBottom: 8 };
const h1: React.CSSProperties = { fontFamily: 'Fraunces, Georgia, serif', fontSize: 24, fontWeight: 500, margin: 0 };
const p: React.CSSProperties = { fontSize: 15, lineHeight: 1.6, color: '#c9c2b8', margin: 0 };
const btn: React.CSSProperties = { marginTop: 12, background: '#D4AF37', color: '#0A0908', fontWeight: 600, fontSize: 15, padding: '12px 22px', borderRadius: 10, textDecoration: 'none' };
