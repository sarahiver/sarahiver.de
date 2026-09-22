import { createSupabaseAdminClient } from './supabase-admin';
import { ALL_BEREICH_KEYS } from './funnel';
import { computeAccessUntil } from './pricing';
import { hasReservedSlugPrefix } from './slug-validation';

/**
 * Provisioning — vom Stripe-Webhook aufgerufen, nachdem die Einmalzahlung
 * durch ist. Legt Account + Hochzeitsseite + alle Bereiche + Käufe an,
 * setzt das Laufzeitende und mailt dem Paar den Login-Link.
 *
 * Seit Sept. 2026 gibt es keine Pakete mehr: jede bezahlte Seite bekommt
 * alle 15 Bereiche freigeschaltet.
 *
 * Idempotent über den Slug: existiert die Site schon, werden nur die
 * Billing-Felder aktualisiert (kein doppeltes Anlegen).
 *
 * Schreibt ausschließlich mit dem Service-Role-Client (server-only).
 */

export interface ProvisionInput {
  email: string;
  slug: string;
  name1: string;
  name2: string;
  weddingDate: string; // YYYY-MM-DD
  style: string;
  /** Kunde möchte eine eigene Domain (39 € Add-on). */
  domain: boolean;
  /** Wunschdomain aus dem Domain-Check auf der Landing, z. B. "leaundben.de". */
  domainWish: string | null;
  stripeCustomerId: string | null;
  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string | null;
  /** Zeitpunkt der Zahlung (ISO). Basis für die Laufzeit. */
  paidAt: string;
}

/**
 * Ergebnis der Provisionierung. Getrennt nach Stufen:
 *   PAYMENT (Stripe, vorher erledigt) → ACCOUNT/SITE → LOGIN-MAIL.
 * Scheitert ACCOUNT/SITE, ist `ok: false` mit dem Schritt. Scheitern nur
 * Nacharbeiten (Bereiche, Käufe, Login-Mail), existiert die bezahlte Seite —
 * dann `ok: true` mit `warnings`, damit der Webhook einen Alert schicken kann.
 */
export type ProvisionStep =
  | 'admin_client'
  | 'reserved_slug'
  | 'user'
  | 'slug_conflict'
  | 'style'
  | 'site';

export type ProvisionResult =
  | { ok: true; siteId: string; userId: string; warnings: string[]; created: boolean; accessUntil: string }
  | { ok: false; step: ProvisionStep; error: string };

export async function provisionSite(input: ProvisionInput): Promise<ProvisionResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, step: 'admin_client', error: 'admin client unavailable' };

  // Letzte Absicherung: reservierte Präfixe (z. B. demo- für die Sandbox, die
  // per Cron gelöscht wird) dürfen nie an zahlende Kunden gehen.
  if (hasReservedSlugPrefix(input.slug)) {
    return { ok: false, step: 'reserved_slug', error: 'slug uses reserved prefix' };
  }

  const nextPath = `/dashboard/${input.slug}`;

  // --- 1) Account sicherstellen -------------------------------------------
  let userId: string | null = null;

  const created = await admin.auth.admin.createUser({
    email: input.email,
    email_confirm: true, // bestätigt; Login via Magic-Link/Passwort
  });

  if (created.data?.user) {
    userId = created.data.user.id;
  } else {
    // Vermutlich existiert die E-Mail schon → ID über generateLink auflösen
    const link = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: input.email,
    });
    if (link.data?.user) userId = link.data.user.id;
  }

  if (!userId) {
    console.error('[provision] could not create/resolve user for', input.email, created.error);
    return { ok: false, step: 'user', error: 'user provisioning failed' };
  }

  // --- 2) Site idempotent anlegen / Billing aktualisieren -----------------
  const paidAt = new Date(input.paidAt);
  const accessUntil = computeAccessUntil(
    Number.isNaN(paidAt.getTime()) ? new Date() : paidAt,
    input.weddingDate,
  );

  const billing = {
    owner_user_id: userId,
    // RLS-Policies auf wedding_bereiche/-sites prüfen teils user_id (Alt-Spalte),
    // teils owner_user_id. Beide auf denselben Auth-User setzen, damit der Owner
    // seine (auch unveröffentlichten) Bereiche lesen/bearbeiten darf.
    user_id: userId,
    stripe_customer_id: input.stripeCustomerId,
    stripe_payment_intent_id: input.stripePaymentIntentId,
    stripe_checkout_session_id: input.stripeCheckoutSessionId,
    purchase_status: 'paid',
    paid_at: Number.isNaN(paidAt.getTime()) ? new Date().toISOString() : paidAt.toISOString(),
    access_until: accessUntil.toISOString(),
    custom_domain_status: input.domain ? 'pending' : 'none',
    custom_domain: input.domainWish,
  };

  const { data: existing } = await admin
    .from('wedding_sites')
    .select('id, stripe_checkout_session_id')
    .eq('slug', input.slug)
    .maybeSingle();

  let siteId: string;

  if (existing) {
    const ex = existing as { id: string; stripe_checkout_session_id: string | null };
    // Nur eine Wiederholung DERSELBEN Zahlung darf die Site erneut anfassen.
    // Früher wurde jede bestehende Site mit diesem Slug übernommen — bei einem
    // Slug-Race hätte ein zweiter Käufer die fremde Seite (inkl. Eigentümer)
    // überschrieben.
    if (!input.stripeCheckoutSessionId || ex.stripe_checkout_session_id !== input.stripeCheckoutSessionId) {
      console.error('[provision] slug conflict — slug belongs to another site', input.slug);
      return { ok: false, step: 'slug_conflict', error: 'slug already taken by another site' };
    }
    siteId = ex.id;
    await admin.from('wedding_sites').update(billing as never).eq('id', siteId);
    // Bereiche/Käufe nicht erneut anlegen (Unique-Index schützt zusätzlich).
    const mailed = await sendLoginMail(admin, input.email, nextPath);
    return { ok: true, siteId, userId, warnings: mailed ? [] : ['login_mail'], created: false, accessUntil: accessUntil.toISOString() };
  }

  // --- 2a) Default-Palette + -Font des gewählten Stils auflösen -----------
  // DB-Constraint "palette_source_check" verlangt: ENTWEDER palette_preset_id
  // NOT NULL + alle Custom NULL — ODER palette_preset_id NULL + alle 5 Custom
  // gefüllt. Beim Anlegen gehen wir in den Preset-Modus mit der Default-Palette
  // des Stils; alle palette_custom_* bleiben NULL. font_preset_id wird ebenfalls
  // aus dem Stil-Default gesetzt (Spalte ist NOT NULL).
  const { data: styleRow, error: styleErr } = await admin
    .from('start_styles')
    .select('default_palette_id, default_font_id')
    .eq('id', input.style)
    .maybeSingle();

  if (styleErr || !styleRow) {
    console.error('[provision] start_styles lookup failed for style', input.style, styleErr);
    return { ok: false, step: 'style', error: 'style preset lookup failed' };
  }

  const { default_palette_id, default_font_id } = styleRow as {
    default_palette_id: string;
    default_font_id: string;
  };

  const { data: site, error: siteErr } = await admin
    .from('wedding_sites')
    .insert({
      slug: input.slug,
      couple_name_1: input.name1,
      couple_name_2: input.name2,
      wedding_date: input.weddingDate,
      start_style_id: input.style,
      palette_preset_id: default_palette_id, // Preset-Modus (Custom bleibt NULL)
      font_preset_id: default_font_id,
      status: 'draft',
      ...billing,
    } as never)
    .select('id')
    .single();

  if (siteErr || !site) {
    console.error('[provision] site insert failed:', siteErr);
    // Unique-Verletzung: nur der Slug-Constraint ist ein Slug-Race (Production
    // hat UNIQUE (slug) als wedding_sites_slug_key). Andere Unique-Indizes auf
    // wedding_sites (z. B. stripe_customer_id) sind echte Anlagefehler.
    const e = siteErr as { code?: string; message?: string; details?: string } | null;
    if (e?.code === '23505') {
      const text = `${e.message ?? ''} ${e.details ?? ''}`;
      if (text.includes('wedding_sites_slug_key') || text.includes('(slug)')) {
        return { ok: false, step: 'slug_conflict', error: 'slug already taken (unique violation)' };
      }
      return { ok: false, step: 'site', error: `unique violation: ${e.message ?? 'unknown'}` };
    }
    return { ok: false, step: 'site', error: 'site insert failed' };
  }
  siteId = (site as { id: string }).id;

  // --- 3) Bereiche anlegen (alle 15 — im Preis enthalten) ----------------
  const allKeys = [...ALL_BEREICH_KEYS];

  const bereicheRows = allKeys.map((key, index) => ({
    wedding_site_id: siteId,
    bereich_key: key,
    variant: 'a',
    display_order: index,
    is_active: true,
    content: {},
    content_draft: {},
    content_published: {},
  }));

  const warnings: string[] = [];
  const { error: bErr } = await admin.from('wedding_bereiche').insert(bereicheRows as never);
  if (bErr) {
    console.error('[provision] bereiche insert failed:', bErr);
    warnings.push('bereiche');
  }

  // --- 4) Käufe freischalten (Gating in tokens.ts greift hierauf) ---------
  // Alle Bereiche, weil es keine Pakete mehr gibt.
  const purchaseRows = allKeys.map((key) => ({
    wedding_site_id: siteId,
    bereich_key: key,
  }));
  const { error: pErr } = await admin.from('wedding_purchases').insert(purchaseRows as never);
  if (pErr) {
    console.error('[provision] purchases insert failed:', pErr);
    warnings.push('purchases');
  }

  // --- 5) Login-Mail senden -----------------------------------------------
  // Eine gescheiterte Mail macht die bezahlte Seite nicht ungültig: Das Paar
  // kann sich jederzeit über /login per Magic Link anmelden. Nur Warnung.
  const mailed = await sendLoginMail(admin, input.email, nextPath);
  if (!mailed) warnings.push('login_mail');

  return { ok: true, siteId, userId, warnings, created: true, accessUntil: accessUntil.toISOString() };
}

type AdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

/**
 * Schickt dem Paar den Magic-Link zum ersten Login.
 *
 * Robust gegen Supabase-SMTP-Ausfälle UND localhost-/Fragment-Bug: Wir erzeugen
 * den Token über `generateLink` (löst KEINEN SMTP-Versand aus), bauen daraus
 * einen Link auf UNSERE App-Domain (/auth/confirm?token_hash=…) und stellen die
 * Mail über die Brevo-Transactional-API zu. Kein action_link → kein #-Fragment,
 * kein Site-URL-Fallback auf localhost.
 *
 * Env: BREVO_API_KEY, BREVO_SENDER_EMAIL (verifiziert), BREVO_SENDER_NAME (opt.).
 * Wirft nie — liefert false bei Fehler (wird geloggt), der Webhook bleibt 200.
 */
async function sendLoginMail(admin: AdminClient, email: string, nextPath: string): Promise<boolean> {
  try {
    // 1) Token erzeugen (kein Mailversand durch Supabase)
    const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
    if (error || !data?.properties?.hashed_token) {
      console.error('[provision] generateLink failed:', error);
      return false;
    }

    // 2) Link auf unsere /auth/confirm-Route bauen
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarahiver.de';
    const u = new URL(`${appUrl}/auth/confirm`);
    u.searchParams.set('token_hash', data.properties.hashed_token);
    u.searchParams.set('type', data.properties.verification_type);
    u.searchParams.set('next', nextPath);
    const link = u.toString();

    // 3) Mail über Brevo-Transactional-API zustellen
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'hallo@sarahiver.de';
    const senderName = process.env.BREVO_SENDER_NAME || 'S&I. Wedding';
    if (!apiKey) {
      console.error('[provision] BREVO_API_KEY fehlt — Login-Mail nicht gesendet');
      return false;
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email }],
        subject: 'Euer Login-Link für eure Hochzeitsseite',
        htmlContent: loginMailHtml(link),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[provision] Brevo send failed:', res.status, detail);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[provision] login mail threw:', err);
    return false;
  }
}

/** Schlichtes, markenkonformes HTML für die Login-Mail. */
function loginMailHtml(link: string): string {
  return `<!DOCTYPE html>
<html lang="de">
  <body style="margin:0;background:#F7F5F1;font-family:Inter,Helvetica,Arial,sans-serif;color:#0F0E0C;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F1;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:16px;padding:40px;">
            <tr>
              <td style="font-family:Georgia,serif;font-size:24px;font-weight:600;padding-bottom:8px;">
                Eure Hochzeitsseite ist startklar
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:1.6;color:#5f5b53;padding-bottom:28px;">
                Hallo ihr beiden, schön, dass ihr dabei seid. Über den Button kommt ihr
                direkt in euer Dashboard und könnt loslegen.
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:28px;">
                <a href="${link}" style="display:inline-block;background:#0F0E0C;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;">
                  Zum Dashboard
                </a>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;line-height:1.6;color:#a39d92;">
                Der Link ist nur für kurze Zeit gültig. Falls ihr ihn nicht angefordert
                habt, könnt ihr diese E-Mail einfach ignorieren.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
