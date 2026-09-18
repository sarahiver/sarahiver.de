import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { accessCookieName, verifyAccessToken } from '@/lib/rsvp-access';
import { loadRsvpSiteContext } from '@/lib/rsvp-server';

/**
 * POST /api/rsvp — Gäste-Rückmeldung speichern.
 *
 * Bis jetzt gab es überhaupt keinen Gäste-Submit: die Formulare hatten ein
 * handleSubmit ohne Netzwerkaufruf (in Variante A stand dort ein TODO), und
 * in wedding_rsvps schrieb ausschließlich das Dashboard. Diese Route ist der
 * erste echte Weg — deshalb validiert sie vollständig serverseitig und
 * verlässt sich auf nichts, was der Browser behauptet.
 *
 * Reihenfolge der Prüfungen:
 *   1. Site existiert
 *   2. Berechtigung (Cookie), sofern Schutz aktiv
 *   3. Eingabedaten, Wertebereiche, Längen
 *   4. erst dann schreiben — mit Service-Role, nie per öffentlichem Client
 *
 * Phase 3:
 *   - Fehlerantworten zu einzelnen Feldern tragen `field` ('name' | 'attending'
 *     | 'email'), damit das Formular die Meldung direkt am Feld zeigt. Die
 *     Texte selbst sind unverändert.
 *   - guests[] wird im Dashboard-Format gespeichert: Index 0 = Hauptperson,
 *     ab Index 1 die Begleitungen (siehe lib/rsvp-data.ts, RsvpList.flatten,
 *     addRsvp). Vorher landeten nur die Begleitungen im Array — das Dashboard
 *     hätte die erste Begleitung als Hauptperson übersprungen.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX = {
  name: 100,
  email: 160,
  text: 500,
  message: 2000,
  guests: 20,
  persons: 20,
  answers: 4000,
};

interface GuestIn {
  name?: unknown;
  dietary?: unknown;
  allergies?: unknown;
}

interface Payload {
  slug?: unknown;
  name?: unknown;
  email?: unknown;
  attending?: unknown;
  persons?: unknown;
  dietary?: unknown;
  allergies?: unknown;
  message?: unknown;
  guests?: unknown;
  custom_answers?: unknown;
}

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const slug = str(body.slug, 120);
  if (!slug) {
    return NextResponse.json({ ok: false, error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  // --- 1) Site ---
  const ctx = await loadRsvpSiteContext(slug);
  if (!ctx) {
    return NextResponse.json({ ok: false, error: 'Hochzeitsseite nicht gefunden.' }, { status: 404 });
  }

  // --- 2) Berechtigung ---
  // Der Client-State spielt hier keine Rolle. Ohne gültiges, signiertes
  // Cookie für DIESE Site und die AKTUELLE Code-Version ist Schluss.
  if (ctx.codeEnabled && ctx.hasCode) {
    const cookieHeader = request.headers.get('cookie') || '';
    const name = accessCookieName(ctx.siteId);
    const token = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${name}=`))
      ?.slice(name.length + 1);

    const authorized = verifyAccessToken(token, {
      siteId: ctx.siteId,
      version: ctx.codeVersion,
    });

    if (!authorized) {
      return NextResponse.json(
        {
          ok: false,
          code: 'unauthorized',
          error: 'Eure Freischaltung ist abgelaufen. Bitte gebt den Einladungscode noch einmal ein.',
        },
        { status: 401 },
      );
    }
  }

  // --- 3) Daten ---
  const name = str(body.name, MAX.name);
  if (name.length < 2) {
    return NextResponse.json(
      { ok: false, field: 'name', error: 'Bitte gebt euren Namen an.' },
      { status: 400 },
    );
  }

  if (typeof body.attending !== 'boolean') {
    return NextResponse.json(
      { ok: false, field: 'attending', error: 'Bitte sagt uns, ob ihr dabei seid.' },
      { status: 400 },
    );
  }
  const attending = body.attending;

  const email = str(body.email, MAX.email).toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, field: 'email', error: 'Diese E-Mail-Adresse sieht nicht richtig aus.' },
      { status: 400 },
    );
  }

  const rawPersons = Number(body.persons);
  const persons = attending
    ? Math.max(1, Math.min(MAX.persons, Number.isFinite(rawPersons) ? Math.floor(rawPersons) : 1))
    : 0;

  // Bei einer Absage werden Verpflegung, Begleitung und Antworten verworfen —
  // dieselbe Logik wie in buildSubmitPayload auf der Clientseite, hier aber
  // verbindlich.
  const dietary = attending ? str(body.dietary, MAX.text) : '';
  const allergies = attending ? str(body.allergies, MAX.text) : '';
  const message = str(body.message, MAX.message);

  // Index 0 = Hauptperson (Dashboard-Format), danach die Begleitungen.
  const guests: { name: string; dietary: string; allergies: string }[] = [
    { name, dietary, allergies },
  ];
  if (attending && Array.isArray(body.guests)) {
    for (const g of (body.guests as GuestIn[]).slice(0, MAX.guests)) {
      const gn = str(g?.name, MAX.name);
      const gd = str(g?.dietary, MAX.text);
      const ga = str(g?.allergies, MAX.text);
      if (gn || gd || ga) guests.push({ name: gn, dietary: gd, allergies: ga });
    }
  }

  let customAnswer = '';
  if (attending && body.custom_answers && typeof body.custom_answers === 'object') {
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(body.custom_answers as Record<string, unknown>)) {
      const key = String(k).slice(0, 60);
      const val = str(v, MAX.text);
      if (key && val) clean[key] = val;
    }
    if (Object.keys(clean).length) {
      customAnswer = JSON.stringify(clean).slice(0, MAX.answers);
    }
  }

  // --- 4) Schreiben ---
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: 'Das hat gerade nicht geklappt. Bitte versucht es später erneut.' },
      { status: 500 },
    );
  }

  const { error } = await admin.from('wedding_rsvps').insert({
    wedding_site_id: ctx.siteId,
    name,
    email,
    persons,
    attending,
    dietary,
    allergies,
    message,
    custom_answer: customAnswer,
    guests,
  } as never);

  if (error) {
    // Auf wedding_rsvps liegt ein Unique-Index auf der E-Mail je Hochzeit —
    // so werden Mehrfach-Rückmeldungen heute verhindert.
    if (error.code === '23505') {
      return NextResponse.json(
        {
          ok: false,
          code: 'duplicate',
          field: 'email',
          error: 'Unter dieser E-Mail-Adresse liegt uns schon eine Rückmeldung vor.',
        },
        { status: 409 },
      );
    }
    console.error('[rsvp] insert failed:', error.code, error.message);
    return NextResponse.json(
      { ok: false, error: 'Das hat gerade nicht geklappt. Bitte versucht es später erneut.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, attending });
}
