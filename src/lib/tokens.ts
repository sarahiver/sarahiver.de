import { createSupabaseServerClient } from './supabase-server';
import type {
  EffectiveTokens,
  WeddingBereich,
  Spacing,
} from '@/types/supabase';

/**
 * Token-Loader — lädt für einen Slug alle benötigten Daten.
 */
export async function loadWeddingSite(slug: string): Promise<{
  tokens: EffectiveTokens;
  bereiche: WeddingBereich[];
} | null> {
  const supabase = await createSupabaseServerClient();

  const [tokensResult, bereicheResult] = await Promise.all([
    supabase
      .from('v_effective_tokens')
      .select('*')
      .eq('slug', slug)
      .maybeSingle(),
    supabase
      .from('wedding_bereiche')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
  ]);

  if (tokensResult.error || !tokensResult.data) {
    console.error('Failed to load tokens for slug:', slug, tokensResult.error);
    return null;
  }

  const tokens = tokensResult.data as EffectiveTokens;

  // nav_variant separat aus wedding_sites laden (nicht in der View).
  // Defensive: wenn Spalte/Query fehlschlägt, Fallback auf 'a'.
  let navVariant: string = 'a';
  try {
    const navResult = await supabase
      .from('wedding_sites')
      .select('nav_variant')
      .eq('id', tokens.wedding_site_id)
      .maybeSingle();
    const v = (navResult.data as { nav_variant?: string } | null)?.nav_variant;
    if (v === 'a' || v === 'b' || v === 'c' || v === 'none') navVariant = v;
  } catch {
    // Spalte existiert evtl. noch nicht — Fallback bleibt 'a'
  }
  (tokens as EffectiveTokens & { nav_variant?: string }).nav_variant = navVariant;

  let bereiche = (bereicheResult.data ?? []).filter(
    (b) => b.wedding_site_id === tokens.wedding_site_id,
  ) as WeddingBereich[];

  // Purchase-Filter: nur Bereiche zeigen, die wirklich gebucht sind. So bleibt
  // Gäste-Seite konsistent zum Dashboard (welches denselben Filter macht).
  //
  // Defensiv: Wenn die Query keine Ergebnisse liefert (Tabelle fehlt, RLS
  // blockiert, leere Booking-Liste eines Pre-Funnel-Datensatzes), filtern wir
  // NICHT — sonst zeigt die Gäste-Seite gar nichts. Erst wenn Purchases
  // gefunden werden, wenden wir den Filter an. Das vermeidet das Worst-Case-
  // Szenario "leere Hochzeitsseite wegen Misskonfiguration".
  try {
    const purchasesResult = await supabase
      .from('wedding_purchases')
      .select('bereich_key')
      .eq('wedding_site_id', tokens.wedding_site_id);

    if (purchasesResult.error) {
      console.warn(
        '[loadWeddingSite] purchases query failed, showing all active bereiche:',
        purchasesResult.error.message,
      );
    } else {
      const purchased = new Set(
        (purchasesResult.data || []).map((p) => (p as { bereich_key: string }).bereich_key),
      );
      if (purchased.size > 0) {
        bereiche = bereiche.filter((b) => purchased.has(b.bereich_key));
      } else {
        console.warn(
          '[loadWeddingSite] no purchases found for slug, showing all active bereiche (pre-funnel default):',
          slug,
        );
      }
    }
  } catch (err) {
    console.warn('[loadWeddingSite] purchases lookup threw, showing all active bereiche:', err);
  }

  return { tokens, bereiche };
}

export const SPACING_MULTIPLIER: Record<Spacing, number> = {
  tight: 0.75,
  regular: 1.0,
  airy: 1.25,
  wide: 1.5,
};

/**
 * Per-Stil Image-Filter — gibt Fotos eine konsistente Anmutung.
 */
const IMAGE_FILTERS: Record<string, string> = {
  klassisch: 'sepia(0.14) saturate(0.95) contrast(1.02) brightness(1.02)',
  modern: 'saturate(0.78) contrast(1.06) brightness(1.04)',
  floral: 'saturate(0.82) contrast(0.94) brightness(1.07) sepia(0.08) hue-rotate(-4deg)',
  minimal: 'grayscale(1) contrast(1.05)',
  festlich: 'saturate(1.08) contrast(1.12) brightness(0.96)',
};

const PADDING_SCALE = {
  tight: '18px',
  regular: '32px',
  airy: '48px',
  wide: '64px',
};

/**
 * Generiert das CSS-Variable-Inline-Style für eine Hochzeitsseite.
 */
export function tokensToCSSVariables(tokens: EffectiveTokens): React.CSSProperties {
  const styleHint = (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'klassisch';
  const imgFilter = IMAGE_FILTERS[styleHint] ?? IMAGE_FILTERS.klassisch;

  const style: Record<string, string> = {
    '--bg': tokens.color_bg,
    '--bg-soft': tokens.color_bg_soft,
    '--accent': tokens.color_accent,
    '--accent-deep': tokens.color_accent_deep,
    '--ink': tokens.color_ink,
    '--font-display': tokens.font_display,
    '--font-body': tokens.font_body,
    '--font-script': tokens.font_script ?? 'inherit',
    '--font-mono': "'DM Mono', ui-monospace, monospace",
    '--display-weight': String(tokens.display_weight),
    '--display-style': tokens.display_style,
    '--align': tokens.dna_align,
    '--spacing': tokens.dna_spacing,
    '--decor': tokens.dna_decor,
    '--contrast': tokens.dna_contrast,
    '--spacing-multiplier': String(SPACING_MULTIPLIER[tokens.dna_spacing]),
    '--ink-soft': `color-mix(in srgb, ${tokens.color_ink} 65%, transparent)`,
    '--muted': `color-mix(in srgb, ${tokens.color_ink} 45%, transparent)`,
    '--border': `color-mix(in srgb, ${tokens.color_ink} 15%, transparent)`,
    '--border-soft': `color-mix(in srgb, ${tokens.color_ink} 8%, transparent)`,
    '--img-filter': imgFilter,
    '--vignette': 'rgba(20, 16, 12, 0.45)',
    '--vignette-soft': 'rgba(20, 16, 12, 0.12)',
    '--gold': '#C9A668',
    '--pad-tight': PADDING_SCALE.tight,
    '--pad-regular': PADDING_SCALE.regular,
    '--pad-airy': PADDING_SCALE.airy,
    '--pad-wide': PADDING_SCALE.wide,
  };

  return style as React.CSSProperties;
}

/**
 * Background-Rhythmus.
 */
export function getBereichBackground(
  index: number,
  bereichKey: string,
  isLast: boolean
): 'bg' | 'bg-soft' {
  const FEATURED: string[] = ['lovestory', 'gifts'];
  if (index === 0) return 'bg';
  if (isLast) return 'bg';
  if (FEATURED.includes(bereichKey)) return 'bg-soft';
  return index % 2 === 0 ? 'bg' : 'bg-soft';
}
