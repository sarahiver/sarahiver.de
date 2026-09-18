import type { buildSubmitPayload } from './shared';

/**
 * RSVP — Netzwerkschicht im Browser.
 *
 * Übersetzt HTTP-Antworten in wenige fachliche Ergebnisse. Die Komponenten
 * sehen nie Statuscodes oder Servertexte zu technischen Fehlern — nur diese
 * Fälle. Eigene Sicherheitsentscheidungen trifft hier nichts: Das Cookie setzt
 * und prüft ausschließlich der Server.
 */

export type AccessResult =
  | { kind: 'open' }      // Schutz aus → direkt Formular
  | { kind: 'locked' }    // Schutz an, keine gültige Freischaltung
  | { kind: 'unlocked' }  // Schutz an, Cookie gültig
  | { kind: 'unknown' };  // Netzwerk-/Serverfehler beim Nachfragen

export type UnlockResult =
  | { kind: 'ok' }
  | { kind: 'wrong' }
  | { kind: 'rate-limited' }
  | { kind: 'unavailable' }
  | { kind: 'error' };

export type SubmitResult =
  | { kind: 'ok'; attending: boolean }
  | { kind: 'unauthorized' }
  | { kind: 'duplicate' }
  | { kind: 'invalid'; field?: string; message: string }
  | { kind: 'error' };

type Payload = ReturnType<typeof buildSubmitPayload>;

async function readJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function fetchAccess(slug: string, signal?: AbortSignal): Promise<AccessResult> {
  try {
    const res = await fetch(`/api/rsvp/access?slug=${encodeURIComponent(slug)}`, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      signal,
    });
    if (!res.ok) return { kind: 'unknown' };
    const data = await readJson(res);
    if (data.required === false) return { kind: 'open' };
    return data.unlocked === true ? { kind: 'unlocked' } : { kind: 'locked' };
  } catch {
    return { kind: 'unknown' };
  }
}

export async function unlockRsvp(slug: string, code: string): Promise<UnlockResult> {
  try {
    const res = await fetch('/api/rsvp/unlock', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, code }),
    });
    if (res.ok) {
      const data = await readJson(res);
      return data.unlocked === true ? { kind: 'ok' } : { kind: 'error' };
    }
    if (res.status === 401 || res.status === 400) return { kind: 'wrong' };
    if (res.status === 429) return { kind: 'rate-limited' };
    if (res.status === 503) return { kind: 'unavailable' };
    return { kind: 'error' };
  } catch {
    return { kind: 'error' };
  }
}

export async function submitRsvp(slug: string, payload: Payload): Promise<SubmitResult> {
  try {
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, ...payload }),
    });
    const data = await readJson(res);
    if (res.ok && data.ok === true) {
      return { kind: 'ok', attending: data.attending === true };
    }
    if (res.status === 401 || res.status === 403) return { kind: 'unauthorized' };
    if (res.status === 409) return { kind: 'duplicate' };
    if (res.status === 400 && typeof data.error === 'string' && typeof data.field === 'string') {
      return { kind: 'invalid', field: data.field, message: data.error };
    }
    return { kind: 'error' };
  } catch {
    return { kind: 'error' };
  }
}
