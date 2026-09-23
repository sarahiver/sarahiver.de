import { demoByStyle } from '@/lib/demo-pages';

/**
 * Preview-Fläche der acht Stilkarten auf der Landingpage.
 *
 * Kein Mini-Screenshot der Demo, sondern je Stil eine kleine Komposition aus
 * zwei bis drei Merkmalen der echten Design-DNA (Kontrast, Geometrie, Winkel,
 * Glow, Anschnitt). Farben und Schriften kommen aus denselben Presets wie die
 * Demo-Seiten, die Namen von den echten Demo-Paaren.
 *
 * Struktur bewusst identisch über alle Karten: ein Container `.sd-pv` mit
 * Modifier `.sd-pv--<stil>`; die Gestaltung liegt in landing-v4.css. So bleibt
 * das Kartenraster vergleichbar und wartbar.
 */

export interface PreviewPalette {
  color_bg: string;
  color_bg_soft: string;
  color_accent: string;
  color_accent_deep: string;
  color_ink: string;
}

export interface PreviewFont {
  font_display: string | null;
  font_body: string | null;
  display_weight: number | null;
  display_style: string | null;
}

function coupleOf(styleId: string): { a: string; b: string; date: string } {
  const d = demoByStyle(styleId);
  if (!d) return { a: 'Sofia', b: 'Mateo', date: '2026' };
  const [y, m, day] = d.date.split('-');
  return { a: d.name1, b: d.name2, date: `${day}.${m}.${y}` };
}

export default function StylePreview({
  styleId,
  palette,
  font,
}: {
  styleId: string;
  palette?: PreviewPalette;
  font?: PreviewFont;
}) {
  const { a, b, date } = coupleOf(styleId);
  const display = font?.font_display || undefined;
  const body = font?.font_body || undefined;

  const vars = {
    '--pv-bg': palette?.color_bg ?? '#F7F4ED',
    '--pv-soft': palette?.color_bg_soft ?? '#EFEBE1',
    '--pv-accent': palette?.color_accent ?? '#C9A44A',
    '--pv-deep': palette?.color_accent_deep ?? '#8A6B2A',
    '--pv-ink': palette?.color_ink ?? '#1A1714',
    '--pv-display': display,
    '--pv-body': body,
    fontWeight: font?.display_weight ?? 400,
    fontStyle: font?.display_style === 'italic' ? 'italic' : 'normal',
  } as React.CSSProperties;

  const names = (
    <span className="sd-pv-names">
      {a} <span className="sd-pv-amp">&amp;</span> {b}
    </span>
  );

  return (
    <div className={`sd-pv sd-pv--${styleId}`} style={vars} aria-hidden>
      {/* Dekorative Ebenen je Stil — Formen und Flächen aus der Design-DNA. */}
      <span className="sd-pv-art" />
      <span className="sd-pv-art2" />

      <span className="sd-pv-body">
        {styleId === 'kinetic' || styleId === 'brutalist' ? 'Save the date' : 'Wir heiraten'}
      </span>
      {names}
      <span className="sd-pv-meta">{date}</span>
    </div>
  );
}
