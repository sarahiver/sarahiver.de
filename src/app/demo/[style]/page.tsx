import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { tokensToCSSVariables, getBereichBackground, SPACING_MULTIPLIER } from '@/lib/tokens';
import { resolveStyleId } from '@/lib/style-migration';
import { DnaProvider } from '@/lib/dna-context';
import { BereichRenderer } from '@/components/layout/BereichRenderer';
import { SiteNav } from '@/components/layout/SiteNav';
import { buildNavItems } from '@/components/layout/nav-config';
import { FALLBACK_PALETTES, FALLBACK_FONTS, FALLBACK_STYLES } from '@/components/landing/preview-tokens';
import { DEMO_PAGES, demoByStyle, img, type DemoPage } from '@/lib/demo-pages';
import type { EffectiveTokens, WeddingBereich } from '@/types/supabase';

/**
 * Öffentliche Demo-Seite je Designwelt: /demo/editorial, /demo/kinetic, …
 *
 * Rendert dieselben Bereichskomponenten wie eine echte Hochzeitsseite, aber
 * aus den kuratierten Daten in lib/demo-pages.ts — ohne Datenbank, damit die
 * Demos unabhängig vom Seeding immer erreichbar sind. Formulare laufen im
 * Vorschaumodus: sichtbar und bedienbar, aber ohne zu speichern.
 *
 * Conversion: eine schlanke Leiste oben („Diesen Stil wählen") und ein
 * Abschlussblock am Ende. Sonst nichts, was die Demo stört.
 */

interface PageProps {
  params: Promise<{ style: string }>;
}

export function generateStaticParams() {
  return DEMO_PAGES.map((d) => ({ style: d.style }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { style } = await params;
  const d = demoByStyle(style);
  if (!d) return { title: 'Demo — sarahiver.de' };
  const styleName = FALLBACK_STYLES.find((s) => s.id === d.style)?.name ?? d.style;
  return {
    title: `${styleName} — Beispielseite | sarahiver.de`,
    description: `${d.name1} & ${d.name2}: eine komplette Hochzeitswebsite im Stil ${styleName}. ${d.claim}.`,
  };
}

function buildTokens(d: DemoPage): EffectiveTokens {
  const style = FALLBACK_STYLES.find((s) => s.id === d.style) ?? FALLBACK_STYLES[0];
  const pal = FALLBACK_PALETTES.find((p) => p.id === style.default_palette_id) ?? FALLBACK_PALETTES[0];
  const fnt = FALLBACK_FONTS.find((f) => f.id === style.default_font_id) ?? FALLBACK_FONTS[0];
  return {
    wedding_site_id: `demo-${d.style}`,
    slug: d.slug,
    start_style_id: d.style,
    nav_variant: 'a',
    color_bg: pal.color_bg,
    color_bg_soft: pal.color_bg_soft,
    color_accent: pal.color_accent,
    color_accent_deep: pal.color_accent_deep,
    color_ink: pal.color_ink,
    font_display: fnt.font_display,
    font_body: fnt.font_body,
    font_script: fnt.font_script,
    display_weight: fnt.display_weight,
    display_style: fnt.display_style as EffectiveTokens['display_style'],
    dna_align: style.dna_align as EffectiveTokens['dna_align'],
    dna_spacing: style.dna_spacing as EffectiveTokens['dna_spacing'],
    dna_decor: style.dna_decor as EffectiveTokens['dna_decor'],
    dna_contrast: style.dna_contrast as EffectiveTokens['dna_contrast'],
    couple_name_1: d.name1,
    couple_name_2: d.name2,
    wedding_date: d.date,
    wedding_location: d.location,
    hero_image_url: img(d.hero, 1800),
  } as EffectiveTokens;
}

export default async function DemoPageRoute({ params }: PageProps) {
  const { style } = await params;
  const d = demoByStyle(style);
  if (!d) notFound();

  const styleName = FALLBACK_STYLES.find((s) => s.id === d.style)?.name ?? d.style;
  const tokens = buildTokens(d);
  const cssVars = tokensToCSSVariables(tokens);
  const dna = {
    align: tokens.dna_align,
    spacing: tokens.dna_spacing,
    decor: tokens.dna_decor,
    contrast: tokens.dna_contrast,
    spacingMultiplier: SPACING_MULTIPLIER[tokens.dna_spacing],
  };
  const styleHint = resolveStyleId(d.style);

  const { buildDemoBereiche } = await import('@/lib/demo-pages');
  const bereiche = buildDemoBereiche(d).map(
    (b) =>
      ({
        id: `demo-${d.style}-${b.key}`,
        wedding_site_id: `demo-${d.style}`,
        bereich_key: b.key,
        variant: b.variant,
        position: b.position,
        display_order: b.position,
        is_active: true,
        content: b.content,
      }) as unknown as WeddingBereich,
  );

  const navItems = buildNavItems(bereiche.map((b) => b.bereich_key));
  const coupleShort = `${d.name1[0]} & ${d.name2[0]}`;

  return (
    <>
      <div className="demo-bar">
        <span className="demo-bar__label">
          Beispielseite · <strong>{styleName}</strong>
        </span>
        <span className="demo-bar__actions">
          {/* Bewusst einfache Links (wie auf der Landingpage): voller
              Seitenwechsel, damit der Wechsel aus der Stilwelt heraus
              zuverlässig funktioniert. */}
          <a className="demo-bar__link" href="/#stile">
            Alle Stile
          </a>
          <a className="demo-bar__cta" href={`/signup?style=${d.style}`}>
            Diesen Stil wählen
          </a>
        </span>
      </div>

      <div style={cssVars} className="wedding-site-wrapper min-h-screen" data-style={styleHint} data-phase="main">
        <DnaProvider dna={dna}>
          {navItems.length > 0 && <SiteNav variant="a" items={navItems} coupleShort={coupleShort} />}
          <main>
            {bereiche.map((bereich, index) => (
              <section
                key={bereich.id}
                id={`bereich-${bereich.bereich_key}`}
                style={{
                  background:
                    getBereichBackground(index, bereich.bereich_key, index === bereiche.length - 1) === 'bg'
                      ? 'var(--bg)'
                      : 'var(--bg-soft)',
                }}
                data-bereich={bereich.bereich_key}
                data-variant={bereich.variant}
              >
                <BereichRenderer
                  bereich={bereich}
                  tokens={tokens}
                  weddingSlug={d.slug}
                  rsvp={{ mode: 'preview' }}
                />
              </section>
            ))}
          </main>
        </DnaProvider>
      </div>

      <section className="demo-outro">
        <p className="demo-outro__eyebrow">Beispielseite · {styleName}</p>
        <h2 className="demo-outro__title">
          So könnte eure Seite aussehen — mit euren Namen, eurem Datum, euren Bildern.
        </h2>
        <p className="demo-outro__text">
          {d.name1} &amp; {d.name2} gibt es nicht wirklich. Alles auf dieser Seite ist in wenigen
          Minuten im Dashboard änderbar: Texte, Bilder, Reihenfolge der Bereiche und die Variante
          jedes Bereichs.
        </p>
        <div className="demo-outro__actions">
          <a className="demo-outro__cta" href={`/signup?style=${d.style}`}>
            Mit {styleName} starten — 69 € einmalig
          </a>
          <a className="demo-outro__link" href="/#stile">
            Andere Stile ansehen
          </a>
        </div>
        <p className="demo-outro__meta">Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.</p>
      </section>
    </>
  );
}
