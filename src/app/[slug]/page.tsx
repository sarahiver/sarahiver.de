import { notFound } from 'next/navigation';
import { loadWeddingSite, tokensToCSSVariables, getBereichBackground, SPACING_MULTIPLIER } from '@/lib/tokens';
import { resolveStyleId } from '@/lib/style-migration';
import { DnaProvider } from '@/lib/dna-context';
import { BereichRenderer } from '@/components/layout/BereichRenderer';
import { SiteNav } from '@/components/layout/SiteNav';
import { buildNavItems } from '@/components/layout/nav-config';
import { isReservedSlug, isValidSlugFormat } from '@/lib/slug-validation';
import { loadSiteAccess } from '@/lib/subscription';
import { loadSitePhase, loadPhaseBereiche, STD_KEYS, ARCHIV_KEYS, type SitePhase } from '@/lib/phases';
import SiteUnavailable from '@/components/layout/SiteUnavailable';
import type { WeddingBereich, Variant } from '@/types/supabase';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string; phase?: string }>;
}

// Immer frisch rendern: Phasen-Schalter + Inhaltsänderungen müssen sofort
// greifen (sonst „hängt" die Seite im alten Zustand). Hochzeitsseiten haben
// moderaten Traffic — der Verzicht auf ISR-Caching ist hier der richtige
// Trade-off für Korrektheit.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const slug = resolved?.slug;

  if (!slug || isReservedSlug(slug) || !isValidSlugFormat(slug)) {
    return { title: 'Nicht gefunden' };
  }
  const data = await loadWeddingSite(slug);
  if (!data) return { title: 'Hochzeitsseite nicht gefunden' };

  const title = `${data.tokens.couple_name_1} & ${data.tokens.couple_name_2}`;
  const date = new Date(data.tokens.wedding_date).toLocaleDateString('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  return {
    title: `${title} — Wir heiraten am ${date}`,
    description: `Die Hochzeitsseite von ${title}.`,
    robots: { index: false, follow: false },
  };
}

export default async function WeddingSitePage({ params, searchParams }: PageProps) {
  const resolved = await params;
  const slug = resolved?.slug;
  const sp = await searchParams;
  const mode: 'draft' | 'published' = sp?.preview === 'draft' ? 'draft' : 'published';

  if (!slug || isReservedSlug(slug) || !isValidSlugFormat(slug)) notFound();

  // Abo-Gating: gekündigte Seiten nicht ausliefern (nur published).
  if (mode === 'published') {
    const access = await loadSiteAccess(slug);
    if (access.blocked) return <SiteUnavailable />;
  }

  const data = await loadWeddingSite(slug, mode);
  if (!data) notFound();

  const { tokens, bereiche } = data;

  // ----- Phase bestimmen -----
  // Default: aus Schaltern + Daten aufgelöst (Save-the-Date → Hauptseite → Archiv).
  // Override per ?phase= für die Dashboard-Vorschau. Im Draft-Modus standardmäßig
  // die Hauptseite, sofern keine Phase explizit angefragt wird.
  const phaseInfo = await loadSitePhase(slug);
  const overrideParam = sp?.phase;
  const validOverride: SitePhase | null =
    overrideParam === 'std' || overrideParam === 'archiv' || overrideParam === 'main'
      ? overrideParam
      : null;
  const phase: SitePhase =
    validOverride ?? (mode === 'draft' ? 'main' : phaseInfo?.phase ?? 'main');

  const cssVars = tokensToCSSVariables(tokens);
  const dna = {
    align: tokens.dna_align,
    spacing: tokens.dna_spacing,
    decor: tokens.dna_decor,
    contrast: tokens.dna_contrast,
    spacingMultiplier: SPACING_MULTIPLIER[tokens.dna_spacing],
  };
  const styleHint = resolveStyleId(
    (tokens as typeof tokens & { start_style_id?: string }).start_style_id,
  );
  const coupleShort =
    tokens.couple_name_1 && tokens.couple_name_2
      ? `${tokens.couple_name_1[0]} & ${tokens.couple_name_2[0]}`
      : 'S & I';

  // ----- Bereiche je Phase zusammenstellen -----
  let renderBereiche: WeddingBereich[] = bereiche;
  let showNav = true;
  let danksagung: string | null = null;

  if (phase === 'std' && phaseInfo) {
    const loaded = await loadPhaseBereiche(phaseInfo.siteId, STD_KEYS);
    // STD: Hero und Countdown haben jeweils eine eigene Variante (A/B/C).
    renderBereiche = loaded.map((b) => {
      const v: Variant =
        b.bereich_key === 'hero'
          ? phaseInfo.config.std_hero_variant
          : b.bereich_key === 'countdown'
            ? phaseInfo.config.std_countdown_variant
            : (b.variant as Variant);
      return { ...b, variant: v } as WeddingBereich;
    });
    showNav = false;
  } else if (phase === 'archiv' && phaseInfo) {
    const loaded = await loadPhaseBereiche(phaseInfo.siteId, ARCHIV_KEYS);
    renderBereiche = loaded.map((b) => {
      const v: Variant =
        b.bereich_key === 'hero'
          ? phaseInfo.config.archiv_hero_variant
          : b.bereich_key === 'photoupload'
            ? phaseInfo.config.archiv_fotoupload_variant
            : (b.variant as Variant);
      return { ...b, variant: v } as WeddingBereich;
    });
    danksagung = phaseInfo.config.archiv_message;
    showNav = false;
  }

  const navVariant = (tokens as typeof tokens & { nav_variant?: string }).nav_variant ?? 'a';
  const navItems = buildNavItems(renderBereiche.map((b) => b.bereich_key));

  return (
    <div style={cssVars} className="wedding-site-wrapper min-h-screen" data-style={styleHint} data-phase={phase}>
      <DnaProvider dna={dna}>
        {showNav && navVariant !== 'none' && navItems.length > 0 && (
          <SiteNav variant={navVariant as 'a' | 'b' | 'c'} items={navItems} coupleShort={coupleShort} />
        )}
        <main>
          {renderBereiche.map((bereich, index) => {
            const isLast = index === renderBereiche.length - 1 && !danksagung;
            const bgKind = getBereichBackground(index, bereich.bereich_key, isLast);

            // Im Archiv die Danksagung direkt nach dem Hero einschieben.
            const danksagungNode =
              phase === 'archiv' && danksagung && bereich.bereich_key === 'hero' ? (
                <section
                  key="danksagung"
                  id="bereich-danksagung"
                  data-bereich="danksagung"
                  style={{ background: 'var(--bg-soft)' }}
                >
                  <div
                    style={{
                      maxWidth: 720,
                      margin: '0 auto',
                      padding: '88px 24px',
                      textAlign: 'center',
                      color: 'var(--ink, #1a1a1a)',
                    }}
                  >
                    <p style={{ whiteSpace: 'pre-wrap', fontSize: 20, lineHeight: 1.7, margin: 0 }}>
                      {danksagung}
                    </p>
                  </div>
                </section>
              ) : null;

            return (
              <div key={bereich.id}>
                <section
                  id={`bereich-${bereich.bereich_key}`}
                  style={{ background: bgKind === 'bg' ? 'var(--bg)' : 'var(--bg-soft)' }}
                  data-bereich={bereich.bereich_key}
                  data-variant={bereich.variant}
                >
                  <BereichRenderer bereich={bereich} tokens={tokens} weddingSlug={slug} />
                </section>
                {danksagungNode}
              </div>
            );
          })}
        </main>
      </DnaProvider>
    </div>
  );
}
