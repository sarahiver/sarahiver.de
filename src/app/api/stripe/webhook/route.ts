import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { provisionSite } from '@/lib/provision';
import { tierForCount, type Tier } from '@/lib/funnel';

/**
 * Stripe-Webhook — server-only, Service-Role.
 *
 * Stripe-Endpoint: https://<app>/api/stripe/webhook
 * Events: checkout.session.completed, invoice.paid, invoice.payment_failed,
 *         customer.subscription.updated, customer.subscription.deleted
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
    .insert({ id: event.id, type: event.type, payload: event as unknown as Record<string, unknown> } as never);
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
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(stripe, session);
        break;
      }
      case 'invoice.paid': {
        const inv = event.data.object as Stripe.Invoice;
        const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id;
        const periodEnd = inv.lines?.data?.[0]?.period?.end ?? null;
        await updateBySubscription(admin, subId, {
          subscription_status: 'active',
          ...(periodEnd ? { current_period_end: new Date(periodEnd * 1000).toISOString() } : {}),
        });
        break;
      }
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id;
        await updateBySubscription(admin, subId, { subscription_status: 'past_due' });
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await updateBySubscription(admin, sub.id, {
          subscription_status: sub.status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        });
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

async function handleCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  const m = (session.metadata || {}) as Record<string, string>;
  const email = session.customer_email || session.customer_details?.email || '';
  if (!email || !m.slug) {
    console.error('[webhook] checkout.completed ohne email/slug', session.id);
    return;
  }

  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? null;

  let status: string | null = null;
  let periodEnd: string | null = null;
  if (subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    status = sub.status;
    periodEnd = new Date(sub.current_period_end * 1000).toISOString();
  }

  const addons = (m.addons || '').split(',').map((s) => s.trim()).filter(Boolean);
  const tier: Tier = (m.tier as Tier) || tierForCount(addons.length);

  const res = await provisionSite({
    email,
    slug: m.slug,
    name1: m.name1 || '',
    name2: m.name2 || '',
    weddingDate: m.wedding_date || '',
    style: m.style || 'editorial',
    tier,
    addons,
    domain: m.domain === '1',
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    subscriptionStatus: status,
    currentPeriodEnd: periodEnd,
  });

  if (!res.ok) console.error('[webhook] provisioning failed:', res.error, session.id);
}

type AdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

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
