/**
 * Gästebuch (Guestbook) — geteilte Typen, Config und Helfer.
 *
 * Moderation ist AKTIV: Einträge erscheinen erst nach Freigabe durch das
 * Brautpaar (Dashboard). Das Frontend zeigt nur freigegebene Einträge
 * (content.entries) und nach dem Absenden einen Pending-/Danke-Zustand —
 * der neue Eintrag erscheint NICHT sofort in der Liste.
 *
 * Felder pro Eintrag: nur Name + Nachricht (+ system-gesetztes created_at).
 *
 * content-Schema:
 *   eyebrow?:          string
 *   title?:            string  (em-Tags erlaubt)
 *   description?:      string
 *   success_message?:  string
 *   success_sub?:      string
 *   moderation?:       string  (Hinweistext am Formular)
 *   entries?:          GuestbookEntry[]   (freigegebene Einträge, neueste zuerst)
 */

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  created_at: string; // ISO
}

export interface GuestbookContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  success_message?: string;
  success_sub?: string;
  moderation?: string;
  entries?: GuestbookEntry[];
}

export const GUESTBOOK_DEFAULTS = {
  eyebrow: 'Eure Worte',
  title: '<em>Gästebuch</em>',
  description: 'Hinterlasst uns ein paar Worte — wir freuen uns über jede Zeile.',
  success_message: 'Danke für eure lieben Worte! Euer Eintrag wird nach einer kurzen Prüfung sichtbar.',
  success_sub: 'Unser Brautpaar schaut sich jeden Eintrag persönlich an, bevor er hier erscheint.',
  moderation: 'Einträge erscheinen nach einer kurzen Prüfung.',
} as const;

/**
 * Liest freigegebene Einträge sicher aus content (neueste zuerst —
 * Reihenfolge wird so übernommen, wie sie geliefert wird).
 */
export function readEntries(content: Record<string, unknown>): GuestbookEntry[] {
  const raw = content.entries;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (e): e is GuestbookEntry =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as GuestbookEntry).name === 'string' &&
        typeof (e as GuestbookEntry).message === 'string',
    )
    .map((e, i) => ({
      id: typeof e.id === 'string' && e.id ? e.id : `g${i + 1}`,
      name: e.name,
      message: e.message,
      created_at: typeof e.created_at === 'string' ? e.created_at : '',
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

/**
 * Deterministische Rotation aus Eintrags-ID + Index → [-2.6, 2.6] Grad.
 * Kein Math.random → SSR/Hydration-safe (Server und Client identisch).
 */
export function rotationFor(id: string, idx: number): number {
  let h = 0;
  const s = String(id) + '·' + idx;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  const t = (h % 1000) / 1000; // -1..1
  const norm = t < 0 ? t + 1 : t; // 0..1
  return Number((norm * 5.2 - 2.6).toFixed(2));
}

export interface GuestbookSubmit {
  name: string;
  message: string;
  weddingSlug?: string;
}

/**
 * Kapselt den Submit. Aktuell console.log-Fallback (wie RSVP); echter
 * Supabase-Insert in eine moderierte guestbook_entries-Tabelle als TODO.
 * Liefert ok/Fehler zurück.
 */
export async function submitEntry(payload: GuestbookSubmit): Promise<{ ok: boolean; error?: string }> {
  // TODO: Supabase-Insert (status='pending') + optionale Brevo-Notification ans Brautpaar
  // eslint-disable-next-line no-console
  console.log('[Guestbook submit]', payload);
  // Simulierter Netzwerk-Roundtrip
  await new Promise((r) => setTimeout(r, 500));
  return { ok: true };
}
