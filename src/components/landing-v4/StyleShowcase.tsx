import { loadAllPresets } from '@/lib/presets';
import { VALID_STYLE_IDS } from '@/lib/style-migration';
import { DEMOS, STYLES_SECTION } from '@/lib/landing-v4';
import { IconArrowRight } from './icons';

/**
 * Stil-Übersicht ("Acht Designs").
 *
 * Liest Stile, Paletten und Schriften aus den Preset-Tabellen — dieselbe
 * Quelle wie der Stil-Picker im Dashboard. Dadurch zeigt die Landing immer
 * die echten Farben und Schriften und läuft nicht auseinander, wenn ein Preset
 * geändert wird.
 *
 * Die benötigten Schriftfamilien werden hier nachgeladen; ohne das würde die
 * Vorschau in einer Fallback-Schrift rendern und alle Stile sähen gleich aus.
 */
export default async function StyleShowcase() {
  const { styles, palettes, fonts } = await loadAllPresets();

  // Ohne DB-Antwort lieber gar keine Sektion als eine leere.
  if (!styles.length) return null;

  const paletteById = new Map(palettes.map((p) => [p.id, p]));
  const fontById = new Map(fonts.map((f) => [f.id, f]));

  const order = new Map<string, number>(VALID_STYLE_IDS.map((id, i) => [id, i]));
  const visible = styles
    .filter((s) => order.has(s.id))
    .sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));

  if (!visible.length) return null;


  return (
    <section className="sd-styles" id="stile">
      {/* Schriften sind selbst gehostet (src/app/fonts.css) — kein Google-Abruf. */}

      <div className="sd-wrap">
        <p className="sd-eyebrow sd-center">{STYLES_SECTION.eyebrow}</p>
        <h2 className="sd-h2 sd-center">{STYLES_SECTION.h2}</h2>
        <p className="sd-lede sd-center sd-styles-lede">{STYLES_SECTION.lede}</p>

        <ul className="sd-style-grid">
          {visible.map((s) => {
            const p = paletteById.get(s.default_palette_id);
            const f = fontById.get(s.default_font_id);

            return (
              <li className="sd-style" key={s.id}>
                <a className="sd-style-link" href={`/demo/${encodeURIComponent(s.id)}`}>
                  <div
                    className="sd-style-preview"
                    style={{
                      background: p?.color_bg ?? '#F7F4ED',
                      color: p?.color_ink ?? '#1A1714',
                    }}
                  >
                    <span
                      className="sd-style-sample"
                      style={{
                        fontFamily: cssFamily(f?.font_display),
                        fontWeight: f?.display_weight ?? 400,
                        fontStyle: f?.display_style === 'italic' ? 'italic' : 'normal',
                      }}
                    >
                      {STYLES_SECTION.sampleCouple}
                    </span>
                    <span
                      className="sd-style-rule"
                      style={{ background: p?.color_accent ?? '#C9A44A' }}
                    />
                    <span
                      className="sd-style-body"
                      style={{ fontFamily: cssFamily(f?.font_body) }}
                    >
                      Wir heiraten
                    </span>
                  </div>

                  <div className="sd-style-meta">
                    <h3>{s.name}</h3>
                    <p>{DEMOS.taglines[s.id] ?? s.meta}</p>
                  </div>

                  <div className="sd-style-foot">
                    <span className="sd-style-swatches" aria-hidden>
                      <i style={{ background: p?.color_bg_soft ?? '#EFEBE1' }} />
                      <i style={{ background: p?.color_accent ?? '#C9A44A' }} />
                      <i style={{ background: p?.color_ink ?? '#1A1714' }} />
                    </span>
                    <span className="sd-style-fonts">
                      {familyName(f?.font_display)} · {familyName(f?.font_body)}
                    </span>
                    <span className="sd-style-more">Beispielseite ansehen →</span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="sd-center sd-styles-cta">
          <a className="sd-btn sd-btn--ink" href={STYLES_SECTION.cta.href}>
            {STYLES_SECTION.cta.label}
            <IconArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

/** "'Fraunces', serif" → Fraunces */
function familyName(stack: string | null | undefined): string {
  if (!stack) return '—';
  const first = stack.split(',')[0] ?? '';
  return first.replace(/['"]/g, '').trim() || '—';
}

function cssFamily(stack: string | null | undefined): string | undefined {
  return stack || undefined;
}

