import { createSupabaseAdminClient } from './supabase-admin';
import { verifyCode } from './rsvp-code';

/**
 * Serverseitige RSVP-Schicht. NUR hier wird der Code-Hash gelesen.
 *
 * Der Hash liegt in einer eigenen Tabelle (wedding_rsvp_codes) mit RLS ohne
 * Policies. Selbst wenn ein öffentlicher Query `select('*')` auf
 * wedding_sites oder v_effective_tokens macht, kann er ihn nicht mitnehmen —
 * er steht dort schlicht nicht.
 */

export interface RsvpSiteContext {
  siteId: string;
  /** Ist der Einladungscode-Schutz aktiv? Öffentlich, steuert nur die Anzeige. */
  codeEnabled: boolean;
  /** Version des Codes = updated_at in ms. Bindet das Access-Token. */
  codeVersion: number;
  /** Ist überhaupt ein Code hinterlegt? */
  hasCode: boolean;
}

/**
 * Lädt den RSVP-Kontext einer Site. Zwei Abfragen, beide mit Service-Role:
 * die öffentliche Flagge von wedding_sites, die Version aus der geschützten
 * Tabelle.
 */
export async function loadRsvpSiteContext(slug: string): Promise<RsvpSiteContext | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data: site, error } = await admin
    .from('wedding_sites')
    .select('id, rsvp_code_enabled')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !site) return null;
  const row = site as { id: string; rsvp_code_enabled: boolean | null };

  const { data: codeRow } = await admin
    .from('wedding_rsvp_codes')
    .select('updated_at')
    .eq('wedding_site_id', row.id)
    .maybeSingle();

  const updatedAt = (codeRow as { updated_at?: string } | null)?.updated_at;

  return {
    siteId: row.id,
    codeEnabled: row.rsvp_code_enabled === true,
    codeVersion: updatedAt ? new Date(updatedAt).getTime() : 0,
    hasCode: Boolean(updatedAt),
  };
}

/** Vergleicht einen eingegebenen Code gegen den gespeicherten Hash. */
export async function checkRsvpCode(siteId: string, input: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  if (!admin) return false;

  const { data, error } = await admin
    .from('wedding_rsvp_codes')
    .select('code_hash')
    .eq('wedding_site_id', siteId)
    .maybeSingle();

  if (error || !data) return false;
  return verifyCode(input, (data as { code_hash: string }).code_hash);
}

/**
 * Status für das Dashboard. Gibt bewusst NUR zurück, was die Oberfläche
 * braucht — kein code_hash, auch nicht gekürzt oder maskiert. Damit kann der
 * Hash gar nicht erst in Props, JSON oder React-Baum landen.
 */
export interface RsvpCodeStatus {
  hasCode: boolean;
  enabled: boolean;
  updatedAt: string | null;
}

export async function loadRsvpCodeStatus(siteId: string): Promise<RsvpCodeStatus> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { hasCode: false, enabled: false, updatedAt: null };

  const [{ data: site }, { data: code }] = await Promise.all([
    admin.from('wedding_sites').select('rsvp_code_enabled').eq('id', siteId).maybeSingle(),
    admin
      .from('wedding_rsvp_codes')
      .select('updated_at')
      .eq('wedding_site_id', siteId)
      .maybeSingle(),
  ]);

  const updatedAt = (code as { updated_at?: string } | null)?.updated_at ?? null;
  return {
    hasCode: Boolean(updatedAt),
    enabled: (site as { rsvp_code_enabled?: boolean } | null)?.rsvp_code_enabled === true,
    updatedAt,
  };
}

/* ------------------------------------------------------------------ Rate Limit */

/** Höchstens so viele FEHLversuche je Site und Client im Zeitfenster. */
export const RATE_LIMIT_MAX_FAILURES = 8;
export const RATE_LIMIT_WINDOW_MIN = 15;

/**
 * Zählt nur Fehlversuche: Wer den Code kennt und ihn mehrfach eingibt (zwei
 * Geräte, neues Handy), läuft nicht ins Limit. Ein Tippfehler-Puffer von acht
 * Versuchen in 15 Minuten ist für echte Gäste großzügig und für eine
 * Brute-Force-Schleife wertlos.
 */
export async function isRateLimited(siteId: string, clientHash: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  if (!admin) return false;

  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MIN * 60_000).toISOString();

  const { count, error } = await admin
    .from('rsvp_code_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('wedding_site_id', siteId)
    .eq('client_hash', clientHash)
    .eq('succeeded', false)
    .gte('attempted_at', since);

  if (error) {
    // Im Zweifel durchlassen: ein defekter Zähler darf keine Gäste aussperren.
    console.error('[rsvp] rate limit check failed:', error);
    return false;
  }
  return (count ?? 0) >= RATE_LIMIT_MAX_FAILURES;
}

/** Protokolliert einen Versuch. Der eingegebene Code wird NIE gespeichert. */
export async function recordAttempt(
  siteId: string,
  clientHash: string,
  succeeded: boolean,
): Promise<void> {
  const admin = createSupabaseAdminClient();
  if (!admin) return;
  const { error } = await admin
    .from('rsvp_code_attempts')
    .insert({ wedding_site_id: siteId, client_hash: clientHash, succeeded } as never);
  if (error) console.error('[rsvp] attempt log failed:', error);
}

/**
 * Setzt oder ersetzt den Code einer Site. Wird in Phase 2 vom Dashboard
 * benutzt; steht hier, weil das Hash-Handling an einer Stelle bleiben soll.
 * Das Hochsetzen von updated_at ist zugleich die Invalidierung aller
 * bestehenden Access-Token.
 */
export async function setRsvpCodeHash(siteId: string, codeHash: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  if (!admin) return false;

  const { error } = await admin
    .from('wedding_rsvp_codes')
    .upsert(
      { wedding_site_id: siteId, code_hash: codeHash, updated_at: new Date().toISOString() } as never,
      { onConflict: 'wedding_site_id' },
    );

  if (error) {
    console.error('[rsvp] code upsert failed:', error);
    return false;
  }
  return true;
}

/**
 * Schaltet den Schutz um und schiebt dabei die Code-Version weiter — sonst
 * bliebe ein Token gültig, das vor dem Abschalten ausgestellt wurde.
 */
export async function setRsvpCodeEnabled(siteId: string, enabled: boolean): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  if (!admin) return false;

  const { error } = await admin
    .from('wedding_sites')
    .update({ rsvp_code_enabled: enabled } as never)
    .eq('id', siteId);

  if (error) {
    console.error('[rsvp] toggle failed:', error);
    return false;
  }

  await admin
    .from('wedding_rsvp_codes')
    .update({ updated_at: new Date().toISOString() } as never)
    .eq('wedding_site_id', siteId);

  return true;
}
