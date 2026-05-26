import { NextRequest, NextResponse } from 'next/server';

/**
 * Waitlist API Endpoint
 *
 * Fügt Email-Adresse zur Brevo-Liste `sarahiver-de-waitlist` hinzu.
 * Brevo handhabt Double-Opt-In automatisch (über List-Settings).
 *
 * Env-Vars (in Vercel setzen):
 *  - BREVO_API_KEY: API-Schlüssel aus Brevo (Settings → SMTP & API → API Keys)
 *  - BREVO_WAITLIST_LIST_ID: numerische ID der Liste in Brevo
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email ist erforderlich.' }, { status: 400 });
    }

    // Einfache Email-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Ungültige Email-Adresse.' }, { status: 400 });
    }

    // Env-Vars prüfen
    const apiKey = process.env.BREVO_API_KEY;
    const listId = process.env.BREVO_WAITLIST_LIST_ID;

    if (!apiKey || !listId) {
      console.error('Missing Brevo env vars');
      return NextResponse.json(
        { error: 'Service nicht verfügbar. Bitte später erneut versuchen.' },
        { status: 500 }
      );
    }

    // Brevo API Call: Contact erstellen + zur Liste hinzufügen
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        listIds: [parseInt(listId, 10)],
        updateEnabled: true, // Update existierende Kontakte statt 400-Fehler
        attributes: {
          SOURCE: 'sarahiver.de waitlist',
          SIGNUP_DATE: new Date().toISOString(),
        },
      }),
    });

    const data = await brevoResponse.json();

    if (!brevoResponse.ok) {
      // Brevo gibt manchmal duplicate_parameter, das ist OK (User schon in Liste)
      if (data?.code === 'duplicate_parameter') {
        return NextResponse.json({ success: true, alreadySubscribed: true });
      }

      console.error('Brevo error:', data);
      return NextResponse.json(
        { error: 'Eintrag konnte nicht gespeichert werden.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte später erneut versuchen.' },
      { status: 500 }
    );
  }
}
