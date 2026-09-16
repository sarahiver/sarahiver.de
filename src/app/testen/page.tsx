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
            <a href="/" style={{ ...p, color: '#8A7F73', marginTop: 8, textDecoration: 'underline' }}>Zurück zur Startseite</a>
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}

const wrap: React.CSSProperties = { minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#2D211C', color: '#F4EDE2', fontFamily: 'Inter, system-ui, sans-serif', padding: 24 };
const box: React.CSSProperties = { textAlign: 'center', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 };
const spinner: React.CSSProperties = { width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(244,237,226,.22)', borderTopColor: '#B5746A', animation: 'spin .8s linear infinite', marginBottom: 8 };
const h1: React.CSSProperties = { fontFamily: 'Fraunces, Georgia, serif', fontSize: 25, fontWeight: 300, margin: 0 };
const p: React.CSSProperties = { fontSize: 15, lineHeight: 1.6, color: '#C4B8A9', margin: 0 };
const btn: React.CSSProperties = { marginTop: 12, background: '#B5746A', color: '#FFFFFF', fontWeight: 500, fontSize: 15, padding: '13px 24px', borderRadius: 999, textDecoration: 'none' };
