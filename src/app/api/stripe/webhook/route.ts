import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { provisionSite } from '@/lib/provision';
import { sendAdminAlert } from '@/lib/admin-alert';
import { sendContractConfirmation } from '@/lib/contract-mail';

/**
 * Stripe-Webhook — server-only, Service-Role.
 *
 * Stripe-Endpoint: https://<app>/api/stripe/webhook
 *
 * Events seit der Umstellung auf Einmalzahlung:
 *   checkout.session.completed          → provisionieren (mode: 'payment')
 *   checkout.session.async_payment_succeeded → dito, für verzögerte Zahlarten
 *   checkout.session.async_payment_failed    → nur loggen (nichts provisioniert)
 *   charge.refunded                     → Zugriff entziehen
 *
 * Alt-Sites aus der Abo-Zeit werden weiter bedient (customer.subscription.*,
 * invoice.*), damit bestehende Seiten nicht plötzlich offline gehen. Sobald
 * keine aktiven Abos mehr existieren, kann dieser Block raus.
 *
 * Idempotenz: jede event.id wird via Tabelle `stripe_events` nur einmal
 * verarbeitet (Stripe stellt teils mehrfach zu).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    console.error('[webhook] Stripe oder STRIPE_WEBHOOK_SECRET fehlt');
    return NextResponse.json({ error: 'not configured' }, { status: 500 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'no signature' }, { status: 400 });

  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error('[webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: 'admin unavailable' }, { status: 500 });

  // --- Idempotenz: event nur einmal verarbeiten ---
  const insertEvent = await admin
    .from('stripe_events')
    .insert({
      id: event.id,
      type: event.type,
      payload: event as unknown as Record<string, unknown>,
    } as never);

  if (insertEvent.error) {
    // Primary-Key-Konflikt ⇒ schon verarbeitet ⇒ ok, 200 zurück
    if (insertEvent.error.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error('[webhook] event log insert failed:', insertEvent.error);
    // trotzdem weiter — lieber verarbeiten als verlieren
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(admin, session);
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.error('[webhook] async payment failed for session', session.id, session.metadata?.slug);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const pi =
          typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent?.id ?? null;
        if (pi) {
          const { error } = await admin
            .from('wedding_sites')
            .update({ purchase_status: 'refunded' } as never)
            .eq('stripe_payment_intent_id', pi);
          if (error) console.error('[webhook] refund update failed:', error);
        }
        break;
      }

      // --- Alt-Sites aus der Abo-Zeit ------------------------------------
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        const subId =
          typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id;
        await updateBySubscription(admin, subId, { subscription_status: 'past_due' });
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await updateBySubscription(admin, sub.id, { subscription_status: sub.status });
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await updateBySubscription(admin, sub.id, { subscription_status: 'canceled' });
        break;
      }

      default:
        // andere Events ignorieren
        break;
    }
  } catch (err) {
    console.error('[webhook] handler error:', event.type, err);
    // 500 ⇒ Stripe versucht erneut (Idempotenz schützt vor Doppelarbeit)
    return NextResponse.json({ error: 'handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

type AdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

async function handleCheckoutCompleted(admin: AdminClient, session: Stripe.Checkout.Session) {
  // Abo-Checkouts gibt es nicht mehr — aber ein Alt-Event darf nicht in den
  // Einmalzahlungs-Pfad laufen.
  if (session.mode !== 'payment') {
    console.warn('[webhook] checkout.completed in mode', session.mode, '— ignoriert', session.id);
    return;
  }

  // Bei verzögerten Zahlarten ist die Session zwar completed, das Geld aber
  // noch nicht da. Dann kommt später async_payment_succeeded.
  if (session.payment_status === 'unpaid') {
    console.log('[webhook] session completed, payment pending —', session.id);
    return;
  }

  const m = (session.metadata || {}) as Record<string, string>;
  const email = session.customer_email || session.customer_details?.email || '';
  if (!email || !m.slug) {
    await sendAdminAlert({
      title: 'Bezahlter Checkout ohne E-Mail oder Slug',
      fields: { 'Stripe-Session': session.id, 'Kunden-E-Mail': email || null, Slug: m.slug || null },
    });
    return;
  }

  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const paidAt = new Date((session.created || Math.floor(Date.now() / 1000)) * 1000).toISOString();

  const res = await provisionSite({
    email,
    slug: m.slug,
    name1: m.name1 || '',
    name2: m.name2 || '',
    weddingDate: m.wedding_date || '',
    style: m.style || 'editorial',
    domain: m.domain === '1',
    domainWish: m.domain_wish || null,
    stripeCustomerId: customerId,
    stripePaymentIntentId: paymentIntentId,
    stripeCheckoutSessionId: session.id,
    paidAt,
  });

  // Zahlung ist erfolgreich — scheitert danach etwas, muss der Betreiber es
  // erfahren (kein stilles Log). Stufen: ACCOUNT/SITE → LOGIN-MAIL.
  if (!res.ok) {
    await sendAdminAlert({
      title: 'Provisionierung nach Zahlung fehlgeschlagen',
      fields: {
        Schritt: res.step,
        Fehler: res.error,
        'Stripe-Session': session.id,
        'Kunden-E-Mail': email,
        'Gewünschter Slug': m.slug,
      },
    });
    return;
  }
  // Vertragsbestätigung (dauerhafter Datenträger) — nur beim ersten Anlegen,
  // nicht bei Wiederholungen desselben Events/derselben Session.
  if (res.created) {
    const confirmed = await sendContractConfirmation({
      email,
      slug: m.slug,
      name1: m.name1 || '',
      name2: m.name2 || '',
      paidAt,
      accessUntil: res.accessUntil,
      consentAt: m.consent_at || null,
      legalVersion: m.legal_version || null,
      sessionId: session.id,
    });
    if (!confirmed) res.warnings.push('contract_confirmation');
  }

  if (res.warnings.length) {
    await sendAdminAlert({
      title: 'Seite angelegt, aber Nacharbeit nötig',
      fields: {
        Unvollständig: res.warnings.join(', '),
        'Stripe-Session': session.id,
        'Kunden-E-Mail': email,
        Slug: m.slug,
        Hinweis: [
          res.warnings.includes('login_mail')
            ? 'Login-Mail nicht zugestellt — Paar kann sich über /login per Magic Link anmelden.'
            : '',
          res.warnings.includes('contract_confirmation')
            ? 'Vertragsbestätigung NICHT zugestellt — manuell nachsenden (rechtlich erforderlich).'
            : '',
        ].filter(Boolean).join(' ') || null,
      },
    });
  }
}

async function updateBySubscription(
  admin: AdminClient,
  subscriptionId: string | null | undefined,
  patch: Record<string, unknown>,
) {
  if (!subscriptionId) return;
  const { error } = await admin
    .from('wedding_sites')
    .update(patch as never)
    .eq('stripe_subscription_id', subscriptionId);
  if (error) console.error('[webhook] update by subscription failed:', error);
}
