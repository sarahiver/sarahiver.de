import { createSupabaseServerClient } from './supabase-server';
import type {
  EffectiveTokens,
  WeddingBereich,
  Spacing,
} from '@/types/supabase';

/**
 * Token-Loader — lädt für einen Slug alle benötigten Daten:
 * 1. EffectiveTokens (aus der v_effective_tokens-View)
 * 2. Alle aktiven Bereiche der Hochzeitsseite
 *
 * Das ist die ZENTRALE Datenquelle für jede Hochzeitsseite.
 * Wird in Server Components aufgerufen, nicht in Client Components.
 */
export async function loadWeddingSite(slug: string): Promise<{
  tokens: EffectiveTokens;
  bereiche: WeddingBereich[];
} | null> {
  const supabase = await createSupabaseServerClient();

  // Parallel laden für Performance
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

  // Bereiche müssen zur wedding_site gehören
  const bereiche = (bereicheResult.data ?? []).filter(
    (b) => b.wedding_site_id === tokens.wedding_site_id
  ) as WeddingBereich[];

  return { tokens, bereiche };
}

/**
 * Spacing-Map: Token-Variable → konkrete Padding-Multiplier.
 * Wird in Komponenten genutzt, um responsives Padding zu rechnen.
 */
export const SPACING_MULTIPLIER: Record<Spacing, number> = {
  tight: 0.75,
  regular: 1.0,
  airy: 1.25,
  wide: 1.5,
};

/**
 * Generiert das CSS-Variable-Inline-Style für eine Hochzeitsseite.
 * Wird ins <html style={...}> oder <body style={...}> gepackt.
 */
export function tokensToCSSVariables(tokens: EffectiveTokens): React.CSSProperties {
  const style: Record<string, string> = {
    '--bg': tokens.color_bg,
    '--bg-soft': tokens.color_bg_soft,
    '--accent': tokens.color_accent,
    '--accent-deep': tokens.color_accent_deep,
    '--ink': tokens.color_ink,
    '--font-display': tokens.font_display,
    '--font-body': tokens.font_body,
    '--font-script': tokens.font_script ?? 'inherit',
    '--display-weight': String(tokens.display_weight),
    '--display-style': tokens.display_style,
    '--align': tokens.dna_align,
    '--spacing': tokens.dna_spacing,
    '--decor': tokens.dna_decor,
    '--contrast': tokens.dna_contrast,
    '--spacing-multiplier': String(SPACING_MULTIPLIER[tokens.dna_spacing]),
  };

  return style as React.CSSProperties;
}

/**
 * Berechnet, ob ein Bereich auf --bg oder --bg-soft Hintergrund läuft.
 *
 * Regel:
 *   - Alternierender 2er-Rhythmus basierend auf display_order
 *   - Featured Bereiche IMMER auf --bg-soft (für visuelle Aufwertung)
 *   - Hero (index 0) und letzter Bereich immer auf --bg
 *
 * @param index 0-basierter Index in der display_order
 * @param bereichKey z.B. 'hero', 'lovestory'
 * @param isLast true, wenn letzter Bereich vor Footer
 */
export function getBereichBackground(
  index: number,
  bereichKey: string,
  isLast: boolean
): 'bg' | 'bg-soft' {
  const FEATURED: string[] = ['lovestory', 'gifts'];

  if (index === 0) return 'bg'; // Hero immer bg
  if (isLast) return 'bg';
  if (FEATURED.includes(bereichKey)) return 'bg-soft';

  return index % 2 === 0 ? 'bg' : 'bg-soft';
}
