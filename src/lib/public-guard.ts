import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from './supabase-admin';
import { clientFingerprint } from './rsvp-access';

/**
 * Schutz für öffentliche Schreib-Endpunkte (Gästebuch, Musik, Foto-Upload,
 * Geschenke, Kontakt, Warteliste). RSVP hat ein eigenes, strengeres Limit.
 *
 * Zwei Ebenen, beide bewusst großzügig — Gäste teilen sich oft ein WLAN:
 *
 *   1. PRO CLIENT (best effort): kleines In-Memory-Fenster je Server-Instanz,
 *      Schlüssel = gehashter Client-Fingerprint (wie beim RSVP-Gate). Bremst
 *      Skripte, die einen Endpunkt in Schleife aufrufen. Auf Serverless ist
 *      der Speicher pro Instanz — deshalb zusätzlich Ebene 2.
 *   2. PRO HOCHZEITSSEITE (verlässlich): zählt die in den letzten Minuten
 *      tatsächlich angelegten Zeilen der Zieltabelle in der Datenbank. Kein
 *      neues Schema nötig; funktioniert instanzübergreifend.
 *
 * Fällt eine Zählung aus (DB-Fehler, unbekannte Spalte), wird durchgelassen
 * und geloggt: ein defekter Zähler darf echte Gäste nie aussperren.
 */

export interface ClientLimit {
  /** Name des Endpunkts, trennt die Zähler. */
  bucket: string;
  /** Anfragen pro Fenster und Client. */
  max: number;
  windowMs: number;
}

const hits = new Map<string, number[]>();
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, list] of hits) {
    const fresh = list.filter((t) => now - t < 60 * 60_000);
    if (fresh.length) hits.set(key, fresh);
    else hits.delete(key);
  }
}

/** true = Limit erreicht. */
export function isClientLimited(headers: Headers, limit: ClientLimit): boolean {
  const now = Date.now();
  sweep(now);
  const key = `${limit.bucket}:${clientFingerprint(headers)}`;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < limit.windowMs);
  if (recent.length >= limit.max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

export interface SiteLimit {
  table: string;
  siteId: string;
  max: number;
  windowMin: number;
  /** Zeitspalte der Tabelle. */
  timeColumn?: string;
}

/** true = für diese Hochzeitsseite wurden im Fenster schon zu viele Zeilen angelegt. */
export async function isSiteFlooded(limit: SiteLimit): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  if (!admin) return false;
  const since = new Date(Date.now() - limit.windowMin * 60_000).toISOString();
  const { count, error } = await admin
    .from(limit.table)
    .select('id', { count: 'exact', head: true })
    .eq('wedding_site_id', limit.siteId)
    .gte(limit.timeColumn ?? 'created_at', since);
  if (error) {
    console.error(`[public-guard] Zählung für ${limit.table} fehlgeschlagen:`, error.message);
    return false;
  }
  return (count ?? 0) >= limit.max;
}

/** Einheitliche 429-Antwort — ohne Details zum Limit. */
export function tooManyRequests(): NextResponse {
  return NextResponse.json(
    { ok: false, error: 'Gerade kommen sehr viele Anfragen an. Bitte versucht es in ein paar Minuten noch einmal.' },
    { status: 429 },
  );
}

/**
 * Erlaubt nur Bild-URLs aus dem eigenen Cloudinary-Konto:
 *   https://res.cloudinary.com/<cloud_name>/image/upload/…
 * Keine fremden Hosts, kein http, keine data:/javascript:-URLs, keine
 * Zugangsdaten oder Ports in der URL.
 */
export function isOwnCloudinaryImageUrl(raw: unknown): boolean {
  if (typeof raw !== 'string' || raw.length > 2048) return false;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return false;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  if (url.hostname !== 'res.cloudinary.com') return false;
  if (url.username || url.password || url.port) return false;
  return url.pathname.startsWith(`/${cloudName}/image/upload/`);
}

/** Cloudinary-Public-ID: nur harmlose Zeichen, begrenzte Länge. */
export function isPlausiblePublicId(raw: unknown): boolean {
  if (raw == null || raw === '') return true;
  return typeof raw === 'string' && raw.length <= 300 && /^[A-Za-z0-9_\-./]+$/.test(raw);
}
