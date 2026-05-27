import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email ist erforderlich.' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Ungültige Email-Adresse.' }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    const listId = process.env.BREVO_WAITLIST_LIST_ID;

    if (!apiKey || !listId) {
      console.error('Missing Brevo env vars');
      return NextResponse.json(
        { error: 'Service nicht verfügbar. Bitte später erneut versuchen.' },
        { status: 500 }
      );
    }

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
        updateEnabled: true,
        attributes: {
          SOURCE: 'sarahiver.de waitlist v3',
          SIGNUP_DATE: new Date().toISOString(),
        },
      }),
    });

    const data = await brevoResponse.json();

    if (!brevoResponse.ok) {
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
