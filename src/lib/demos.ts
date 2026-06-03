/**
 * Demo-Hochzeiten für die Examples-Sektion v2.
 *
 * 8 fiktive Brautpaare — eine pro Design-Stil. So sieht der User
 * sofort welche Stile verfügbar sind und welche Vibe sie haben.
 *
 * Die URLs sind die geplanten Subdomains. Sobald die Subdomain
 * eingebunden ist, funktioniert "Live ansehen" direkt.
 */

export interface DemoWedding {
  id: string;
  couple: string;
  date: string;
  location: string;
  style: string;          // Design-Stil aus design-system-v2 (editorial, brutalist, ...)
  styleLabel: string;     // schöne Anzeige ("Editorial · warm")
  config: string;         // Plan-Zeile
  url: string;
  featured?: boolean;
  tagline: string;
}

export const DEMO_WEDDINGS: DemoWedding[] = [
  {
    id: 'julia-tom',
    couple: 'Julia & Tom',
    date: '12. September 2027',
    location: 'Schloss Wackerbarth, Sachsen',
    style: 'editorial',
    styleLabel: 'Editorial · warm',
    config: 'Standard + 6 Bereiche · 18 €/Monat',
    url: 'julia-tom.sarahiver.de',
    featured: true,
    tagline: 'Klassisch warm, mit Magazin-Charakter.',
  },
  {
    id: 'anna-lukas',
    couple: 'Anna & Lukas',
    date: '27. Juni 2027',
    location: 'Forsthaus Sonne, Schwarzwald',
    style: 'organic',
    styleLabel: 'Organic · weich',
    config: 'Standard + 3 Bereiche · 14 €/Monat',
    url: 'anna-und-lukas.sarahiver.de',
    tagline: 'Salbei, Rosé, Italic — sanft und natürlich.',
  },
  {
    id: 'mia-noah',
    couple: 'Mia & Noah',
    date: '15. August 2027',
    location: 'Strandhotel Heiligendamm',
    style: 'brutalist',
    styleLabel: 'Brutalist · klar',
    config: 'Standard + 9 Bereiche · 21 €/Monat',
    url: 'mia-noah.sarahiver.de',
    tagline: 'Schwarz, weiß, riesengroß. Kompromisslos.',
  },
  {
    id: 'elena-felix',
    couple: 'Elena & Felix',
    date: '04. Mai 2027',
    location: 'Villa Toskana, Florenz',
    style: 'opulent',
    styleLabel: 'Opulent · golden',
    config: 'Standard + alle Bereiche · 23 €/Monat',
    url: 'elena-felix.sarahiver.de',
    tagline: 'Dark, deep, gold-akzentuiert. Für Abend-Hochzeiten.',
  },
  {
    id: 'lina-jonas',
    couple: 'Lina & Jonas',
    date: '21. Juli 2027',
    location: 'Industrie-Loft, Hamburg',
    style: 'mono',
    styleLabel: 'Mono · technisch',
    config: 'Standard + 6 Bereiche · 18 €/Monat',
    url: 'lina-jonas.sarahiver.de',
    tagline: 'Monospace, schwarz auf weiß. Architekten-Hochzeit.',
  },
  {
    id: 'clara-ben',
    couple: 'Clara & Ben',
    date: '08. Oktober 2027',
    location: 'Bauhaus-Museum, Dessau',
    style: 'bauhaus',
    styleLabel: 'Bauhaus · primär',
    config: 'Standard + 3 Bereiche · 14 €/Monat',
    url: 'clara-ben.sarahiver.de',
    tagline: 'Rot, Gelb, Blau, klare Formen. Geometrische Liebe.',
  },
  {
    id: 'paula-jakob',
    couple: 'Paula & Jakob',
    date: '13. Juni 2027',
    location: 'Weingut, Pfalz',
    style: 'liquefy',
    styleLabel: 'Liquefy · flüssig',
    config: 'Standard + 9 Bereiche · 21 €/Monat',
    url: 'paula-jakob.sarahiver.de',
    tagline: 'Tiefe Töne, flüssige Verläufe. Kontemplativ.',
  },
  {
    id: 'sarah-iver',
    couple: 'Sarah & Iver',
    date: '11. Juli 2026',
    location: 'Liberté, Hamburg',
    style: 'kinetic',
    styleLabel: 'Kinetic · bewegt',
    config: 'Standard + alle Bereiche · 23 €/Monat',
    url: 'sarah-iver.sarahiver.de',
    tagline: 'Marquees, Ticker, Bewegung. Unser eigener Tag.',
  },
];
