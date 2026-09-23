/**
 * Rechtliche Stammdaten und Texte — EINE Quelle für Impressum, AGB,
 * Widerrufsbelehrung, Checkout-Zustimmungen und die Vertragsbestätigung per
 * E-Mail (dauerhafter Datenträger). Seiten und Mail rendern dieselben Texte.
 *
 * STATUS: abgenommen (Stand LEGAL_VERSION). Die Widerrufsbelehrung folgt dem
 * gesetzlichen Muster (Anlage 1 zu Art. 246a § 1 Abs. 2 EGBGB) für
 * Dienstleistungen.
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
  person: 'Iver Bohnes',
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

// =============================================================================
// DATENSCHUTZERKLÄRUNG — beschreibt den tatsächlichen Datenfluss des Codes.
// Abgenommen (Stand LEGAL_VERSION). Bei Änderungen am Datenfluss (neue
// Dienstleister, neue Formularfelder, Löschlogik) hier nachziehen.
// =============================================================================
export const DATENSCHUTZ_SECTIONS: LegalSection[] = [
  {
    title: '1. Verantwortlicher',
    paragraphs: [
      `Verantwortlich für die Datenverarbeitung auf sarahiver.de ist ${OPERATOR_LINE}.`,
      'Bei Fragen zum Datenschutz erreicht ihr uns unter dieser E-Mail-Adresse.',
    ],
  },
  {
    title: '2. Hosting und technische Bereitstellung',
    paragraphs: [
      'Die Website und die Hochzeitsseiten werden bei der Vercel Inc. gehostet. Beim Aufruf verarbeitet der Hoster technisch notwendige Daten wie IP-Adresse, Zeitpunkt, aufgerufene Adresse und Browserinformationen in Server-Logs. Vercel speichert Server-Logs zur Sicherheit nach eigenen Angaben für maximal 30 Tage.',
      'Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren und stabilen Betrieb (Art. 6 Abs. 1 lit. f DSGVO).',
    ],
  },
  {
    title: '3. Externe Inhalte: Karten und Bilder',
    paragraphs: [
      'Schriften liefern wir von unseren eigenen Servern aus; dabei werden keine Daten an Dritte übermittelt.',
      'In den Bereichen „Anfahrt" und „Übernachtung" können Hochzeitswebsites eine Karte von Google Maps (Google Ireland Limited / Google LLC) anbieten. Die Karte wird erst geladen, wenn ihr aktiv auf „Karte anzeigen" klickt; vorher wird keine Verbindung zu Google aufgebaut. Mit dem Laden stellt euer Browser eine Verbindung zu Google her; dabei werden insbesondere eure IP-Adresse und technische Verbindungsdaten übertragen. Links wie „Route planen" öffnen Google Maps erst, wenn ihr sie anklickt.',
      'Auf unserer Startseite sowie in den Beispiel- und Demoseiten laden wir Beispielbilder direkt von den Diensten Lorem Picsum (picsum.photos) und Pexels. Dabei wird eure IP-Adresse an den jeweiligen Anbieter übermittelt. Auf den Hochzeitswebsites unserer Kundinnen und Kunden werden diese Dienste nicht verwendet; dort stammen Bilder aus dem Upload des Brautpaars (Cloudinary).',
      'Rechtsgrundlage ist unser berechtigtes Interesse an einer anschaulichen Darstellung und an der Anzeige von Anfahrtsinformationen (Art. 6 Abs. 1 lit. f DSGVO).',
    ],
  },
  {
    title: '4. Account und Anmeldung',
    paragraphs: [
      'Mit dem Kauf legen wir für euch einen Account an. Dafür verarbeiten wir eure E-Mail-Adresse und, falls ihr eines vergebt, ein Passwort (gespeichert nur als nicht umkehrbarer Hashwert). Die Anmeldung erfolgt per Login-Link oder Passwort. Für die Sitzung setzen wir technisch notwendige Cookies.',
      'Die Authentifizierung erfolgt über den Dienst Supabase (Supabase Inc.).',
      'Rechtsgrundlage ist die Erfüllung des Vertrags (Art. 6 Abs. 1 lit. b DSGVO).',
    ],
  },
  {
    title: '5. Bestellung, Kauf und Bereitstellung',
    paragraphs: [
      'Für die Bestellung verarbeiten wir eure E-Mail-Adresse, die Namen des Brautpaars, das Hochzeitsdatum, die gewünschte Adresse der Website und den gewählten Stil. Außerdem speichern wir eure Erklärungen im Bestellprozess (Zustimmung zu den AGB, Verlangen des sofortigen Beginns der Bereitstellung, Kenntnis der Widerrufsfolgen) mit Zeitpunkt, um sie nachweisen zu können.',
      'Nach erfolgreicher Zahlung richten wir euren Account und eure Website automatisch ein und senden euch einen Login-Link sowie eine Vertragsbestätigung per E-Mail.',
      'Rechtsgrundlagen sind die Vertragserfüllung und vorvertragliche Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO) sowie gesetzliche Nachweis- und Aufbewahrungspflichten (Art. 6 Abs. 1 lit. c DSGVO).',
    ],
  },
  {
    title: '6. Zahlungsabwicklung über Stripe',
    paragraphs: [
      'Die Zahlung erfolgt über den Zahlungsdienstleister Stripe. Eure Zahlungsdaten (z. B. Karten- oder Kontodaten) gebt ihr direkt bei Stripe ein; wir erhalten sie nicht. Von Stripe erhalten wir Informationen zum Zahlungsstatus, eure E-Mail-Adresse, Referenznummern der Zahlung und die Angaben aus eurer Bestellung. Diese Informationen speichern wir, um die Zahlung zuzuordnen und die Bereitstellung auszulösen.',
      'Rechtsgrundlage ist die Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO). Stripe verarbeitet Zahlungsdaten zudem in eigener Verantwortung, etwa zur Betrugsprävention; dazu gilt die Datenschutzerklärung von Stripe.',
    ],
  },
  {
    title: '7. E-Mail-Versand über Brevo',
    paragraphs: [
      'Transaktionale E-Mails (Login-Links, Passwort-Zurücksetzen, Vertragsbestätigung, Bestätigung der Warteliste, Weiterleitung von Kontaktanfragen) versenden wir über Brevo (Sendinblue GmbH, Köpenicker Straße 126, 10179 Berlin). Dafür übermitteln wir die Empfängeradresse und den Inhalt der jeweiligen E-Mail.',
      'Rechtsgrundlage ist die Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO) bzw. eure Einwilligung bei der Warteliste (Art. 6 Abs. 1 lit. a DSGVO).',
    ],
  },
  {
    title: '8. Datenbank (Supabase)',
    paragraphs: [
      'Accounts, Inhalte der Hochzeitsseiten sowie die Angaben von Gästen (Abschnitte 10–14) speichern wir in einer Datenbank bei Supabase (Supabase Inc.). Der Zugriff ist durch Zugriffsregeln beschränkt: Nicht veröffentlichte Inhalte und Gästeangaben sind nur für das jeweilige Brautpaar im Dashboard sichtbar.',
    ],
  },
  {
    title: '9. Hochzeitswebsite und Inhalte des Brautpaars',
    paragraphs: [
      'Das Brautpaar pflegt die Inhalte seiner Website selbst, etwa Namen, Datum, Ort, Texte und Fotos. Veröffentlichte Inhalte sind für alle abrufbar, die die Adresse der Website kennen. Entwürfe sind nur für das Brautpaar sichtbar.',
      'Bilder, die das Brautpaar im Dashboard hochlädt, speichern wir bei Cloudinary (siehe Abschnitt 14).',
      'Rechtsgrundlage ist die Erfüllung des Vertrags mit dem Brautpaar (Art. 6 Abs. 1 lit. b DSGVO). Das Brautpaar ist dafür verantwortlich, nur Inhalte einzustellen, zu deren Veröffentlichung es berechtigt ist.',
    ],
  },
  {
    title: '10. Rückmeldungen zur Hochzeit (RSVP)',
    paragraphs: [
      'Gäste können über die Hochzeitswebsite zu- oder absagen. Dabei verarbeiten wir die Angaben aus dem Formular: Name, Teilnahme, Anzahl und Namen der Begleitpersonen sowie – je nach Einstellung des Brautpaars und sofern angegeben – E-Mail-Adresse, Essenswünsche, Unverträglichkeiten, eine Nachricht und Antworten auf weitere Fragen des Brautpaars.',
      'Hat das Brautpaar die Rückmeldung mit einem Einladungscode geschützt, speichern wir zur Abwehr von Missbrauch fehlgeschlagene Code-Eingaben mit einem gekürzten, nicht rückrechenbaren Kennwert eures Anschlusses. Nach richtiger Code-Eingabe setzen wir ein technisch notwendiges Cookie für diese Website.',
      'Die Rückmeldungen sind nur für das Brautpaar im Dashboard sichtbar; das Brautpaar kann sie dort auch selbst anlegen, ändern, löschen und exportieren. Das Brautpaar kann zudem eine Gästeliste mit Namen und E-Mail-Adressen seiner Gäste hochladen.',
    ],
  },
  {
    title: '11. Gästebuch',
    paragraphs: [
      'Gäste können einen Gästebucheintrag mit Name und Nachricht hinterlassen. Einträge erscheinen erst, nachdem das Brautpaar sie im Dashboard freigegeben hat; dann sind sie auf der Hochzeitswebsite öffentlich sichtbar.',
    ],
  },
  {
    title: '12. Musikwünsche',
    paragraphs: [
      'Gäste können Musikwünsche mit Titel, Interpret und optional ihrem Namen einreichen. Die Wünsche werden auf der Hochzeitswebsite angezeigt.',
    ],
  },
  {
    title: '13. Geschenkreservierungen',
    paragraphs: [
      'Gäste können ein Geschenk aus der Wunschliste reservieren und dabei ihren Namen angeben. Die Reservierung wird auf der Hochzeitswebsite als „reserviert" angezeigt, damit Geschenke nicht doppelt gekauft werden; der angegebene Name kann dort angezeigt werden.',
    ],
  },
  {
    title: '14. Foto-Upload und Cloudinary',
    paragraphs: [
      'Gäste können Fotos für das Brautpaar hochladen und optional ihren Namen angeben. Die Bilder werden direkt aus dem Browser an den Dienst Cloudinary übertragen und dort gespeichert; dabei werden auch technische Dateidaten und die IP-Adresse übermittelt. In unserer Datenbank speichern wir die Adresse des Bildes, den angegebenen Namen und den Zeitpunkt.',
      'Hochgeladene Gästefotos werden nicht automatisch auf der Hochzeitswebsite veröffentlicht. Sie sind für das Brautpaar im Dashboard sichtbar.',
      'Auch Bilder, die das Brautpaar selbst hochlädt, und die Bilder der Hochzeitsseiten werden über Cloudinary gespeichert und ausgeliefert.',
    ],
  },
  {
    title: 'Rechtsgrundlage für Angaben von Gästen (Abschnitte 10–14)',
    paragraphs: [
      'Wir verarbeiten die Angaben von Gästen, um dem Brautpaar die gebuchten Funktionen seiner Hochzeitswebsite bereitzustellen. Rechtsgrundlage ist unser berechtigtes Interesse und das des Brautpaars an der Organisation der Hochzeit (Art. 6 Abs. 1 lit. f DSGVO). Die Angaben sind freiwillig. Angaben zu Unverträglichkeiten macht ihr nur, wenn ihr das möchtet.',
    ],
  },
  {
    title: '15. Kontaktformular',
    paragraphs: [
      'Wenn ihr uns über das Kontaktformular schreibt, verarbeiten wir Name, E-Mail-Adresse, Betreff und Nachricht, um eure Anfrage zu beantworten. Die Anfrage wird per E-Mail (über Brevo) an uns weitergeleitet.',
      'Rechtsgrundlage ist die Bearbeitung eurer Anfrage (Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO).',
    ],
  },
  {
    title: '16. Warteliste',
    paragraphs: [
      'Wenn ihr euch für die Startbenachrichtigung eintragt, verarbeiten wir eure E-Mail-Adresse. Die Eintragung wird erst wirksam, wenn ihr den Link in unserer Bestätigungs-E-Mail anklickt. Wir informieren euch über den Start von sarahiver.de. Die Adresse speichern wir in unserer Datenbank; die E-Mails versenden wir über Brevo. Ihr könnt euch jederzeit austragen.',
      'Rechtsgrundlage ist eure Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die ihr jederzeit mit Wirkung für die Zukunft widerrufen könnt.',
    ],
  },
  {
    title: '17. Sicherheit und Missbrauchsschutz',
    paragraphs: [
      'Zum Schutz vor Missbrauch begrenzen wir die Zahl der Anfragen an öffentliche Formulare. Dazu verarbeiten wir kurzzeitig einen gekürzten, nicht rückrechenbaren Kennwert der IP-Adresse im Arbeitsspeicher des Servers; dieser wird nicht dauerhaft gespeichert. Außerdem zählen wir, wie viele Einträge pro Hochzeitswebsite in kurzer Zeit eingehen.',
      'Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO).',
    ],
  },
  {
    title: '18. Cookies',
    paragraphs: [
      'Wir setzen ausschließlich technisch notwendige Cookies: für die Anmeldung im Dashboard, für die Freischaltung einer per Code geschützten Rückmeldung und für die Testumgebung „Testen" (24 Stunden). Wir setzen keine Analyse- oder Werbe-Cookies.',
    ],
  },
  {
    title: '19. Speicherdauer',
    paragraphs: [
      'Wir speichern personenbezogene Daten, solange sie für den jeweiligen Zweck erforderlich sind. Die Hochzeitswebsite ist für die vereinbarte Laufzeit abrufbar (12 Monate ab Zahlung, mindestens bis drei Monate nach dem Hochzeitsdatum). Eine automatische Löschung der Inhalte und Gästeangaben zu diesem Zeitpunkt findet derzeit nicht statt; auf Anfrage löschen wir sie, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.',
      'Daten zu Zahlungen und Bestellungen bewahren wir auf, solange handels- und steuerrechtliche Pflichten dies verlangen. Einträge der Testumgebung löschen wir automatisch nach etwa 24 Stunden.',
    ],
  },
  {
    title: '20. Empfänger und Auftragsverarbeiter',
    paragraphs: [
      'Wir setzen folgende Dienstleister ein: Vercel (Hosting), Supabase (Datenbank und Anmeldung), Stripe (Zahlungsabwicklung), Brevo (E-Mail-Versand) und Cloudinary (Bildspeicherung und -auslieferung). Die Dienstleister verarbeiten Daten nur, soweit dies für ihre Leistung erforderlich ist.',
    ],
  },
  {
    title: '21. Übermittlung in Drittländer',
    paragraphs: [
      'Einige Dienstleister (u. a. Vercel, Supabase, Cloudinary sowie Google für die eingebetteten Karten) haben ihren Sitz außerhalb der EU oder können Daten außerhalb der EU verarbeiten, insbesondere in den USA. Eine Übermittlung erfolgt nur auf Grundlage der dafür vorgesehenen Garantien der DSGVO, die sich aus den Vertrags- und Datenschutzbedingungen der jeweiligen Anbieter ergeben.',
    ],
  },
  {
    title: '22. Eure Rechte',
    paragraphs: [
      'Ihr habt das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21). Eine erteilte Einwilligung könnt ihr jederzeit mit Wirkung für die Zukunft widerrufen.',
      `Wendet euch dafür an ${OPERATOR.email}. Gäste können sich auch direkt an das jeweilige Brautpaar wenden.`,
    ],
  },
  {
    title: '23. Beschwerderecht',
    paragraphs: [
      'Ihr habt das Recht, euch bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Für uns zuständig ist der Hamburgische Beauftragte für Datenschutz und Informationsfreiheit.',
    ],
  },
  {
    title: '24. Änderungen',
    paragraphs: [
      'Wir passen diese Datenschutzerklärung an, wenn sich unser Angebot oder die rechtlichen Anforderungen ändern. Es gilt die jeweils hier veröffentlichte Fassung.',
    ],
  },
];
