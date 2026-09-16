/**
 * Launch Gate — zentrale Konfiguration.
 *
 * EIN Schalter für die gesamte Pre-Launch-Phase. Am Launch-Tag genügt es,
 * PRE_LAUNCH_MODE auf false zu setzen — danach ist das Modal weg und die
 * fertige Landing bleibt unverändert stehen. Es gibt bewusst keine zweite
 * Prelaunch-Seite, die man später wieder abräumen müsste.
 */

/** Offizieller Start. */
export const LAUNCH_DATE = '2026-10-15';
export const LAUNCH_DATE_LABEL = '15. Oktober 2026';

/**
 * Hauptschalter.
 *
 * Am 15.10.2026: hier auf `false` setzen, committen, fertig.
 * Zum Prüfen ohne Deploy: NEXT_PUBLIC_PRE_LAUNCH=off in Vercel setzen.
 */
export const PRE_LAUNCH_MODE = process.env.NEXT_PUBLIC_PRE_LAUNCH !== 'off';

/**
 * Kauf-Schalter. Vor dem Launch darf kein Stripe-Checkout starten — weder über
 * die Landing noch durch direkten Aufruf von /signup. Geprüft wird das an zwei
 * Stellen: in der Seite (Anzeige) UND in der Server Action (verbindlich).
 *
 * Hängt bewusst am selben Schalter: am 15.10.2026 wird mit PRE_LAUNCH_MODE
 * automatisch auch der Kauf freigeschaltet.
 */
export const CHECKOUT_ENABLED = !PRE_LAUNCH_MODE;

/**
 * Merker im Browser. Wer das Gate geschlossen hat, sieht es eine Weile nicht
 * wieder. Version im Schlüssel, damit ein späterer Textwechsel es erneut zeigen
 * kann.
 */
export const GATE_STORAGE_KEY = 'sarahiver.launch-gate.v1';

/** Wie lange nach dem Schließen Ruhe ist (Tage). */
export const GATE_SNOOZE_DAYS = 7;

export const GATE_COPY = {
  eyebrow: 'Bald geht’s los',
  title: 'sarahiver.de startet am',
  date: LAUNCH_DATE_LABEL,
  text:
    'Wir arbeiten gerade noch an den letzten Details. Wenn ihr zum Start Bescheid bekommen möchtet, tragt euch hier ein.',
  formLabel: 'E-Mail-Adresse',
  formPlaceholder: 'ihr@email.de',
  submit: 'Starttermin erfahren',
  submitting: 'Einen Moment …',
  consent:
    'Ja, informiert mich per E-Mail zum Start von sarahiver.de. Ich kann das jederzeit widerrufen.',
  privacyPrefix: 'Mehr dazu in der',
  privacyLabel: 'Datenschutzerklärung',
  privacyHref: '/datenschutz',
  exploreLead: 'Bis dahin könnt ihr euch schon umsehen:',
  exploreDemos: { label: 'Demoseiten ansehen', href: '/#beispiele' },
  exploreDashboard: { label: 'Dashboard ausprobieren', href: '/testen' },
  close: 'Schließen und weiterschauen',
  sent: {
    title: 'Fast geschafft.',
    text:
      'Wir haben euch gerade eine E-Mail geschickt. Klickt dort auf den Bestätigungslink, um die Anmeldung abzuschließen.',
    hint: 'Keine Mail bekommen? Schaut bitte auch im Spam-Ordner nach.',
  },
  already: {
    title: 'Ihr seid schon dabei.',
    text: 'Eure Anmeldung ist bestätigt — wir melden uns zum Start.',
  },
};

/** Zustand von /signup vor dem Launch. */
export const PRELAUNCH_SIGNUP_COPY = {
  eyebrow: 'Noch nicht ganz',
  title: `sarahiver.de startet am ${LAUNCH_DATE_LABEL}.`,
  text:
    'Kaufen könnt ihr eure Hochzeitswebsite ab dem Starttermin. Tragt euch ein, dann sagen wir euch Bescheid, sobald es losgeht.',
};

export const CONFIRM_COPY = {
  ok: {
    eyebrow: 'Anmeldung bestätigt',
    title: 'Ihr seid dabei.',
    text: `Wir informieren euch zum offiziellen Start von sarahiver.de am ${LAUNCH_DATE_LABEL}.`,
  },
  invalid: {
    eyebrow: 'Link nicht gültig',
    title: 'Das hat nicht geklappt.',
    text:
      'Der Bestätigungslink ist ungültig oder wurde bereits verwendet. Tragt euch gern noch einmal ein — oder schreibt uns kurz.',
  },
  ctaDemos: { label: 'Demoseiten entdecken', href: '/#beispiele' },
  ctaDashboard: { label: 'Dashboard ausprobieren', href: '/testen' },
};

/** Wird mit der Anmeldung gespeichert — Nachweis der Einwilligung. */
export const CONSENT_VERSION = '2026-09-16';
export const CONSENT_TEXT = GATE_COPY.consent;
