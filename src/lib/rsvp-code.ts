import bcrypt from 'bcryptjs';

/**
 * Einladungscode für die RSVP-Rückmeldung.
 *
 * Bewusst ein EINLADUNGSCODE, kein Passwort: Das Paar gibt ihn auf der
 * Einladung weiter, der Gast tippt ihn ab. Deshalb menschenfreundlich —
 * Groß-/Kleinschreibung egal, Leerzeichen am Rand egal, kurze Codes erlaubt.
 *
 * Gespeichert wird nur der bcrypt-Hash (siehe lib/rsvp-server.ts).
 */

/**
 * Kostenfaktor 10.
 *
 * Auf einer Vercel-Serverless-Funktion kostet das rund 60–80 ms pro Vergleich —
 * spürbar genug, um Brute Force zusammen mit dem Rate Limit unattraktiv zu
 * machen, und niedrig genug, dass die Unlock-Antwort schnell bleibt. 12 wäre
 * das Vierfache an Rechenzeit für ein Geheimnis, das ohnehin auf einer
 * gedruckten Einladung steht.
 */
export const BCRYPT_COST = 10;

export const CODE_MIN_LENGTH = 4;
export const CODE_MAX_LENGTH = 40;

/** Buchstaben (inkl. Umlaute), Ziffern, Bindestrich, Punkt, Unterstrich. */
const CODE_ALLOWED = /^[a-z0-9äöüß._-]+$/;

/**
 * Normalisierung — identisch beim Speichern und beim Prüfen.
 *
 * Nur zwei Schritte: Rand-Leerzeichen weg, Kleinschreibung. Bewusst NICHT
 * mehr: Bindestriche oder Punkte zu entfernen würde "charlotte-max" und
 * "charlottemax" gleichsetzen, also zwei vom Paar unterschiedlich gemeinte
 * Codes stillschweigend verschmelzen.
 */
export function normalizeCode(raw: string): string {
  return (raw ?? '').trim().toLowerCase();
}

export interface CodeValidation {
  ok: boolean;
  /** Fehlertext für das Dashboard (das Paar), nicht für Gäste. */
  error?: string;
}

/**
 * Regeln für das Paar beim Anlegen. Absichtlich milde: das ist ein
 * Gäste-Code, kein Banking-Passwort.
 */
export function validateCode(raw: string): CodeValidation {
  const code = normalizeCode(raw);

  if (code.length === 0) return { ok: false, error: 'Bitte gebt einen Einladungscode ein.' };
  if (code.length < CODE_MIN_LENGTH) {
    return { ok: false, error: `Der Code braucht mindestens ${CODE_MIN_LENGTH} Zeichen.` };
  }
  if (code.length > CODE_MAX_LENGTH) {
    return { ok: false, error: `Der Code darf höchstens ${CODE_MAX_LENGTH} Zeichen haben.` };
  }
  if (!CODE_ALLOWED.test(code)) {
    return {
      ok: false,
      error: 'Erlaubt sind Buchstaben, Zahlen, Bindestrich, Punkt und Unterstrich.',
    };
  }
  return { ok: true };
}

/**
 * Vorschlag für „Code generieren" im Dashboard: gut lesbar, gut abschreibbar,
 * ohne verwechselbare Zeichen (kein O/0, kein I/l/1).
 */
const GEN_WORDS = ['JA', 'WIR', 'FEST', 'TANZ', 'HERZ', 'GLUECK', 'LIEBE', 'SEKT'];
const GEN_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateCode(seedYear?: number): string {
  const word = GEN_WORDS[Math.floor(Math.random() * GEN_WORDS.length)];
  const year = seedYear ?? new Date().getFullYear() + 1;
  let tail = '';
  for (let i = 0; i < 2; i += 1) {
    tail += GEN_CHARS[Math.floor(Math.random() * GEN_CHARS.length)];
  }
  return `${word}-${year}-${tail}`;
}

export async function hashCode(raw: string): Promise<string> {
  return bcrypt.hash(normalizeCode(raw), BCRYPT_COST);
}

export async function verifyCode(raw: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(normalizeCode(raw), hash);
  } catch {
    return false;
  }
}
