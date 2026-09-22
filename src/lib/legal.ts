/**
 * Rechtliche Stammdaten und Texte — EINE Quelle für Impressum, AGB,
 * Widerrufsbelehrung, Checkout-Zustimmungen und die Vertragsbestätigung per
 * E-Mail (dauerhafter Datenträger). Seiten und Mail rendern dieselben Texte.
 *
 * STATUS: AGB = ENTWURF — vor öffentlichem Launch rechtlich prüfen lassen.
 * Die Widerrufsbelehrung folgt dem gesetzlichen Muster (Anlage 1 zu
 * Art. 246a § 1 Abs. 2 EGBGB) für Dienstleistungen.
 *
 * Produktfakten, auf denen die Texte beruhen (aus dem Code):
 *   - Preis 69 € einmalig (lib/pricing.ts), Kleinunternehmer § 19 UStG
 *   - Bereitstellung 12 Monate ab Zahlung, mindestens bis 3 Monate nach dem
 *     angegebenen Hochzeitsdatum; keine Verlängerung, kein Abo
 *   - Provisionierung unmittelbar nach erfolgreicher Zahlung (Stripe-Webhook),
 *     öffentlich sichtbar nach Veröffentlichung im Dashboard
 *   - alle Designs und Bereiche enthalten; Custom Domains nicht Bestandteil
 *   - Rückerstattung sperrt die öffentliche Seite (purchase_status refunded)
 */

export const OPERATOR = {
  name: 'S&I.',
  person: 'Iver Gentz',
  street: 'Große Freiheit 82',
  city: '22767 Hamburg',
  country: 'Deutschland',
  email: 'wedding@sarahiver.de',
} as const;

export const OPERATOR_LINE = `${OPERATOR.name}, ${OPERATOR.person}, ${OPERATOR.street}, ${OPERATOR.city}, E-Mail: ${OPERATOR.email}`;

export const VAT_NOTE = 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.';

/** Version der Rechtstexte — wird mit der Zustimmung im Checkout gespeichert. */
export const LEGAL_VERSION = '2026-09';

/** Texte der drei Pflicht-Checkboxen im Bestellformular (wortgleich in der Bestätigungsmail). */
export const CONSENT_TEXT = {
  terms:
    'Ich akzeptiere die AGB und habe die Widerrufsbelehrung sowie die Datenschutzerklärung zur Kenntnis genommen.',
  immediate:
    'Ich verlange ausdrücklich, dass S&I. vor Ablauf der Widerrufsfrist mit der Bereitstellung meiner Hochzeitswebsite beginnt.',
  acknowledge:
    'Mir ist bekannt, dass ich bei einem Widerruf einen angemessenen Betrag für die bis dahin erbrachte Bereitstellung zahle und dass mein Widerrufsrecht erlischt, sobald die Leistung vollständig erbracht ist.',
} as const;

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export const AGB_DRAFT_NOTICE = 'Entwurf — vor öffentlichem Launch rechtlich prüfen lassen.';

export const AGB_SECTIONS: LegalSection[] = [
  {
    title: '1. Anbieter und Geltungsbereich',
    paragraphs: [
      `Anbieter ist ${OPERATOR_LINE} („wir").`,
      'Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge über die Bereitstellung einer Hochzeitswebsite über sarahiver.de zwischen uns und unseren Kundinnen und Kunden („ihr").',
    ],
  },
  {
    title: '2. Vertragsgegenstand',
    paragraphs: [
      'Gegenstand des Vertrags ist die zeitlich begrenzte Bereitstellung einer Hochzeitswebsite im Selbstbedienungsmodell: Ihr erhaltet Zugang zu einem Dashboard, in dem ihr Inhalte, Design und Bereiche eurer Website selbst pflegt, sowie die Veröffentlichung der Website unter der bei der Bestellung gewählten Adresse (<slug>.sarahiver.de).',
      'Enthalten sind alle angebotenen Designs und Bereiche. Eine eigene Domain (Custom Domain) ist nicht Bestandteil des Vertrags.',
      'Wir erstellen keine Inhalte für euch. Gestaltung und Befüllung der Website nehmt ihr selbst im Dashboard vor.',
    ],
  },
  {
    title: '3. Vertragsschluss',
    paragraphs: [
      'Die Darstellung des Angebots auf unserer Website ist kein verbindliches Angebot. Mit dem Klick auf „Zahlungspflichtig bestellen" und dem Abschluss der Zahlung über unseren Zahlungsdienstleister Stripe gebt ihr ein verbindliches Angebot ab. Der Vertrag kommt mit dem erfolgreichen Zahlungseingang zustande.',
      'Wir bestätigen den Vertragsschluss per E-Mail. Diese Bestätigung enthält die Vertragsbedingungen, die Widerrufsbelehrung und eure Erklärungen zum Beginn der Bereitstellung.',
      'Vertragssprache ist Deutsch.',
    ],
  },
  {
    title: '4. Preis und Zahlung',
    paragraphs: [
      `Der Preis beträgt 69 € einmalig. ${VAT_NOTE}`,
      'Die Zahlung erfolgt im Voraus über Stripe mit den dort angebotenen Zahlungsarten. Es entstehen keine laufenden Kosten; es gibt kein Abonnement und keine automatische Verlängerung.',
    ],
  },
  {
    title: '5. Bereitstellung',
    paragraphs: [
      'Nach erfolgreicher Zahlung richten wir euren Zugang und eure Website unmittelbar ein und senden euch einen Login-Link per E-Mail. Sofern ihr dies bei der Bestellung ausdrücklich verlangt habt, beginnen wir damit vor Ablauf der Widerrufsfrist.',
      'Öffentlich abrufbar ist die Website, sobald ihr sie im Dashboard veröffentlicht. Änderungen werden sichtbar, wenn ihr sie veröffentlicht.',
    ],
  },
  {
    title: '6. Eure Mitwirkung',
    paragraphs: [
      'Ihr gebt bei der Bestellung eine gültige E-Mail-Adresse an und haltet eure Zugangsdaten geheim.',
      'Ihr pflegt die Inhalte eurer Website selbst und prüft sie vor der Veröffentlichung.',
    ],
  },
  {
    title: '7. Inhalte und Rechte',
    paragraphs: [
      'Für die Inhalte, die ihr oder eure Gäste über die Website einstellt (z. B. Texte, Fotos, Rückmeldungen, Gästebucheinträge), seid ihr verantwortlich. Ihr versichert, dass ihr die erforderlichen Rechte an euren Inhalten besitzt und diese nicht gegen geltendes Recht oder Rechte Dritter verstoßen.',
      'Ihr räumt uns die Rechte ein, die für das Speichern, Verarbeiten und Anzeigen eurer Inhalte zur Vertragserfüllung erforderlich sind. Weitergehende Rechte erwerben wir nicht.',
      'Werden uns rechtswidrige Inhalte bekannt, dürfen wir diese nach Hinweis an euch sperren, soweit das zur Abwendung eines Rechtsverstoßes erforderlich ist.',
    ],
  },
  {
    title: '8. Verfügbarkeit',
    paragraphs: [
      'Wir bemühen uns um eine möglichst unterbrechungsfreie Erreichbarkeit der Website und des Dashboards. Vorübergehende Einschränkungen durch Wartung, Sicherheitsmaßnahmen oder Störungen bei technischen Dienstleistern können nicht vollständig ausgeschlossen werden.',
    ],
  },
  {
    title: '9. Laufzeit und Ende der Bereitstellung',
    paragraphs: [
      'Die Bereitstellung beginnt mit dem Zahlungseingang und dauert 12 Monate, mindestens jedoch bis drei Monate nach dem bei der Bestellung angegebenen Hochzeitsdatum. Eine Verlängerung ist derzeit nicht vorgesehen.',
      'Nach Ende der Bereitstellung ist die Website nicht mehr öffentlich abrufbar. Das Recht beider Seiten zur Kündigung aus wichtigem Grund bleibt unberührt.',
    ],
  },
  {
    title: '10. Gewährleistung und Haftung',
    paragraphs: [
      'Es gelten die gesetzlichen Gewährleistungsrechte.',
      'Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei der Verletzung von Leben, Körper oder Gesundheit sowie nach dem Produkthaftungsgesetz. Bei leicht fahrlässiger Verletzung einer wesentlichen Vertragspflicht, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung ihr regelmäßig vertrauen dürft, ist unsere Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt. Im Übrigen ist die Haftung für leichte Fahrlässigkeit ausgeschlossen.',
    ],
  },
  {
    title: '11. Widerrufsrecht',
    paragraphs: [
      'Verbraucherinnen und Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Einzelheiten ergeben sich aus der Widerrufsbelehrung unter sarahiver.de/widerruf, die wir euch mit der Vertragsbestätigung auch per E-Mail übermitteln.',
    ],
  },
  {
    title: '12. Schlussbestimmungen',
    paragraphs: [
      'Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Gegenüber Verbraucherinnen und Verbrauchern gilt diese Rechtswahl nur, soweit dadurch nicht der Schutz durch zwingende Bestimmungen des Rechts des Staates entzogen wird, in dem sie ihren gewöhnlichen Aufenthalt haben.',
      'Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.',
    ],
  },
];

/** Widerrufsbelehrung nach gesetzlichem Muster (Dienstleistung). */
export const WIDERRUF_SECTIONS: LegalSection[] = [
  {
    title: 'Widerrufsrecht',
    paragraphs: [
      'Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.',
      'Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.',
      `Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (${OPERATOR_LINE}) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.`,
      'Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.',
    ],
  },
  {
    title: 'Folgen des Widerrufs',
    paragraphs: [
      'Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.',
      'Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen soll, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.',
    ],
  },
  {
    title: 'Hinweis zum vorzeitigen Beginn der Bereitstellung',
    paragraphs: [
      'Wir beginnen mit der Bereitstellung Ihrer Hochzeitswebsite vor Ablauf der Widerrufsfrist nur, wenn Sie dies bei der Bestellung ausdrücklich verlangt haben. Ihr Widerrufsrecht bleibt dadurch zunächst bestehen.',
      'Das Widerrufsrecht erlischt bei einem Vertrag zur Erbringung von Dienstleistungen, wenn wir die Dienstleistung vollständig erbracht haben und mit der Ausführung der Dienstleistung erst begonnen haben, nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben haben und gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger Vertragserfüllung durch uns verlieren.',
    ],
  },
];

export const WIDERRUF_FORM_LINES: string[] = [
  '(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)',
  `An ${OPERATOR.name}, ${OPERATOR.person}, ${OPERATOR.street}, ${OPERATOR.city}, E-Mail: ${OPERATOR.email}:`,
  'Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung (*)',
  'Bestellt am (*)',
  'Name des/der Verbraucher(s)',
  'Anschrift des/der Verbraucher(s)',
  'Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)',
  'Datum',
  '(*) Unzutreffendes streichen.',
];
