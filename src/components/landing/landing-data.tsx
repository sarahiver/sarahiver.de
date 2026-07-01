import React from 'react';

/* Verifizierte Pexels-Fotos — glückliche Paare, KEIN Hochzeitskontext (Hochzeiten stehen noch aus). */
const px = (id: number, w = 1000) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const IMG = {
  hero: px(31558934, 1200), // Nahaufnahme lächelndes Paar im Sonnenuntergang
  founder: px(8528876, 1000), // Kuss auf die Nase, Feld
  a1: px(34409906, 400),
  a2: px(8554867, 400),
  a3: px(5859639, 400),
  g1: px(31558934, 800),
  g2: px(34409906, 800),
  g3: px(32439850, 800),
  g4: px(5859639, 800),
  couple2: px(34409906, 900),
  couple3: px(8554867, 900),
};

export const DEMO = {
  n1: 'Sarah',
  n2: 'Iver',
  date: '11. Juli 2026',
  loc: 'Hamburg · Grüner Jäger',
  story: [
    ['2019', 'Kennengelernt', 'Auf einer Dachterrasse in St. Pauli.'],
    ['2023', 'Der Antrag', 'Ein verregneter Morgen in Kopenhagen.'],
    ['2026', 'Wir heiraten', 'Im Kreis unserer Liebsten.'],
  ] as const,
  timeline: [
    ['14:00', 'Trauung'],
    ['15:00', 'Sektempfang'],
    ['18:00', 'Dinner'],
    ['21:00', 'Party'],
  ] as const,
  hotels: ['Hotel Wedina · 8 Min.', '25hours HafenCity · 12 Min.', 'Boutique St. Pauli · 5 Min.'] as const,
  faq: [
    ['Dresscode?', 'Festlich, gern mit Farbe.'],
    ['Parken?', 'Parkhaus Rindermarkt, 3 Min.'],
    ['Kinder?', 'Herzlich willkommen.'],
  ] as const,
};

export interface Palette {
  n: string; bg: string; bgs: string; ink: string; ac: string; acd: string; mu: string;
}
export const PALETTES: Record<string, Palette> = {
  rose: { n: 'Rosé', bg: '#F7F2EC', bgs: '#efe7dd', ink: '#26201d', ac: '#7C2B38', acd: '#5a1f29', mu: '#8a7f78' },
  sage: { n: 'Salbei', bg: '#F1F3ED', bgs: '#e2e7da', ink: '#2b3327', ac: '#5B7355', acd: '#3f5340', mu: '#7d857a' },
  midnight: { n: 'Mitternacht', bg: '#14161C', bgs: '#1d212a', ink: '#EDEAF2', ac: '#C9A24B', acd: '#a5822f', mu: '#9a97a6' },
  sand: { n: 'Sand', bg: '#FAF4E9', bgs: '#efe3cf', ink: '#3a2f22', ac: '#C2764A', acd: '#9c5b34', mu: '#9c8f7c' },
  bordeaux: { n: 'Bordeaux', bg: '#F5EEEF', bgs: '#e7d7da', ink: '#2a1418', ac: '#8E2C43', acd: '#6a1f31', mu: '#93807f' },
};

export interface FontPreset { label: string; fd: string; fb: string; }
export const FONTS: Record<string, FontPreset> = {
  classic: { label: 'Klassisch', fd: "'Cormorant Garamond',serif", fb: "'Inter',sans-serif" },
  modern: { label: 'Modern', fd: "'Space Grotesk',sans-serif", fb: "'Inter',sans-serif" },
  romantic: { label: 'Romantisch', fd: "'Playfair Display',serif", fb: "'Inter',sans-serif" },
};

export type Variant = 'a' | 'b' | 'c';

/* Render-Reihenfolge (Katalog-Keys) */
export const PREVIEW_ORDER = [
  'hero', 'countdown', 'lovestory', 'timeline', 'directions', 'accomm', 'gallery',
  'photoupload', 'guestbook', 'music', 'witnesses', 'abc', 'gifts', 'faq', 'rsvp',
];

const im = (url: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  backgroundImage: `url(${url})`, ...extra,
});

/* Generische Bereiche (Titel/Text/Mini-UI) */
const GEN: Record<string, { eb: string; t: string; body: string; kind: string }> = {
  directions: { eb: 'Anfahrt', t: 'So findet ihr uns', body: 'Grüner Jäger — mitten in Hamburg, gut erreichbar.', kind: 'map' },
  accomm: { eb: 'Übernachtung', t: 'Wo ihr schlafen könnt', body: 'Drei Häuser in Laufnähe, für euch vorgemerkt.', kind: 'list' },
  photoupload: { eb: 'Eure Bilder', t: 'Teilt eure Momente', body: 'Ladet eure schönsten Schnappschüsse mit uns.', kind: 'drop' },
  guestbook: { eb: 'Gästebuch', t: 'Hinterlasst ein paar Worte', body: 'Eure Wünsche bleiben für immer erhalten.', kind: 'entries' },
  music: { eb: 'Musikwünsche', t: 'Welcher Song darf nicht fehlen?', body: 'Sagt dem DJ, was euch auf die Tanzfläche bringt.', kind: 'input' },
  witnesses: { eb: 'Trauzeugen', t: 'Unsere rechte & linke Hand', body: 'Die zwei Menschen, die immer für uns da sind.', kind: 'people' },
  abc: { eb: 'Hochzeits-ABC', t: 'Von A bis Z', body: 'Alle Infos, alphabetisch sortiert.', kind: 'abc' },
};

function GenMini({ kind }: { kind: string }) {
  if (kind === 'map') return <div className="lp-im" style={im(IMG.g3, { height: 150, opacity: 0.9 })} />;
  if (kind === 'list') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {DEMO.hotels.map((h) => <div key={h} className="lp-fld" style={{ textAlign: 'left' }}>{h}</div>)}
    </div>
  );
  if (kind === 'drop') return <div className="lp-fld" style={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' }}>Fotos hierher ziehen</div>;
  if (kind === 'entries') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {['„Der schönste Tag!" — Oma Grete', '„Auf die Liebe 🥂" — Ben'].map((q) => <div key={q} className="lp-fld" style={{ textAlign: 'left' }}>{q}</div>)}
    </div>
  );
  if (kind === 'input') return (
    <div style={{ display: 'flex', gap: 8, maxWidth: 360, margin: '0 auto' }}>
      <div className="lp-fld" style={{ flex: 1 }}>Euer Songwunsch</div><span className="lp-btn">Wünschen</span>
    </div>
  );
  if (kind === 'people') return (
    <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
      {[['Mara', IMG.a1], ['Jonas', IMG.a3]].map(([nn, u]) => (
        <div key={nn} style={{ textAlign: 'center' }}>
          <div className="lp-im" style={im(u, { width: 60, height: 60, borderRadius: '50%', margin: '0 auto 6px' })} />
          <div style={{ fontSize: 12, fontWeight: 600 }}>{nn}</div>
        </div>
      ))}
    </div>
  );
  if (kind === 'abc') return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
      {['Anfahrt', 'Dresscode', 'Kinder', 'Parken', 'Zugabe'].map((x) => <span key={x} className="lp-fld">{x}</span>)}
    </div>
  );
  return null;
}

function generic(key: string, v: Variant) {
  const g = GEN[key];
  if (!g) return null;
  if (v === 'b') return (
    <div className="lp-sec alt" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, alignItems: 'center' }}>
      <div><div className="lp-eb">{g.eb}</div><div className="lp-nm" style={{ fontSize: 28, margin: '10px 0 12px' }}>{g.t}</div><div className="lp-mu" style={{ fontSize: 13, lineHeight: 1.6 }}>{g.body}</div></div>
      <div><GenMini kind={g.kind} /></div>
    </div>
  );
  if (v === 'c') return (
    <div className="lp-sec"><div className="lp-eb" style={{ textAlign: 'center', display: 'block' }}>{g.eb}</div>
      <div className="lp-nm" style={{ fontSize: 28, textAlign: 'center', margin: '8px 0 18px' }}>{g.t}</div><GenMini kind={g.kind} /></div>
  );
  return (
    <div className="lp-sec" style={{ textAlign: 'center' }}><div className="lp-eb">{g.eb}</div>
      <div className="lp-nm" style={{ fontSize: 30, margin: '8px 0 12px' }}>{g.t}</div>
      <div className="lp-mu" style={{ fontSize: 13, maxWidth: 420, margin: '0 auto 18px', lineHeight: 1.6 }}>{g.body}</div><GenMini kind={g.kind} /></div>
  );
}

/* Haupt-Renderer: liefert JSX für (Bereich, Variante) */
export function previewSection(key: string, v: Variant): React.ReactNode {
  const D = DEMO;
  switch (key) {
    case 'hero':
      if (v === 'b') return (
        <div className="lp-sec" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, alignItems: 'center', minHeight: 420 }}>
          <div><div className="lp-eb">Wir heiraten</div><div className="lp-nm" style={{ fontSize: 50, margin: '14px 0' }}>{D.n1}<br />&amp; {D.n2}</div>
            <div className="lp-mu" style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 20 }}>{D.date}<br />{D.loc}</div>
            <span className="lp-btn">Jetzt zusagen</span></div>
          <div className="lp-im" style={im(IMG.couple2, { aspectRatio: '3/4' })} />
        </div>
      );
      if (v === 'c') return (
        <div className="lp-sec" style={{ textAlign: 'center', paddingTop: 56, paddingBottom: 56 }}>
          <div className="lp-eb">Wir heiraten</div><div className="lp-nm" style={{ fontSize: 60, margin: '16px 0' }}>{D.n1} &amp; {D.n2}</div>
          <div className="lp-rule" style={{ width: 70, margin: '0 auto 16px' }} />
          <div className="lp-mu" style={{ fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase' }}>{D.date} · {D.loc}</div>
        </div>
      );
      return (
        <div>
          <div className="lp-im" style={im(IMG.hero, { height: 300, borderRadius: 0 })} />
          <div className="lp-sec" style={{ textAlign: 'center', marginTop: -70, position: 'relative', paddingTop: 0 }}>
            <div className="lp-nm" style={{ fontSize: 60 }}>{D.n1} &amp; {D.n2}</div>
            <div className="lp-mu" style={{ fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', marginTop: 10 }}>{D.date} · {D.loc}</div>
            <div style={{ marginTop: 18 }}><span className="lp-btn">Jetzt zusagen</span></div>
          </div>
        </div>
      );
    case 'countdown': {
      const cells = [['187', 'Tage'], ['06', 'Std.'], ['24', 'Min.']];
      if (v === 'b') return (
        <div className="lp-sec alt" style={{ textAlign: 'center' }}>
          <div className="lp-nm" style={{ fontSize: 84, color: 'var(--ac)', lineHeight: 1 }}>187</div>
          <div className="lp-mu" style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', marginTop: 6 }}>Tage bis zum großen Tag</div>
        </div>
      );
      if (v === 'c') {
        const c4 = [['187', 'Tage'], ['06', 'Std.'], ['24', 'Min.'], ['11', 'Sek.']];
        return (
          <div className="lp-sec"><div className="lp-eb" style={{ textAlign: 'center', display: 'block', marginBottom: 16 }}>Countdown</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, maxWidth: 520, margin: '0 auto' }}>
              {c4.map((c) => <div key={c[1]} style={{ background: 'var(--bgs)', borderRadius: 12, padding: '16px 6px', textAlign: 'center' }}>
                <div className="lp-nm" style={{ fontSize: 28, color: 'var(--ac)' }}>{c[0]}</div>
                <div className="lp-mu" style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase' }}>{c[1]}</div></div>)}
            </div></div>
        );
      }
      return (
        <div className="lp-sec alt" style={{ textAlign: 'center' }}><div className="lp-eb">Es sind noch</div>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 16 }}>
            {cells.map((c) => <div key={c[1]}><div className="lp-nm" style={{ fontSize: 38, color: 'var(--ac)' }}>{c[0]}</div>
              <div className="lp-mu" style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' }}>{c[1]}</div></div>)}
          </div></div>
      );
    }
    case 'lovestory':
      if (v === 'b') return (
        <div className="lp-sec alt" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
          <div className="lp-im" style={im(IMG.couple3, { aspectRatio: '4/5' })} />
          <div><div className="lp-eb">Unsere Geschichte</div><div className="lp-nm" style={{ fontSize: 28, margin: '10px 0 14px' }}>Sieben Jahre, ein Ja.</div>
            <div className="lp-mu" style={{ fontSize: 13, lineHeight: 1.6 }}>{D.story[0][2]} {D.story[1][2]}</div></div>
        </div>
      );
      if (v === 'c') return (
        <div className="lp-sec" style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}><div className="lp-eb">Unsere Geschichte</div>
          <div className="lp-nm" style={{ fontSize: 26, fontStyle: 'italic', margin: '16px 0', lineHeight: 1.3 }}>„{D.story[1][2]}"</div>
          <div className="lp-rule" style={{ width: 50, margin: '18px auto' }} />
          <div className="lp-mu" style={{ fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase' }}>{D.n1} &amp; {D.n2}</div></div>
      );
      return (
        <div className="lp-sec"><div className="lp-eb" style={{ textAlign: 'center', display: 'block' }}>Unsere Geschichte</div>
          <div className="lp-nm" style={{ fontSize: 30, textAlign: 'center', margin: '8px 0 26px' }}>Wie alles begann</div>
          <div style={{ maxWidth: 440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {D.story.map((m) => <div key={m[0]} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 16 }}>
              <div className="lp-nm" style={{ fontSize: 22, color: 'var(--ac)' }}>{m[0]}</div>
              <div><div style={{ fontWeight: 600, fontSize: 14 }}>{m[1]}</div><div className="lp-mu" style={{ fontSize: 12.5, lineHeight: 1.5 }}>{m[2]}</div></div></div>)}
          </div></div>
      );
    case 'gallery': {
      const g = [IMG.g1, IMG.g2, IMG.g3, IMG.g4, IMG.couple3, IMG.hero];
      if (v === 'b') return (
        <div className="lp-sec alt"><div className="lp-nm" style={{ fontSize: 28, marginBottom: 18 }}>Galerie</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gridTemplateRows: '1fr 1fr', gap: 10, height: 300 }}>
            <div className="lp-im" style={im(IMG.g2, { gridRow: 'span 2' })} /><div className="lp-im" style={im(IMG.g1)} /><div className="lp-im" style={im(IMG.g4)} />
          </div></div>
      );
      if (v === 'c') return (
        <div className="lp-sec"><div className="lp-eb">Momente</div><div className="lp-nm" style={{ fontSize: 28, margin: '8px 0 16px' }}>Galerie</div>
          <div className="lp-im" style={im(IMG.hero, { height: 220, marginBottom: 10 })} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[IMG.g2, IMG.g3, IMG.g4, IMG.couple3].map((u, i) => <div key={i} className="lp-im" style={im(u, { aspectRatio: '1' })} />)}</div></div>
      );
      return (
        <div className="lp-sec"><div className="lp-eb" style={{ textAlign: 'center', display: 'block' }}>Momente</div>
          <div className="lp-nm" style={{ fontSize: 28, textAlign: 'center', margin: '8px 0 22px' }}>Galerie</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {g.map((u, i) => <div key={i} className="lp-im" style={im(u, { aspectRatio: '1' })} />)}</div></div>
      );
    }
    case 'timeline':
      if (v === 'b') return (
        <div className="lp-sec"><div className="lp-nm" style={{ fontSize: 28, textAlign: 'center', marginBottom: 22 }}>Ablauf des Tages</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 560, margin: '0 auto' }}>
            {D.timeline.map((e) => <div key={e[0]} style={{ border: '1px solid color-mix(in srgb,var(--ink) 14%,transparent)', borderRadius: 12, padding: 16 }}>
              <div className="lp-nm" style={{ fontSize: 22, color: 'var(--ac)' }}>{e[0]}</div><div style={{ fontSize: 13, marginTop: 2 }}>{e[1]}</div></div>)}
          </div></div>
      );
      if (v === 'c') return (
        <div className="lp-sec alt"><div className="lp-eb" style={{ textAlign: 'center', display: 'block' }}>Ablauf</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            {D.timeline.map((e) => <div key={e[0]} style={{ background: 'var(--bg)', borderRadius: 12, padding: '14px 18px', textAlign: 'center', minWidth: 92 }}>
              <div className="lp-nm" style={{ fontSize: 19, color: 'var(--ac)' }}>{e[0]}</div><div className="lp-mu" style={{ fontSize: 11, marginTop: 4 }}>{e[1]}</div></div>)}
          </div></div>
      );
      return (
        <div className="lp-sec alt"><div className="lp-eb" style={{ textAlign: 'center', display: 'block' }}>Ablauf</div>
          <div className="lp-nm" style={{ fontSize: 28, textAlign: 'center', margin: '8px 0 24px' }}>Der Tag</div>
          <div style={{ maxWidth: 380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {D.timeline.map((e) => <div key={e[0]} style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
              <div className="lp-nm" style={{ fontSize: 20, color: 'var(--ac)', width: 70 }}>{e[0]}</div><div style={{ fontSize: 14, fontWeight: 500 }}>{e[1]}</div></div>)}
          </div></div>
      );
    case 'gifts':
      if (v === 'b') return (
        <div className="lp-sec alt" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, alignItems: 'center' }}>
          <div><div className="lp-eb">Schenken</div><div className="lp-nm" style={{ fontSize: 26, margin: '10px 0 12px' }}>Reisekasse</div>
            <div className="lp-mu" style={{ fontSize: 13, lineHeight: 1.6 }}>Für alles Weitere gibt es unsere Reisekasse.</div></div>
          <div style={{ background: 'var(--bg)', borderRadius: 14, padding: 20, textAlign: 'center' }}>
            <div className="lp-mu" style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 8 }}>IBAN</div>
            <div style={{ fontFamily: 'var(--mono, monospace)', fontSize: 12 }}>DE06 1001 8000 0625 2723 20</div>
            <div style={{ marginTop: 12 }}><span className="lp-btn">Beitragen</span></div></div>
        </div>
      );
      if (v === 'c') return (
        <div className="lp-sec" style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
          <div className="lp-nm" style={{ fontSize: 24, fontStyle: 'italic', marginBottom: 12 }}>„Schenkt uns Erinnerungen."</div>
          <div className="lp-mu" style={{ fontSize: 13, lineHeight: 1.6 }}>Ein Beitrag zu unseren Flitterwochen.</div>
          <div style={{ marginTop: 14 }}><span className="lp-btn">Zur Reisekasse</span></div></div>
      );
      return (
        <div className="lp-sec" style={{ textAlign: 'center' }}><div className="lp-eb">Schenken</div><div className="lp-nm" style={{ fontSize: 26, margin: '8px 0 8px' }}>Reisekasse</div>
          <div className="lp-mu" style={{ fontSize: 13, maxWidth: 360, margin: '0 auto 16px', lineHeight: 1.6 }}>Das schönste Geschenk ist eure Anwesenheit.</div>
          <div style={{ display: 'inline-block', background: 'var(--bgs)', borderRadius: 12, padding: '14px 20px', fontFamily: 'monospace', fontSize: 12 }}>DE06 1001 8000 0625 2723 20</div></div>
      );
    case 'faq':
      if (v === 'b') return (
        <div className="lp-sec alt"><div className="lp-nm" style={{ fontSize: 28, textAlign: 'center', marginBottom: 20 }}>Fragen &amp; Antworten</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 600, margin: '0 auto' }}>
            {D.faq.map((f) => <div key={f[0]} style={{ background: 'var(--bg)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{f[0]}</div><div className="lp-mu" style={{ fontSize: 12, marginTop: 4 }}>{f[1]}</div></div>)}</div></div>
      );
      if (v === 'c') return (
        <div className="lp-sec" style={{ maxWidth: 520, margin: '0 auto' }}><div className="lp-eb" style={{ textAlign: 'center', display: 'block' }}>FAQ</div>
          {D.faq.map((f) => <div key={f[0]} style={{ borderBottom: '1px solid color-mix(in srgb,var(--ink) 12%,transparent)', padding: '12px 0' }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{f[0]}</div><div className="lp-mu" style={{ fontSize: 12.5, marginTop: 3 }}>{f[1]}</div></div>)}</div>
      );
      return (
        <div className="lp-sec"><div className="lp-eb" style={{ textAlign: 'center', display: 'block' }}>Gut zu wissen</div>
          <div className="lp-nm" style={{ fontSize: 28, textAlign: 'center', margin: '8px 0 22px' }}>FAQ</div>
          <div style={{ maxWidth: 460, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {D.faq.map((f) => <div key={f[0]}><div style={{ fontWeight: 600, fontSize: 14 }}>{f[0]}</div><div className="lp-mu" style={{ fontSize: 12.5 }}>{f[1]}</div></div>)}</div></div>
      );
    case 'rsvp':
      if (v === 'b') return (
        <div className="lp-sec alt" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
          <div><div className="lp-eb">Antwort erbeten</div><div className="lp-nm" style={{ fontSize: 30, margin: '10px 0 12px' }}>Feiert mit uns</div>
            <div className="lp-mu" style={{ fontSize: 13, lineHeight: 1.6 }}>Bitte bis 1. Mai Bescheid geben.</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div className="lp-fld">Euer Name</div><div className="lp-fld">Anzahl Personen</div><div className="lp-fld">Essenswunsch</div>
            <div style={{ marginTop: 2 }}><span className="lp-btn" style={{ textAlign: 'center' }}>Zusagen</span></div></div>
        </div>
      );
      if (v === 'c') return (
        <div className="lp-sec" style={{ textAlign: 'center' }}><div className="lp-eb">Antwort erbeten</div>
          <div className="lp-nm" style={{ fontSize: 28, margin: '8px 0 18px' }}>Sagt uns Bescheid</div>
          <div style={{ display: 'flex', gap: 9, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 520, margin: '0 auto' }}>
            <div className="lp-fld" style={{ flex: 1, minWidth: 130 }}>Euer Name</div><div className="lp-fld" style={{ width: 110 }}>Personen</div><span className="lp-btn">Zusagen</span></div></div>
      );
      return (
        <div className="lp-sec" style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bgs)', borderRadius: 16, padding: 30, maxWidth: 380, width: '100%', textAlign: 'center' }}>
            <div className="lp-eb">Antwort erbeten</div><div className="lp-nm" style={{ fontSize: 26, margin: '8px 0 18px' }}>Seid ihr dabei?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}><div className="lp-fld">Euer Name</div><div className="lp-fld">Anzahl Personen</div></div>
            <span className="lp-btn" style={{ width: '100%', textAlign: 'center' }}>Zusagen</span></div></div>
      );
    default:
      return generic(key, v);
  }
}
