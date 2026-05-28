/**
 * Timeline — geteilte Typen und Helfer für die drei Varianten.
 *
 * content-Schema:
 *   eyebrow?:     string
 *   title?:       string  (em-Tags erlaubt)
 *   description?: string
 *   events:       TimelineEvent[]
 *
 * TimelineEvent:
 *   id:             string  — stabile ID (key-Prop)
 *   time:           string  — "HH:MM"
 *   title:          string
 *   description?:   string
 *   location_name?: string
 *   location_url?:  string
 *   image?:         string  (URL, für Variante A optional, C empfohlen)
 *   current?:       boolean — "läuft jetzt"-Marker (später automatisch per Zeit)
 */

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description?: string;
  location_name?: string;
  location_url?: string;
  image?: string;
  current?: boolean;
}

export interface TimelineContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  events?: TimelineEvent[];
}

export const TIMELINE_DEFAULTS = {
  eyebrow: 'Der große Tag',
  title: 'Tagesablauf',
  description: 'Plant euren Tag mit uns — hier seht ihr, was wann passiert.',
} as const;

/**
 * Liest events[] sicher aus dem content-JSON.
 */
export function readEvents(content: Record<string, unknown>): TimelineEvent[] {
  const raw = content.events;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (e): e is TimelineEvent =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as TimelineEvent).time === 'string' &&
        typeof (e as TimelineEvent).title === 'string',
    )
    .map((e, i) => ({
      ...e,
      id: typeof e.id === 'string' && e.id ? e.id : `ev${i + 1}`,
    }));
}

/**
 * Findet den Default-Aktiv-Index: das als current markierte Event,
 * sonst 0. SSR-safe — nutzt KEINE aktuelle Zeit.
 */
export function defaultActiveIndex(events: TimelineEvent[]): number {
  const idx = events.findIndex((e) => e.current);
  return idx >= 0 ? idx : 0;
}

/**
 * Emoji-Mapping für Variante A (Badge auf der Karte).
 */
export function eventEmoji(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('empfang') || t.includes('welcome')) return '✨';
  if (t.includes('trauung') || t.includes('ja-wort')) return '💍';
  if (t.includes('sekt') || t.includes('drink') || t.includes('apéro')) return '🥂';
  if (t.includes('dinner') || t.includes('essen') || t.includes('menü')) return '🍽️';
  if (t.includes('party') || t.includes('tanz')) return '🎶';
  if (t.includes('frühstück') || t.includes('brunch')) return '☕';
  if (t.includes('foto')) return '📸';
  if (t.includes('snack')) return '🌭';
  if (t.includes('kuchen') || t.includes('torte')) return '🍰';
  if (t.includes('rede') || t.includes('speech')) return '🎤';
  return '·';
}

/**
 * Title-Helper mit <em>-Allowlist (identisch zu anderen Bereichen).
 */
export function renderTitleWithEm(input: string): string {
  const escaped = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return escaped
    .replace(/&lt;em&gt;/g, '<em>')
    .replace(/&lt;\/em&gt;/g, '</em>');
}
