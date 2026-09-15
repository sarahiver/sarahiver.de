/**
 * Zugriff auf eine Hochzeitsseite — Laufzeit statt Abo.
 *
 * Löst lib/subscription.ts ab. Zwei Aufgaben:
 *   (a) öffentliches Gating: wird die Seite für Gäste noch ausgeliefert?
 *   (b) Banner-Sicht im Dashboard: wie lange läuft die Seite noch?
 *
 * Alt-Sites (Abo-Zeit, purchase_status = NULL) laufen weiter über den alten
 * Stripe-Status — sonst würden bestehende Seiten beim Deploy offline gehen.
 */

import { createSupabaseAdminClient } from './supabase-admin';
import { daysUntil, formatDateDe } from './pricing';

/** Alte Abo-Status, bei denen die öffentliche Seite gesperrt war. */
const LEGACY_BLOCKING_STATUSES = ['canceled', 'unpaid', 'incomplete_expired'] as const;

export type AccessBlockReason = 'none' | 'expired' | 'refunded' | 'legacy_subscription';

export interface SiteAccess {
  blocked: boolean;
  reason: AccessBlockReason;
  /** ISO-Zeitpunkt, bis zu dem die Seite online ist (null bei Alt-Sites). */
  accessUntil: string | null;
}

const OPEN: SiteAccess = { blocked: false, reason: 'none', accessUntil: null };

/**
 * Lädt den Zugriffsstatus server-seitig (Admin-Client, RLS-unabhängig).
 *
 * Fail-open: findet die Site nicht statt oder schlägt die Query fehl,
 * bleibt die Seite sichtbar — eine Hochzeitsseite wegen eines DB-Fehlers
 * offline zu nehmen wäre der schlechtere Fehler.
 */
export async function loadSiteAccess(slug: string): Promise<SiteAccess> {
  const admin = createSupabaseAdminClient();
  if (!admin) return OPEN;

  const { data, error } = await admin
    .from('wedding_sites')
    .select('purchase_status, access_until, subscription_status')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) return OPEN;

  const row = data as {
    purchase_status: string | null;
    access_until: string | null;
    subscription_status: string | null;
  };

  // --- Alt-Site aus der Abo-Zeit ---
  if (!row.purchase_status) {
    const blocked =
      !!row.subscription_status &&
      (LEGACY_BLOCKING_STATUSES as readonly string[]).includes(row.subscription_status);
    return {
      blocked,
      reason: blocked ? 'legacy_subscription' : 'none',
      accessUntil: null,
    };
  }

  // --- Einmalzahlung ---
  if (row.purchase_status === 'refunded') {
    return { blocked: true, reason: 'refunded', accessUntil: row.access_until };
  }

  if (row.access_until) {
    const end = new Date(row.access_until).getTime();
    if (Number.isFinite(end) && end < Date.now()) {
      return { blocked: true, reason: 'expired', accessUntil: row.access_until };
    }
  }

  return { blocked: false, reason: 'none', accessUntil: row.access_until };
}

// ---------------------------------------------------------------------------
// Banner-Sicht fürs Dashboard
// ---------------------------------------------------------------------------

export type AccessViewKind = 'none' | 'info' | 'expiring' | 'expired';

export interface AccessView {
  kind: AccessViewKind;
  daysLeft?: number;
  dateLabel?: string;
}

/** Ab hier wird aus dem stillen Hinweis eine Warnung. */
export const EXPIRY_WARNING_DAYS = 60;

/**
 * Leitet die Banner-Sicht aus dem Laufzeitende ab.
 *   none     — kein Datum hinterlegt (Alt-Site)
 *   info     — läuft noch lange, dezenter Hinweis
 *   expiring — weniger als 60 Tage
 *   expired  — vorbei, Seite ist für Gäste offline
 */
export function describeAccess(accessUntil: string | null | undefined): AccessView {
  if (!accessUntil) return { kind: 'none' };

  const days = daysUntil(accessUntil);
  if (!Number.isFinite(days)) return { kind: 'none' };

  const dateLabel = formatDateDe(accessUntil);
  const end = new Date(accessUntil).getTime();

  if (end < Date.now()) return { kind: 'expired', daysLeft: 0, dateLabel };
  if (days <= EXPIRY_WARNING_DAYS) return { kind: 'expiring', daysLeft: days, dateLabel };
  return { kind: 'info', daysLeft: days, dateLabel };
}
