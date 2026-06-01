/**
 * Parser für Gästelisten-Uploads.
 *
 * Akzeptiert:
 *   - CSV mit Komma oder Semikolon getrennt, erste Zeile = Header
 *   - XLSX (Excel)
 *
 * Erwartete Spalten (case-insensitive, einer der Aliase):
 *   - Name:   "name" | "gast" | "gästename" | "gastname" | "vorname"
 *   - Email:  "email" | "e-mail" | "mail" | "emailadresse"
 *   - Gruppe: "gruppe" | "group" | "kategorie" | "kreis"  (optional)
 *
 * Ungültige Zeilen (kein Name oder Email, kein @ in der Email) werden
 * stillschweigend übersprungen.
 *
 * Returnt:
 *   - Array von { name, email, group_name } bei Erfolg
 *   - null wenn das Format ungültig ist (fehlende Pflichtspalten)
 */

export interface ParsedGuest {
  name: string;
  email: string;
  group_name: string;
}

const NAME_ALIASES = ['name', 'gast', 'gästename', 'gastname', 'vorname'];
const EMAIL_ALIASES = ['email', 'e-mail', 'mail', 'emailadresse'];
const GROUP_ALIASES = ['gruppe', 'group', 'kategorie', 'kreis'];

function findIndex(headers: string[], aliases: string[]): number {
  return headers.findIndex((h) => aliases.includes(h.trim().toLowerCase().replace(/['"]/g, '')));
}

export function parseCsv(text: string): ParsedGuest[] | null {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const sep = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

  const nameIdx = findIndex(headers, NAME_ALIASES);
  const emailIdx = findIndex(headers, EMAIL_ALIASES);
  const groupIdx = findIndex(headers, GROUP_ALIASES);

  if (nameIdx === -1 || emailIdx === -1) return null;

  const guests: ParsedGuest[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map((c) => c.trim().replace(/^["']|["']$/g, ''));
    const name = cols[nameIdx]?.trim() || '';
    const email = cols[emailIdx]?.trim() || '';
    if (name && email && email.includes('@')) {
      guests.push({
        name,
        email: email.toLowerCase(),
        group_name: groupIdx !== -1 ? cols[groupIdx]?.trim() || '' : '',
      });
    }
  }
  return guests;
}

export async function parseXlsx(buffer: ArrayBuffer): Promise<ParsedGuest[] | null> {
  // Dynamisch laden, damit das Bundle nicht aufgebläht wird.
  const XLSX = await import('xlsx');
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  if (!rows.length) return [];

  // Spaltennamen ermitteln (case-insensitive)
  const keys = Object.keys(rows[0]);
  const findCol = (aliases: string[]) =>
    keys.find((k) => aliases.includes(k.toLowerCase().trim()));

  const nameCol = findCol(NAME_ALIASES);
  const emailCol = findCol(EMAIL_ALIASES);
  const groupCol = findCol(GROUP_ALIASES);

  if (!nameCol || !emailCol) return null;

  const guests: ParsedGuest[] = [];
  for (const row of rows) {
    const name = String(row[nameCol] || '').trim();
    const email = String(row[emailCol] || '').trim();
    if (name && email && email.includes('@')) {
      guests.push({
        name,
        email: email.toLowerCase(),
        group_name: groupCol ? String(row[groupCol] || '').trim() : '',
      });
    }
  }
  return guests;
}

/** Erkennt am Dateinamen, welcher Parser greift. */
export function isXlsxFile(filename: string): boolean {
  return /\.xlsx?$/i.test(filename);
}
