/**
 * Neutraler Hinweis an den öffentlichen Gastformularen (RSVP, Gästebuch,
 * Foto-Upload) mit Link auf die vorhandene Datenschutzerklärung.
 *
 * Absolute URL auf die App-Domain: Hochzeitsseiten laufen unter
 * <slug>.sarahiver.de, dort würde ein relativer Link /datenschutz auf die
 * Hochzeitsseite umgeschrieben. Keine inhaltlichen Rechtsbehauptungen hier —
 * die stehen ausschließlich in der Datenschutzerklärung.
 *
 * Gestaltung: erbt Schrift und Farbe des jeweiligen Stils (klein, gedämpft);
 * Styles in globals.css (.guest-privacy-note).
 */
const PRIVACY_URL = `${process.env.NEXT_PUBLIC_APP_URL || 'https://sarahiver.de'}/datenschutz`;

export default function GuestPrivacyNote() {
  return (
    <p className="guest-privacy-note">
      Hinweise zur Verarbeitung deiner Angaben findest du in unserer{' '}
      <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">
        Datenschutzerklärung
      </a>
      .
    </p>
  );
}
