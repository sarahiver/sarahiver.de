import { sendBrevoMail } from './brevo';
import {
  OPERATOR,
  OPERATOR_LINE,
  VAT_NOTE,
  CONSENT_TEXT,
  AGB_SECTIONS,
  WIDERRUF_SECTIONS,
  WIDERRUF_FORM_LINES,
  LEGAL_VERSION,
  type LegalSection,
} from './legal';
import { formatDateDe } from './pricing';

/**
 * Vertragsbestätigung auf dauerhaftem Datenträger (E-Mail) nach der Zahlung.
 *
 * Enthält: Vertragsdaten, die im Checkout abgegebenen Erklärungen (sofortiger
 * Beginn + Kenntnis der Widerrufsfolgen) mit Zeitpunkt, die AGB und die
 * Widerrufsbelehrung samt Muster-Formular im Volltext — nicht nur als Link,
 * weil sich Webseiten ändern können. Keine Werbung.
 *
 * Versand über den bestehenden Brevo-Stack. Rückgabe false bei Fehler; der
 * Webhook meldet das dann per Admin-Alert.
 */
export interface ContractMailInput {
  email: string;
  slug: string;
  name1: string;
  name2: string;
  paidAt: string;
  accessUntil: string;
  consentAt: string | null;
  legalVersion: string | null;
  sessionId: string;
}

function esc(v: string): string {
  return v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

function sectionsHtml(sections: LegalSection[]): string {
  return sections
    .map(
      (s) =>
        `<h3 style="font-size:14px;margin:18px 0 6px">${esc(s.title)}</h3>` +
        s.paragraphs.map((p) => `<p style="margin:0 0 8px">${esc(p)}</p>`).join(''),
    )
    .join('');
}

export async function sendContractConfirmation(i: ContractMailInput): Promise<boolean> {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'sarahiver.de';
  const consentWhen = i.consentAt ? new Date(i.consentAt).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }) : '—';

  const html = `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.55;color:#2D2520;max-width:640px">
<h2 style="font-size:20px;margin:0 0 12px">Vertragsbestätigung</h2>
<p>Vielen Dank für eure Bestellung. Hiermit bestätigen wir den Vertrag über die Bereitstellung eurer Hochzeitswebsite.</p>

<h3 style="font-size:15px;margin:20px 0 6px">Vertragsdaten</h3>
<table style="border-collapse:collapse">
<tr><td style="padding:2px 14px 2px 0;color:#6b6259">Anbieter</td><td>${esc(OPERATOR_LINE)}</td></tr>
<tr><td style="padding:2px 14px 2px 0;color:#6b6259">Leistung</td><td>Hochzeitswebsite im Selbstbedienungsmodell (Dashboard + Veröffentlichung)</td></tr>
<tr><td style="padding:2px 14px 2px 0;color:#6b6259">Brautpaar</td><td>${esc(i.name1)} &amp; ${esc(i.name2)}</td></tr>
<tr><td style="padding:2px 14px 2px 0;color:#6b6259">Adresse der Website</td><td>${esc(i.slug)}.${esc(appDomain)}</td></tr>
<tr><td style="padding:2px 14px 2px 0;color:#6b6259">Preis</td><td>69 € einmalig. ${esc(VAT_NOTE)}</td></tr>
<tr><td style="padding:2px 14px 2px 0;color:#6b6259">Vertragsschluss / Zahlung</td><td>${esc(formatDateDe(i.paidAt))}</td></tr>
<tr><td style="padding:2px 14px 2px 0;color:#6b6259">Bereitstellung bis</td><td>${esc(formatDateDe(i.accessUntil))}</td></tr>
<tr><td style="padding:2px 14px 2px 0;color:#6b6259">Referenz</td><td>${esc(i.sessionId)}</td></tr>
</table>

<h3 style="font-size:15px;margin:20px 0 6px">Eure Erklärungen bei der Bestellung (${esc(consentWhen)})</h3>
<ul style="padding-left:18px;margin:0">
<li>${esc(CONSENT_TEXT.terms)}</li>
<li>${esc(CONSENT_TEXT.immediate)}</li>
<li>${esc(CONSENT_TEXT.acknowledge)}</li>
</ul>
<p>Wir haben auf euren ausdrücklichen Wunsch mit der Bereitstellung vor Ablauf der Widerrufsfrist begonnen. Den Login-Link zum Dashboard erhaltet ihr in einer separaten E-Mail.</p>

<h2 style="font-size:17px;margin:28px 0 4px">Widerrufsbelehrung</h2>
${sectionsHtml(WIDERRUF_SECTIONS)}
<h3 style="font-size:14px;margin:18px 0 6px">Muster-Widerrufsformular</h3>
${WIDERRUF_FORM_LINES.map((l) => `<p style="margin:0 0 6px">${esc(l)}</p>`).join('')}

<h2 style="font-size:17px;margin:28px 0 4px">Allgemeine Geschäftsbedingungen</h2>
<p style="color:#6b6259;font-size:12px">Fassung ${esc(i.legalVersion || LEGAL_VERSION)}</p>
${sectionsHtml(AGB_SECTIONS)}

<p style="margin-top:28px;color:#6b6259;font-size:12px">${esc(OPERATOR.name)} · ${esc(OPERATOR.street)} · ${esc(OPERATOR.city)} · ${esc(OPERATOR.email)}</p>
</div>`;

  try {
    return await sendBrevoMail({
      to: i.email,
      subject: 'Vertragsbestätigung für eure Hochzeitswebsite',
      htmlContent: html,
      replyTo: { email: OPERATOR.email, name: OPERATOR.name },
    });
  } catch (err) {
    console.error('[contract-mail] Versand hat geworfen:', err);
    return false;
  }
}
