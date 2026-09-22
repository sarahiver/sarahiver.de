import type { CSSProperties } from 'react';
import type { Metadata } from 'next';

// Interne Review-Seite für die Kinetic-Foundation (Run 1): zeigt Palette,
// Typografie, Signalflächen, Formsystem, Kompositionsmittel und Motion,
// bevor die Anker übersetzt werden. Keine Daten, keine Logik.
export const metadata: Metadata = {
  title: 'Kinetic Foundation — Review',
  robots: { index: false, follow: false },
};

const tokens = {
  '--bg': '#F4F4F1',
  '--bg-soft': '#DCE5FF',
  '--accent': '#1F3BFF',
  '--accent-deep': '#1426B8',
  '--ink': '#0B0B0C',
  '--font-display': "'Archivo'",
  '--font-body': "'Archivo'",
} as CSSProperties;

const swatches: Array<[string, string, string]> = [
  ['Paper', '#F4F4F1', 'Grundfläche'],
  ['Ink', '#0B0B0C', 'Text, Schwarzfläche'],
  ['Electric Blue', '#1F3BFF', 'Signal, Aktion'],
  ['Blue Deep', '#1426B8', 'blaue Kleinschrift'],
  ['Ice', '#DCE5FF', 'ruhige Fläche'],
  ['Grey', 'color-mix(in srgb, #0B0B0C 58%, #F4F4F1)', 'Meta'],
];

export default function KineticFoundationReview() {
  return (
    <div className="wedding-site-wrapper" data-style="kinetic" data-phase="main" style={tokens}>
      <main className="kn-review">
        <section className="kn-review__block">
          <span className="kn-label">Run 1 · Foundation</span>
          <h1 className="kn-display kn-display--xxl kn-enter">
            Kinetic<span className="kn-hl">.</span>
          </h1>
          <p className="kn-body">
            Bewegung durch Komposition: Maßstab, Anschnitt, Winkel, Versatz, Überlagerung. Eine
            Signalfarbe, eine Schriftfamilie, harte Fotorahmen.
          </p>
        </section>

        <section className="kn-review__block">
          <p className="kn-meta">01 · Palette</p>
          <div className="kn-review__row">
            {swatches.map(([name, value, role]) => (
              <div className="kn-review__swatch" key={name}>
                <div className="kn-review__chip" style={{ background: value }} />
                <span className="kn-meta">{name}</span>
                <span className="kn-body" style={{ fontSize: 13 }}>{role}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="kn-review__block">
          <p className="kn-meta">02 · Typografie — Archivo, Display condensed, Text in normaler Breite</p>
          <p className="kn-display kn-display--xxl">Anna &amp; Lukas</p>
          <p className="kn-display kn-display--xl">Save the date</p>
          <p className="kn-display kn-display--l">Unsere Geschichte</p>
          <p className="kn-display kn-display--m">Ein Donnerstagabend, Hamburg</p>
          <div className="kn-review__row" style={{ gap: 40 }}>
            <div><span className="kn-number">10</span><p className="kn-meta">Tage</p></div>
            <div><span className="kn-number">08</span><p className="kn-meta">Stunden</p></div>
            <div><span className="kn-number">24</span><p className="kn-meta">Minuten</p></div>
          </div>
          <p className="kn-body">
            Fließtext bleibt ruhig und gut lesbar: Archivo in normaler Breite, 15–17px, 1.6
            Zeilenhöhe. Die Energie trägt die Display-Ebene, nicht der Lesetext.
          </p>
          <p className="kn-meta">Meta · Samstag, 17. Juli 2027 · Hamburg</p>
        </section>

        <section className="kn-review__block">
          <p className="kn-meta">03 · Signalflächen</p>
          <div className="kn-review__grid2">
            <div className="kn-review__tile kn-signal-blue">
              <span className="kn-meta">Blue Signal</span>
              <p className="kn-display kn-display--l">Seid ihr dabei?</p>
            </div>
            <div className="kn-review__tile kn-signal-black">
              <span className="kn-meta">Black Signal</span>
              <p className="kn-display kn-display--l">Good people <span className="kn-hl">better</span> together</p>
            </div>
          </div>
        </section>

        <section className="kn-review__block">
          <p className="kn-meta">04 · Formsystem — gerade, stabil, 48px, 16px</p>
          <div className="kn-review__grid2">
            <div style={{ display: 'grid', gap: 16 }}>
              <label className="kn-field">
                <span className="kn-field-label">Vor- und Nachname</span>
                <input className="kn-input" defaultValue="Johanna Albers" />
              </label>
              <label className="kn-field">
                <span className="kn-field-label">E-Mail</span>
                <input className="kn-input" aria-invalid="true" defaultValue="johanna@" />
              </label>
              <p className="kn-error">Diese E-Mail-Adresse sieht noch nicht vollständig aus.</p>
            </div>
            <div className="kn-review__row" style={{ alignItems: 'flex-start' }}>
              <button className="kn-button" type="button">Rückmeldung senden →</button>
              <button className="kn-button kn-button--secondary" type="button">Später</button>
              <button className="kn-button" type="button" disabled>Wird gesendet …</button>
            </div>
          </div>
        </section>

        <section className="kn-review__block">
          <p className="kn-meta">05 · Kompositionsmittel</p>
          <div className="kn-review__grid3">
            <div className="kn-review__tile">
              <span className="kn-meta">Frame + Tilt</span>
              <div className="kn-frame kn-tilt" style={{ inlineSize: '70%' }}>
                <div className="kn-review__photo" />
              </div>
            </div>
            <div className="kn-review__tile">
              <span className="kn-meta">Offset + Label</span>
              <div style={{ position: 'relative' }}>
                <div className="kn-frame" style={{ inlineSize: '70%' }}>
                  <div className="kn-review__photo" />
                </div>
                <span className="kn-label kn-tilt" style={{ position: 'absolute', top: 12, right: 0 }}>
                  17. Juli 2027
                </span>
              </div>
            </div>
            <div className="kn-review__tile">
              <span className="kn-meta">Crop + Overlap</span>
              <span className="kn-crop">
                <span className="kn-display kn-display--xl">Together</span>
              </span>
              <p className="kn-display kn-display--m kn-overlap kn-hl">Forever</p>
            </div>
          </div>
        </section>

        <section className="kn-review__block">
          <p className="kn-meta">06 · Motion — Enter, Drift, Track, Snap (Hover auf den Knöpfen)</p>
          <div className="kn-track kn-signal-black" style={{ padding: '14px 0' }}>
            <div className="kn-track__inner kn-display kn-display--m">
              <span>Same love · Different looks ·</span>
              <span>Same love · Different looks ·</span>
              <span>Same love · Different looks ·</span>
              <span>Same love · Different looks ·</span>
            </div>
          </div>
          <div className="kn-review__row">
            <span className="kn-label kn-drift">Drift · 14s</span>
            <span className="kn-meta kn-enter-x">Enter-X · einmalig</span>
          </div>
          <p className="kn-body">
            Bei „Bewegung reduzieren“ stehen Laufband, Drift und Enter still; alle Inhalte bleiben
            sichtbar.
          </p>
        </section>

        <section className="kn-review__block">
          <p className="kn-meta">07 · A/B/C-Vertrag</p>
          <div className="kn-review__grid3">
            <div className="kn-review__tile" data-variant="a">
              <span className="kn-label">A · Drive</span>
              <p className="kn-display kn-display--m">Klar. Schnell. Typografisch.</p>
              <p className="kn-body" style={{ fontSize: 14 }}>Große Schrift, Blau als Signal, kaum Overlap, kein Winkel.</p>
            </div>
            <div className="kn-review__tile" data-variant="b">
              <span className="kn-label">B · Shift</span>
              <p className="kn-display kn-display--m kn-tilt-soft">Versetzt. Geschichtet.</p>
              <p className="kn-body" style={{ fontSize: 14 }}>Offset, Layering, Anschnitt, leichte Winkel.</p>
            </div>
            <div className="kn-review__tile kn-signal-blue" data-variant="c">
              <span className="kn-meta">C · Impact</span>
              <p className="kn-display kn-display--l">Groß.</p>
              <p className="kn-body" style={{ fontSize: 14 }}>Extreme Skalierung, eine dominante Fläche pro Sektion.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
