import { tokensToCSSVariables, getBereichBackground, SPACING_MULTIPLIER } from '@/lib/tokens';
import { DnaProvider } from '@/lib/dna-context';
import { BereichRenderer } from '@/components/layout/BereichRenderer';
import type { StyleId } from '@/lib/style-migration';
import {
  PAGE_ORDER,
  bereichLabel,
  type BereichKey,
  type ComponentVariant,
} from '@/lib/wedding-config';
import {
  buildBereich,
  buildTokens,
  type ContentLoad,
  type StylePalette,
} from '@/lib/allelements-data';

/**
 * Die eigentliche Vorschaufläche von /allelements.
 *
 * Rendert über denselben Weg wie das Produkt: EffectiveTokens →
 * tokensToCSSVariables → wedding-site-wrapper mit data-style → DnaProvider →
 * BereichRenderer. Es gibt keinen Preview-Sonderpfad und keine Ersatz-
 * komponenten; was hier steht, steht auch auf einer echten Hochzeitsseite.
 *
 * Diese Komponente läuft innerhalb eines <iframe>. Nur so greifen die
 * Media Queries der Komponenten auf die Vorschaubreite statt auf die Breite
 * des Review-Fensters — ein auf 390px geschrumpfter Container würde Mobile
 * vortäuschen und die Desktop-Regeln zeigen.
 */

interface Props {
  view: 'components' | 'full';
  style: StyleId;
  palette: StylePalette;
  variants: Record<BereichKey, ComponentVariant>;
  load: ContentLoad;
}

export default function PreviewStage({ view, style, palette, variants, load }: Props) {
  const tokens = buildTokens(style, palette, load);
  const cssVars = tokensToCSSVariables(tokens);
  const dna = {
    align: tokens.dna_align,
    spacing: tokens.dna_spacing,
    decor: tokens.dna_decor,
    contrast: tokens.dna_contrast,
    spacingMultiplier: SPACING_MULTIPLIER[tokens.dna_spacing],
  };

  // ---------------------------------------------------------------- Full Page
  if (view === 'full') {
    return (
      <div style={cssVars} className="wedding-site-wrapper min-h-screen" data-style={style} data-phase="main">
        <DnaProvider dna={dna}>
          <main>
            {PAGE_ORDER.map((key, index) => {
              const bereich = buildBereich(key, variants[key], load, index);
              const bg = getBereichBackground(index, key, index === PAGE_ORDER.length - 1);
              return (
                <section
                  key={key}
                  id={`bereich-${key}`}
                  style={{ background: bg === 'bg' ? 'var(--bg)' : 'var(--bg-soft)' }}
                  data-bereich={key}
                  data-variant={variants[key]}
                >
                  <BereichRenderer bereich={bereich} tokens={tokens} weddingSlug="allelements" />
                </section>
              );
            })}
          </main>
        </DnaProvider>
      </div>
    );
  }

  // --------------------------------------------------------------- Components
  // Je Bereich die drei Varianten untereinander, jede in ihrem eigenen
  // Produktions-Wrapper. Der einzige QA-Zusatz ist die Beschriftungsleiste
  // ÜBER dem Wrapper — innerhalb der Komponente wird nichts überschrieben.
  return (
    <div className="ae-stage">
      {PAGE_ORDER.map((key) => (
        <section className="ae-block" id={`c-${key}`} key={key}>
          <h2 className="ae-block-title">
            {bereichLabel(key)}
            <span>{key}</span>
          </h2>

          {(['a', 'b', 'c'] as ComponentVariant[]).map((variant) => {
            const bereich = buildBereich(key, variant, load, 0);
            return (
              <article className="ae-variant" key={variant} id={`c-${key}-${variant}`}>
                <div className="ae-variant-bar">
                  <span className="ae-variant-letter">{variant.toUpperCase()}</span>
                  <span className="ae-variant-meta">
                    {style} · {key} · Variante {variant.toUpperCase()}
                  </span>
                </div>
                <div
                  style={cssVars}
                  className="wedding-site-wrapper"
                  data-style={style}
                  data-phase="main"
                >
                  <DnaProvider dna={dna}>
                    <section
                      style={{ background: 'var(--bg)' }}
                      data-bereich={key}
                      data-variant={variant}
                    >
                      <BereichRenderer
                        bereich={bereich}
                        tokens={tokens}
                        weddingSlug="allelements"
                      />
                    </section>
                  </DnaProvider>
                </div>
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}
