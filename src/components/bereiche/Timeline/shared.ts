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
 * Parst "HH:MM" zu Minuten seit Mitternacht. Ungültig → null.
 */
function parseTimeToMinutes(time: string): number | null {
  const m = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/**
 * Berechnet anhand der aktuellen Uhrzeit, welches Event gerade "läuft".
 * Ein Event läuft, wenn now >= seine Startzeit UND now < Startzeit des
 * nächsten Events. Das letzte Event läuft ab seiner Startzeit für 3h.
 *
 * WICHTIG: nur clientseitig (nach Hydration) aufrufen mit `now` =
 * new Date() — niemals im SSR-Initial-Render (Hydration-Mismatch).
 *
 * Gibt -1 zurück wenn kein Event gerade läuft (z.B. morgens vor allem,
 * oder spät nachts nach allem).
 *
 * Nur sinnvoll am Hochzeitstag selbst — an anderen Tagen gibt es kein
 * "live". Daher optional ein `weddingDate` zum Tagesabgleich.
 */
export function liveEventIndex(
  events: TimelineEvent[],
  now: Date,
  weddingDate?: string,
): number {
  if (events.length === 0) return -1;

  // Nur am Hochzeitstag "live" anzeigen
  if (weddingDate) {
    const wd = weddingDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (wd) {
      const today = now.toISOString().slice(0, 10);
      if (today !== `${wd[1]}-${wd[2]}-${wd[3]}`) return -1;
    }
  }

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const times = events.map((e) => parseTimeToMinutes(e.time));

  for (let i = 0; i < events.length; i++) {
    const start = times[i];
    if (start === null) continue;
    const next = i + 1 < times.length ? times[i + 1] : null;
    const end = next !== null ? next : start + 180; // letztes Event: +3h
    if (nowMin >= start && nowMin < end) return i;
  }
  return -1;
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
