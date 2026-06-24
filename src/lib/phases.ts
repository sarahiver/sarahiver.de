/**
 * Seiten-Phasen — der Lebenszyklus einer Hochzeitsseite unter demselben Slug.
 *
 *   Save-the-Date (davor) → Hauptseite (drumherum) → Archiv (danach)
 *
 * Die öffentliche Seite berechnet die Phase bei jedem Aufruf aus Schaltern +
 * Daten — KEIN Cron nötig, der Wechsel passiert automatisch, wenn ein Datum
 * überschritten wird. (Nur die Archiv-Gästemail braucht später einen Trigger.)
 *
 * Kaskade (Archiv hat Vorrang, dann STD, sonst Hauptseite):
 *   archivAktiv = archiv_enabled && (archiv_from leer || jetzt >= archiv_from)
 *   stdAktiv    = std_enabled    && (std_until  leer || jetzt <  std_until)
 *
 * Beide Phasen unterstützen damit „manuell an" (Schalter an, kein Datum) UND
 * „automatisch ab/bis Datum" (Schalter an + Datum gesetzt).
 */

import { createSupabaseAdminClient } from './supabase-admin';
import type { WeddingBereich, BereichKey, Variant } from '@/types/supabase';

export type SitePhase = 'std' | 'main' | 'archiv';

export interface PhaseConfig {
  std_enabled: boolean;
  std_until: string | null;
  std_variant: Variant;
  archiv_enabled: boolean;
  archiv_from: string | null;
  archiv_message: string | null;
}

export const DEFAULT_PHASE_CONFIG: PhaseConfig = {
  std_enabled: false,
  std_until: null,
  std_variant: 'a',
  archiv_enabled: false,
  archiv_from: null,
  archiv_message: null,
};

/** Welche Bereiche eine Phase zeigt. */
export const STD_KEYS: BereichKey[] = ['hero', 'countdown'];
export const ARCHIV_KEYS: BereichKey[] = ['hero', 'photoupload'];

function ts(v: string | null): number | null {
  if (!v) return null;
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : null;
}

export function resolvePhase(cfg: PhaseConfig, now: number = Date.now()): SitePhase {
  const archivFrom = ts(cfg.archiv_from);
  const archivActive = cfg.archiv_enabled && (archivFrom === null || now >= archivFrom);
  if (archivActive) return 'archiv';

  const stdUntil = ts(cfg.std_until);
  const stdActive = cfg.std_enabled && (stdUntil === null || now < stdUntil);
  if (stdActive) return 'std';

  return 'main';
}

export interface SitePhaseResult {
  siteId: string;
  phase: SitePhase;
  config: PhaseConfig;
}

/** Lädt Phasen-Config + aufgelöste Phase für den öffentlichen Render (Admin-Client). */
export async function loadSitePhase(slug: string): Promise<SitePhaseResult | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from('wedding_sites')
    .select('id, std_enabled, std_until, std_variant, archiv_enabled, archiv_from, archiv_message')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) return null;
  const r = data as { id: string } & Partial<PhaseConfig>;

  const config: PhaseConfig = {
    std_enabled: r.std_enabled ?? false,
    std_until: r.std_until ?? null,
    std_variant: (r.std_variant as Variant) ?? 'a',
    archiv_enabled: r.archiv_enabled ?? false,
    archiv_from: r.archiv_from ?? null,
    archiv_message: r.archiv_message ?? null,
  };

  return { siteId: r.id, phase: resolvePhase(config), config };
}

/**
 * Lädt bestimmte Bereiche (published-Inhalte) für eine Phase — unabhängig von
 * is_active, da STD/Archiv ihre eigene Bereich-Auswahl haben. Liefert sie in
 * der Reihenfolge der übergebenen Keys, als BereichRenderer-taugliche Objekte.
 */
export async function loadPhaseBereiche(siteId: string, keys: BereichKey[]): Promise<WeddingBereich[]> {
  const admin = createSupabaseAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from('wedding_bereiche')
    .select('*')
    .eq('wedding_site_id', siteId)
    .in('bereich_key', keys);

  if (error || !data) return [];

  const byKey = new Map<string, WeddingBereich>();
  for (const raw of data as WeddingBereich[]) {
    byKey.set(raw.bereich_key, {
      ...raw,
      content: (raw.content_published as Record<string, unknown>) || raw.content || {},
    } as WeddingBereich);
  }

  // In der gewünschten Reihenfolge, nur vorhandene.
  return keys.map((k) => byKey.get(k)).filter((b): b is WeddingBereich => Boolean(b));
}
