/**
 * Subscription-Helfer — eine Quelle für (a) das öffentliche Gating und (b) die
 * Banner-Anzeige im Dashboard. Liest den Stripe-Status, den der Webhook in
 * wedding_sites pflegt (subscription_status / current_period_end).
 *
 * Status-Werte von Stripe: trialing, active, past_due, canceled, unpaid,
 * incomplete, incomplete_expired, paused.
 */

import { createSupabaseAdminClient } from './supabase-admin';

/**
 * Status, bei denen die öffentliche Hochzeitsseite NICHT mehr ausgeliefert wird.
 *
 * Bewusst NICHT dabei: `past_due`. Eine geplatzte Karte ist temporär — Stripe
 * versucht es über Tage erneut (Smart Retries). Eine Hochzeitsseite in genau
 * diesem Fenster offline zu nehmen (Gäste evtl. mitten in der Feier) wäre der
 * falsche Reflex. Erst wenn Stripe endgültig aufgibt (→ canceled/unpaid), wird
 * gesperrt.
 */
export const PUBLIC_BLOCKING_STATUSES = ['canceled', 'unpaid', 'incomplete_expired'] as const;

export function isPublicallyBlocked(status: string | null | undefined): boolean {
  if (!status) return false; // Alt-Sites ohne Status bleiben sichtbar
  return (PUBLIC_BLOCKING_STATUSES as readonly string[]).includes(status);
}

export interface SiteAccess {
  blocked: boolean;
  status: string | null;
}

/**
 * Lädt den Abo-Status einer Site server-seitig (Admin-Client, RLS-unabhängig)
 * für das öffentliche Gating. Liefert blocked=false, wenn die Site nicht
 * gefunden wird — die Sichtbarkeit entscheidet dann wie bisher der Loader.
 */
export async function loadSiteAccess(slug: string): Promise<SiteAccess> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { blocked: false, status: null };

  const { data, error } = await admin
    .from('wedding_sites')
    .select('subscription_status')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) return { blocked: false, status: null };

  const status = (data as { subscription_status: string | null }).subscription_status;
  return { blocked: isPublicallyBlocked(status), status };
}

// ---------------------------------------------------------------------------
// Banner-Sicht fürs Dashboard
// ---------------------------------------------------------------------------

export type SubscriptionViewKind = 'trial' | 'past_due' | 'canceled' | 'none';

export interface SubscriptionView {
  kind: SubscriptionViewKind;
  /** Nur bei kind='trial': volle Tage bis zum Trial-Ende (>= 0). */
  daysLeft?: number;
  /** Menschlich formatiertes Trial-Ende (de-DE), falls vorhanden. */
  endDateLabel?: string;
}

/** Volle Resttage bis zu einem ISO-Zeitpunkt (aufgerundet auf Kalendertage). */
function daysUntil(iso: string): number {
  const end = new Date(iso).getTime();
  if (!Number.isFinite(end)) return NaN;
  return Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)));
}

function formatDateDe(iso: string): string {
  try {
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

/**
 * Leitet aus Status + Period-End die Banner-Sicht ab. `none` heißt: kein Banner
 * zeigen (active, oder Alt-Site ohne Billing-Daten).
 */
export function describeSubscription(
  status: string | null | undefined,
  currentPeriodEnd: string | null | undefined,
): SubscriptionView {
  if (status === 'trialing') {
    const view: SubscriptionView = { kind: 'trial' };
    if (currentPeriodEnd) {
      const d = daysUntil(currentPeriodEnd);
      if (Number.isFinite(d)) view.daysLeft = d;
      view.endDateLabel = formatDateDe(currentPeriodEnd);
    }
    return view;
  }
  if (status === 'past_due' || status === 'unpaid') return { kind: 'past_due' };
  if (status === 'canceled' || status === 'incomplete_expired') return { kind: 'canceled' };
  return { kind: 'none' };
}
