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
 * Hauptschalter — seit dem Verkaufsstart AUS.
 *
 * Damit rendert das Launch-Modal nicht mehr, /signup zeigt das Bestellformular
 * und der Checkout ist freigegeben. Die Komponenten (LaunchGate,
 * PrelaunchNotice, Warteliste) bleiben im Code, falls der Verkauf noch einmal
 * pausiert werden muss: dann hier wieder auf `true` setzen.
 * Notbremse ohne Deploy: NEXT_PUBLIC_PRE_LAUNCH=on in Vercel setzen.
 */
export const PRE_LAUNCH_MODE = process.env.NEXT_PUBLIC_PRE_LAUNCH === 'on';

/**
 * Kauf-Schalter. Hängt am selben Hauptschalter und wird an zwei Stellen
 * geprüft: in der Seite (Anzeige) UND in der Server Action (verbindlich).
 * Wird der Verkauf pausiert, greift die Sperre also auch bei direktem Aufruf.
 */
export const CHECKOUT_ENABLED = !PRE_LAUNCH_MODE;

/**
 * Routen, auf denen das Launch Gate NIE erscheinen darf.
 *
 * Wer aus der Bestätigungsmail kommt, hat sich gerade eingetragen — ihn dort
 * erneut zum Eintragen aufzufordern, wäre der schlechteste Moment dafür.
 * Der Abgleich passiert über den Pfad, nicht über Client-State: ein Redirect
 * lädt die Seite neu, jeder gemerkte Zustand wäre damit verloren.
 */
export const GATE_EXCLUDED_PATHS = ['/launch', '/signup'];

/** Darf das Gate auf diesem Pfad erscheinen? */
export function gateAllowedOnPath(pathname: string): boolean {
  return !GATE_EXCLUDED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

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
    text: `Eure E-Mail-Adresse wurde bestätigt. Wir informieren euch zum offiziellen Start von sarahiver.de am ${LAUNCH_DATE_LABEL}.`,
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
