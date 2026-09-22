import { sendBrevoMail } from './brevo';

/**
 * Kompakte Alarm-Mail an den Betreiber, wenn nach einer ERFOLGREICHEN
 * Zahlung etwas schiefgeht (Provisionierung, Slug-Konflikt, Login-Mail).
 *
 * Env: ADMIN_ALERT_EMAIL (serverseitig). Fehlt sie oder scheitert der
 * Versand, wird laut geloggt — der Aufrufer (Webhook) bleibt davon unberührt.
 *
 * Inhalt bewusst knapp: Referenzen und der gescheiterte Schritt. Keine
 * Secrets, keine Zahlungsdaten, keine kompletten Stripe-Payloads.
 */
export interface AdminAlert {
  title: string;
  fields: Record<string, string | null | undefined>;
}

function esc(v: string): string {
  return v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

export async function sendAdminAlert(alert: AdminAlert): Promise<void> {
  const to = process.env.ADMIN_ALERT_EMAIL;
  const lines = Object.entries(alert.fields)
    .map(([k, v]) => `${k}: ${v ?? '—'}`)
    .join(' | ');

  // Immer loggen — auch wenn die Mail klappt, bleibt die Spur im Server-Log.
  console.error(`[admin-alert] ${alert.title} — ${lines}`);

  if (!to) {
    console.error('[admin-alert] ADMIN_ALERT_EMAIL fehlt — Alarm nur im Log.');
    return;
  }

  const rows = Object.entries(alert.fields)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td style="padding:4px 0"><b>${esc(v ?? '—')}</b></td></tr>`)
    .join('');

  try {
    const ok = await sendBrevoMail({
      to,
      subject: `[sarahiver] ${alert.title}`,
      htmlContent: `<div style="font-family:system-ui,sans-serif;font-size:14px"><p><b>${esc(alert.title)}</b></p><table>${rows}</table></div>`,
    });
    if (!ok) console.error('[admin-alert] Versand fehlgeschlagen.');
  } catch (err) {
    console.error('[admin-alert] Versand hat geworfen:', err);
  }
}
