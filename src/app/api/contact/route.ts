import { NextRequest, NextResponse } from 'next/server';
import { sendBrevoMail, mailShell } from '@/lib/brevo';

/**
 * Kontakt-API — nimmt das Formular von /kontakt entgegen und stellt die
 * Nachricht per Brevo an die interne Kontakt-Adresse zu. `replyTo` ist die
 * Absender-Mail, damit du direkt antworten kannst.
 *
 * Spam-Schutz: simples Honeypot-Feld (`company`). Bots füllen es aus → wir tun
 * so, als wäre alles ok (200), senden aber nichts.
 *
 * Ziel-Adresse: CONTACT_TO (Env) oder Fallback hallo@sarahiver.de.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE = 5000;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const subject = String(body.subject || '').trim();
  const message = String(body.message || '').trim();
  const honeypot = String(body.company || '').trim(); // Honeypot — muss leer sein

  // Bot erkannt → still schlucken.
  if (honeypot) {
    return NextResponse.json({ success: true });
  }

  if (!name) return NextResponse.json({ error: 'Bitte gib deinen Namen an.' }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ error: 'Bitte gib eine gültige E-Mail-Adresse an.' }, { status: 400 });
  if (!message) return NextResponse.json({ error: 'Bitte schreib uns eine Nachricht.' }, { status: 400 });
  if (message.length > MAX_MESSAGE)
    return NextResponse.json({ error: 'Die Nachricht ist zu lang.' }, { status: 400 });

  const to = process.env.CONTACT_TO || 'hallo@sarahiver.de';
  const subjectLine = subject || 'Neue Kontaktanfrage über sarahiver.de';

  const html = mailShell({
    heading: 'Neue Kontaktanfrage',
    bodyHtml: `<strong>Von:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;<br />
      <strong>Betreff:</strong> ${escapeHtml(subject || '—')}<br /><br />
      ${escapeHtml(message).replace(/\n/g, '<br />')}`,
    footnoteHtml: 'Direkt auf diese Mail antworten geht — die Antwort landet beim Absender.',
  });

  const ok = await sendBrevoMail({
    to,
    subject: `[Kontakt] ${subjectLine}`,
    htmlContent: html,
    replyTo: { email, name },
  });

  if (!ok) {
    return NextResponse.json(
      { error: 'Die Nachricht konnte nicht gesendet werden. Bitte versuch es später erneut.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
