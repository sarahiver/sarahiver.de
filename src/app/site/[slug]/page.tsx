/**
 * /site/[slug] — Altroute.
 *
 * Früher Ziel des Subdomain-Rewrites. Sie rendert keine eigene Logik mehr,
 * sondern delegiert vollständig an die aktuelle Hochzeitsseiten-Route
 * /[slug] (Laufzeit, Rückerstattung, Navigation, Phasen). So gibt es genau
 * einen Renderer. Die Datei bleibt nur, damit alte Links weiter funktionieren.
 */
export { default, generateMetadata } from '../../[slug]/page';

// Segment-Konfiguration muss statisch in der Datei stehen (nicht re-exportierbar).
export const dynamic = 'force-dynamic';
