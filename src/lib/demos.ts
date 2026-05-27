/**
 * Demo-Hochzeiten für die Examples-Sektion.
 *
 * Diese fiktiven Brautpaare zeigen, wie eine fertige Hochzeitsseite aussieht.
 * Die URLs sollten als echte Subdomains in eurem si-wedding-themes-System
 * angelegt werden, sodass "Live ansehen" wirklich funktioniert.
 */

export interface DemoWedding {
  id: string;
  couple: string;
  date: string;
  location: string;
  start: string; // Verweis auf START_STYLES.id
  config: string;
  url: string; // Subdomain ohne Protokoll
  featured?: boolean;
  tagline: string;
}

export const DEMO_WEDDINGS: DemoWedding[] = [
  {
    id: 'julia-tom',
    couple: 'Julia & Tom',
    date: '12. September 2027',
    location: 'Schloss Wackerbarth, Sachsen',
    start: 'klassisch',
    config: 'Komplettpaket · 9 Bereiche · Sandstein-Palette · Fraunces · 34 € / Monat',
    url: 'julia-tom.sarahiver.de',
    featured: true,
    tagline: 'Klassisch & warm',
  },
  {
    id: 'anna-lukas',
    couple: 'Anna & Lukas',
    date: '27. Juni 2027',
    location: 'Schwarzwald, Forsthaus Sonne',
    start: 'floral',
    config: 'Erweitert · 7 Bereiche · Salbei & Rosé · Fraunces Italic · 28 € / Monat',
    url: 'anna-und-lukas.sarahiver.de',
    tagline: 'Verspielt & floral',
  },
  {
    id: 'mia-noah',
    couple: 'Mia & Noah',
    date: '5. Mai 2027',
    location: 'Speicherstadt, Hamburg',
    start: 'modern',
    config: 'Standard · 5 Bereiche · Olive & Honig · Inter Tight · 25 € / Monat',
    url: 'mia-und-noah.sarahiver.de',
    tagline: 'Modern & klar',
  },
  {
    id: 'elena-felix',
    couple: 'Elena & Felix',
    date: '21. August 2027',
    location: 'München, Bayerischer Hof',
    start: 'festlich',
    config: 'Komplettpaket · 9 Bereiche · Burgund & Creme · Fraunces 700 · 34 € / Monat',
    url: 'elena-und-felix.sarahiver.de',
    tagline: 'Bold & festlich',
  },
];
