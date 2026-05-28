/**
 * Geschenke (Gifts) — geteilte Typen, Config und Helfer.
 *
 * Use-Case: Wunsch-Items, die Gäste RESERVIEREN können (verhindert Doppel-
 * geschenke), plus optionale Bankverbindung (IBAN) als Reisekasse.
 * Reservieren wie bei sarahiver.com: reserveItem(id, name) → Item gilt als
 * reserviert (ausgegraut, Button "Reserviert"). Kein echtes Bezahlen.
 *
 * content-Schema:
 *   eyebrow?, title?, description?  (Texte; title mit em-Tags)
 *   reserve_success?:  string
 *   iban_enabled?:     boolean
 *   iban?, iban_holder?, iban_note?
 *   items?:            GiftItem[]
 */

export interface GiftItem {
  id: string;
  title: string;
  description?: string;
  amount?: string | null; // z.B. "120 €"
  image?: string | null;
  reserved?: boolean;
  reserved_by?: string;
}

export interface GiftsContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  reserve_success?: string;
  iban_enabled?: boolean;
  iban?: string;
  iban_holder?: string;
  iban_note?: string;
  items?: GiftItem[];
}

export const GIFTS_DEFAULTS = {
  eyebrow: 'Wünsche',
  title: '<em>Geschenkideen</em>',
  description:
    'Das größte Geschenk ist eure Anwesenheit. Wer uns dennoch etwas schenken möchte, findet hier ein paar Ideen.',
  reserve_success: 'Danke! Wir haben das für euch vermerkt.',
  iban_note: 'Wer uns lieber etwas zur Reisekasse beisteuern mag:',
} as const;

export interface GiftsConfig {
  eyebrow: string;
  title: string;
  description: string;
  reserveSuccess: string;
  ibanEnabled: boolean;
  iban: string;
  ibanHolder: string;
  ibanNote: string;
}

export function readConfig(content: Record<string, unknown>): GiftsConfig {
  return {
    eyebrow: (content.eyebrow as string) ?? GIFTS_DEFAULTS.eyebrow,
    title: (content.title as string) ?? GIFTS_DEFAULTS.title,
    description: (content.description as string) ?? GIFTS_DEFAULTS.description,
    reserveSuccess: (content.reserve_success as string) ?? GIFTS_DEFAULTS.reserve_success,
    ibanEnabled: content.iban_enabled === true,
    iban: (content.iban as string) ?? '',
    ibanHolder: (content.iban_holder as string) ?? '',
    ibanNote: (content.iban_note as string) ?? GIFTS_DEFAULTS.iban_note,
  };
}

export function readItems(content: Record<string, unknown>): GiftItem[] {
  const raw = content.items;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (it): it is GiftItem =>
        typeof it === 'object' && it !== null && typeof (it as GiftItem).title === 'string',
    )
    .map((it, i) => ({
      id: typeof it.id === 'string' && it.id ? it.id : `g${i + 1}`,
      title: it.title,
      description: typeof it.description === 'string' ? it.description : '',
      amount: typeof it.amount === 'string' ? it.amount : null,
      image: typeof it.image === 'string' ? it.image : null,
      reserved: it.reserved === true,
      reserved_by: typeof it.reserved_by === 'string' ? it.reserved_by : '',
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

export interface ReserveSubmit {
  itemId: string;
  itemTitle: string;
  guestName: string;
  weddingSlug?: string;
}

/**
 * Kapselt die Reservierung (wie sarahiver.com reserveGiftItem). Aktuell
 * console.log-Fallback; echter Supabase-Update (items[].reserved=true,
 * reserved_by) + optionale Brevo-Notification ans Brautpaar als TODO.
 */
export async function submitReservation(
  payload: ReserveSubmit,
): Promise<{ ok: boolean; error?: string }> {
  // TODO: Supabase-Update + optionale Brevo-Notification
  // eslint-disable-next-line no-console
  console.log('[Gifts reserve]', payload);
  await new Promise((r) => setTimeout(r, 450));
  return { ok: true };
}
