/**
 * Musikwünsche (MusicWishes) — geteilte Typen, Config und Helfer.
 *
 * Use-Case: Gäste tragen Songwünsche für die Party ein (Titel + Interpret,
 * optional "von wem"). KEINE Spotify-Anbindung (freie Texteingabe — Spotify
 * verlangt seit 2026 Premium-Abo + Quota-Antrag, ungeeignet für Multi-Tenant).
 * KEINE Moderation: Wünsche erscheinen sofort (optimistisch oben eingefügt).
 *
 * content-Schema:
 *   eyebrow?:          string
 *   title?:            string  (em-Tags erlaubt)
 *   description?:      string
 *   success_message?:  string
 *   success_sub?:      string
 *   items?:            MusicWish[]   (vorhandene Wünsche, neueste zuerst)
 */

export interface MusicWish {
  id: string;
  title: string;
  artist: string;
  guest_name?: string;
  created_at: string; // ISO
  isFresh?: boolean; // lokal frisch hinzugefügt (Hervorhebung)
}

export interface MusicWishesContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  success_message?: string;
  success_sub?: string;
  items?: MusicWish[];
}

export const MUSICWISHES_DEFAULTS = {
  eyebrow: 'Eure Lieblingssongs',
  title: 'Wünscht euch was <em>Musik</em>',
  description:
    'Welcher Song darf auf unserer Tanzfläche nicht fehlen? Tragt eure Wünsche ein — Titel und Interpret reichen.',
  success_message: 'Danke! Euer Songwunsch ist notiert.',
  success_sub: 'Wir geben dem DJ einen kleinen Stups in eure Richtung 🎧',
} as const;

/**
 * Liest vorhandene Wünsche sicher aus content (Reihenfolge wie geliefert,
 * Konvention: neueste zuerst).
 */
export function readItems(content: Record<string, unknown>): MusicWish[] {
  const raw = content.items;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (w): w is MusicWish =>
        typeof w === 'object' &&
        w !== null &&
        typeof (w as MusicWish).title === 'string' &&
        typeof (w as MusicWish).artist === 'string',
    )
    .map((w, i) => ({
      id: typeof w.id === 'string' && w.id ? w.id : `m${i + 1}`,
      title: w.title,
      artist: w.artist,
      guest_name: typeof w.guest_name === 'string' ? w.guest_name : '',
      created_at: typeof w.created_at === 'string' ? w.created_at : '',
    }));
}

export function renderTitleWithEm(input: string): string {
  const escaped = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return escaped.replace(/&lt;em&gt;/g, '<em>').replace(/&lt;\/em&gt;/g, '</em>');
}

/** Deterministischer Hash → [0, 1). Kein Math.random → SSR-safe. */
export function hash01(id: string, idx: number): number {
  let h = 0;
  const s = String(id) + '·' + idx;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  const t = (h % 1000) / 1000;
  return t < 0 ? t + 1 : t;
}

/** Erste Initiale (für Platzhalter-Cover in Variante B). */
export function initialOf(s: string): string {
  const c = String(s || '').trim().charAt(0).toUpperCase();
  return c || '♪';
}

/** SSR-safe Kurzdatum ohne Jahr ("14. Nov") aus ISO. */
const MONATE_KURZ = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
];
export function formatDayMonthDE(iso: string): string {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '';
  const day = parseInt(m[3], 10);
  const month = MONATE_KURZ[parseInt(m[2], 10) - 1] || '';
  return `${day}. ${month}`;
}

/**
 * Cover-Gradient (Variante B) — deterministisch aus kuratierter oklch-Palette.
 * Liefert zwei Farben für linear-gradient. Server und Client identisch.
 */
const COVER_PALETTE: ReadonlyArray<readonly [string, string]> = [
  ['oklch(0.62 0.10 30)', 'oklch(0.42 0.08 25)'], // warm rose-brown
  ['oklch(0.66 0.07 100)', 'oklch(0.45 0.06 95)'], // sage-olive
  ['oklch(0.70 0.06 250)', 'oklch(0.45 0.06 245)'], // dusty blue
  ['oklch(0.65 0.09 320)', 'oklch(0.42 0.08 315)'], // mauve
];
export function coverGradient(id: string, idx: number): { a: string; b: string } {
  const t = hash01(id, idx);
  const i = Math.floor(t * COVER_PALETTE.length) % COVER_PALETTE.length;
  return { a: COVER_PALETTE[i][0], b: COVER_PALETTE[i][1] };
}

/**
 * Vinyl-Label-Farbe (Variante C) — deterministisch aus kuratierter Palette.
 */
const VINYL_PALETTE: readonly string[] = [
  'oklch(0.55 0.14 30)', // burnt rose
  'oklch(0.55 0.10 90)', // mustard-olive
  'oklch(0.55 0.12 250)', // blue
  'oklch(0.55 0.13 320)', // plum
  'oklch(0.62 0.13 60)', // amber
];
export function vinylLabel(id: string, idx: number): string {
  return VINYL_PALETTE[Math.floor(hash01(id, idx) * VINYL_PALETTE.length) % VINYL_PALETTE.length];
}

/** Label-Text fürs Vinyl: erstes Wort des Interpreten (oder Titel). */
export function vinylLabelText(w: MusicWish): string {
  return (w.artist.split(/\s|&/)[0] || w.title).trim();
}

export interface MusicWishSubmit {
  title: string;
  artist: string;
  guestName?: string;
  weddingSlug?: string;
}

/**
 * Submit an Public-API. Liefert den angelegten Wunsch zurück (mit DB-ID),
 * damit das Frontend ihn optimistic in die Liste einfügen kann.
 */
export async function submitWish(
  payload: MusicWishSubmit,
): Promise<{ ok: boolean; wish?: MusicWish; error?: string }> {
  if (!payload.weddingSlug) {
    return { ok: false, error: 'Hochzeitsseite fehlt.' };
  }
  try {
    const res = await fetch('/api/music-wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: payload.weddingSlug,
        title: payload.title,
        artist: payload.artist,
        guest_name: payload.guestName || '',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok || !data.wish) {
      return { ok: false, error: data?.error || 'Konnte nicht gesendet werden.' };
    }
    const wish: MusicWish = {
      id: data.wish.id,
      title: data.wish.title,
      artist: data.wish.artist,
      guest_name: data.wish.guest_name || '',
      created_at: data.wish.created_at,
      isFresh: true,
    };
    return { ok: true, wish };
  } catch (err) {
    console.error('[MusicWishes submit] network error:', err);
    return { ok: false, error: 'Netzwerkfehler.' };
  }
}
