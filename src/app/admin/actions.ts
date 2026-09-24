'use server';

import { checkAdmin, logAdminAction } from '@/lib/admin';
import { loadAdminSite } from '@/lib/admin-data';
import { sendMagicLink } from '@/app/login/actions';
import { sendContractConfirmation } from '@/lib/contract-mail';
import { computeAccessUntil } from '@/lib/pricing';

/**
 * Admin-Aktionen. Jede prüft die Admin-Rolle selbst erneut — der Schutz des
 * Layouts reicht nicht, Server-Actions sind direkt aufrufbar.
 *
 * Bewusst nur zwei Aktionen: Login-Link und Vertragsbestätigung erneut
 * senden. Kein Bearbeiten von Kundendaten, kein „Login as User", keine
 * Zahlungs- oder Domain-Eingriffe.
 */

export interface AdminActionResult {
  ok: boolean;
  message: string;
}

export async function adminResendLoginLink(slug: string): Promise<AdminActionResult> {
  const auth = await checkAdmin();
  if (!auth.ok) return { ok: false, message: auth.error };

  const site = await loadAdminSite(slug);
  if (!site?.ownerEmail) return { ok: false, message: 'Zu dieser Seite ist keine E-Mail-Adresse hinterlegt.' };

  const res = await sendMagicLink(site.ownerEmail);
  logAdminAction('resend_login_link', auth.admin.id, slug, res.error ? 'failed' : 'sent');
  if (res.error) return { ok: false, message: res.error };
  return { ok: true, message: 'Login-Link wurde erneut verschickt.' };
}

export async function adminResendContractMail(slug: string): Promise<AdminActionResult> {
  const auth = await checkAdmin();
  if (!auth.ok) return { ok: false, message: auth.error };

  const site = await loadAdminSite(slug);
  if (!site?.ownerEmail) return { ok: false, message: 'Zu dieser Seite ist keine E-Mail-Adresse hinterlegt.' };
  if (site.purchaseStatus !== 'paid') return { ok: false, message: 'Nur für bezahlte Seiten möglich.' };

  const [name1, name2] = site.couple.split(' & ');
  const paidAt = site.paidAt ?? site.createdAt ?? new Date().toISOString();
  const accessUntil =
    site.accessUntil ?? computeAccessUntil(new Date(paidAt), site.weddingDate ?? undefined).toISOString();

  const sent = await sendContractConfirmation({
    email: site.ownerEmail,
    slug: site.slug,
    name1: name1 ?? '',
    name2: name2 ?? '',
    paidAt,
    accessUntil,
    // Der Zeitpunkt der Zustimmung liegt in der Stripe-Session, nicht in der DB.
    consentAt: null,
    legalVersion: null,
    sessionId: site.stripeSessionId ?? '—',
  });
  logAdminAction('resend_contract_mail', auth.admin.id, slug, sent ? 'sent' : 'failed');
  return sent
    ? { ok: true, message: 'Vertragsbestätigung wurde erneut verschickt.' }
    : { ok: false, message: 'Versand fehlgeschlagen — Server-Log prüfen.' };
}
