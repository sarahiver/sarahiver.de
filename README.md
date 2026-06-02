# Hero Refactor v2 — 8 Stile × 3 Variants = 24 Renderings

Erste komplette Bereich-Migration auf das neue Design-System.

## Was hier drin ist

```
src/components/bereiche/Hero/
├── HeroVariantA.tsx        ← Centered Statement / Bento / Marquee
├── HeroVariantB.tsx        ← Split Editorial / Documentary
└── HeroVariantC.tsx        ← Full Bleed / Cinematic / Inverted

src/app/
└── hero-v2.css             ← AN globals.css anhängen
```

## Installation

1. **Drei Hero-Komponenten ersetzen** in `src/components/bereiche/Hero/`
2. **`hero-v2.css`** Inhalt ans Ende von `src/app/globals.css` anhängen (nach decoration-extras.css)

## Was diese Architektur leistet

Anstatt 24 separate Komponenten zu bauen, gibt es nur **3 React-Komponenten** — eine pro Variant. Jede Komponente:

- Liest `start_style_id` aus tokens
- Rendert ein **gemeinsames HTML-Skelett** mit semantischen Klassen (`.hero-a`, `.hero-b-title`, etc.)
- Bindet **konditional Decoration-Subkomponenten** ein je Stil
- Übergibt den Stil über `data-style-hero="..."` Attribute

Den schweren Lift macht **CSS in `hero-v2.css`**. Pro Variant gibt es 8 Stil-Blöcke:

```css
.hero-a[data-style-hero="editorial"] { /* Bento-Cover */ }
.hero-a[data-style-hero="brutalist"] { /* Marquee + 3D-Card */ }
.hero-a[data-style-hero="organic"]   { /* Goo-Blob-Komposition */ }
/* ... */
```

## Was sich pro Variant unterscheidet

| Variant | Layout-DNA | Beispiel pro Stil |
|---|---|---|
| **A** | Centered / Statement | Editorial: Bento mit Bild + Text · Brutalist: 3D-Marquee + Photo-Card · Organic: Blob-Mask-Portrait · Mono: Bento mit Bild + Info-Cells · Opulent: Gold-Frame-Card · Liquefy: 2-Col mit Liquid-Mercury-Bild · Kinetic: Tilted-Photo + große Display-Typo · Bauhaus: Photo mit Navy-Border + Display |
| **B** | Split | Bild auf einer Seite, Text auf der anderen. Pro Stil andere Bild-Behandlung (Editorial: Magazine, Brutalist: Hard-Border, Organic: Blob-Mask, Mono: Photo-Caption, Opulent: Gold-Frame, Liquefy: Liquid-Mercury, Kinetic: Yellow-Shadow-Tilt, Bauhaus: Navy-Border) |
| **C** | Full Bleed | Vollformat-Bild als Background, Text als Overlay. Brutalist: Counter-Marquees + S/W-Bild. Liquefy: Bild durch Acid-Melt-Filter. Bauhaus: Asymmetrisches Bild + Geometric Shapes. |

## Datenkompatibilität

Die Komponenten lesen exakt die gleichen Felder wie vorher:
- `tokens.couple_name_1`, `tokens.couple_name_2`
- `tokens.wedding_date`, `tokens.wedding_location`
- `tokens.hero_image_url`
- `tokens.start_style_id` (NEU: bestimmt das Rendering)
- `content.eyebrow`
- `content.intro` (NEU verwendet in Variant B)

Keine DB-Änderung nötig — alle Daten kommen aus den bestehenden Spalten.

## Editor-Integration

Alle editierbaren Felder behalten ihre `data-editable` und `data-edit-type` Attribute, damit das Dashboard-Inline-Editing weiter funktioniert.

## Was du erwarten kannst

Nach Deployment:
- Alle 4 bestehenden Hochzeitsseiten (alle auf `editorial` durch die Migration gemappt) zeigen die neue Editorial-Hero-Komposition
- Du kannst im Dashboard zu anderen Stilen wechseln und sehen, wie sich der Hero radikal anders rendert
- Variants A/B/C wechseln zwischen Centered/Split/Bleed-Layouts

## Bekannte Limitierungen / Tradeoffs

- **Variant C Liquefy** filtert das Vollformat-Bild durch `#brutal-melt` — das kann auf schwächeren Geräten ruckeln. Wenn problematisch, fallen wir auf eine `<DecorationLiquefyBlob>` als Center-Element zurück.
- **Variant C Opulent** nutzt animated `background-clip: text` Gradient — funktioniert in Chrome/Firefox/Safari, aber nicht in alten Browsern (graceful fallback: text in `var(--ink)`).
- **Mouse-Tracking 3D-Tilt** (aus dem Mockup für Brutalist B / Opulent B) ist hier **noch nicht aktiviert**. Wenn du das willst, brauchen wir ein 'use client' Wrapper-Component. Sag Bescheid, dann ergänze ich das gezielt.

## Was als nächstes ansteht

Nach Hero kommen 14 weitere Bereiche. Vorschlag-Reihenfolge nach Wichtigkeit:

1. RSVP (Kern-Funktion)
2. Countdown
3. Lovestory
4. Gallery
5. Timeline
6. FAQ
7. WeddingABC
8. Witnesses
9. Accommodations
10. Directions
11. Gifts
12. Guestbook
13. Musicwishes
14. PhotoUpload

Bei jedem Bereich folgen wir der gleichen Architektur:
- 3 Komponenten (A/B/C)
- HTML-Skelett mit semantischen Klassen
- CSS-Append mit 8 Stil-Blöcken pro Variant
