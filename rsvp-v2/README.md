# RSVP Refactor v2 — 8 Stile, alle 3 Variants

Zweite Bereich-Migration auf das Design-System.

## Was im ZIP ist

```
src/components/bereiche/RSVP/
├── RsvpVariantA.tsx     ← überschreiben (data-style-rsvp Attribute + style-Hint)
├── RsvpVariantB.tsx     ← überschreiben
├── RsvpVariantC.tsx     ← überschreiben
└── shared-ui.tsx        ← überschreiben (Decor-Element raus, ornament-Slot rein)

src/app/
└── design-system-v2.css ← überschreiben (kompletter Bundle mit RSVP-Block, 2390 Zeilen)
```

5 Files, alle fertig zum Deploy.

## Was sich geändert hat

### Variant-Komponenten (A, B, C)

Form-Logik, State-Management, Submit-Handler bleibt unverändert. **Eine Code-Änderung** pro Variant:

```diff
  export default function RsvpVariantA({ tokens, content }: Props) {
+   const style =
+     (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
    const config = readConfig(...);
    // ... unveränderter Code
    
-   return <div className="rsvp rsvpA-wrap">
+   return <div className="rsvp rsvpA-wrap" data-style-rsvp={style}>
```

### shared-ui.tsx

Die alte `<Decor />`-Komponente im Header rausgenommen — sie ist ein generisches Ornament, passt nicht zu den 8 Stilen. Stattdessen ein semantischer Slot:

```diff
-   <div className="rsvp-head-decor-wrap">
-     <Decor />
-   </div>
+   <div className="rsvp-head-ornament" aria-hidden="true" />
```

Per CSS pro Stil mit Content gefüllt: Editorial bekommt eine Hairline, Brutalist einen schwarzen Block, Organic ein Blob, Mono `— rsvp:01 —`, Opulent ein Gold-Sternchen, Liquefy eine Liquid-Form, Kinetic einen rotierten Star-Banner, Bauhaus einen roten Kreis + gelbes Rechteck.

### design-system-v2.css

~530 Zeilen neuer RSVP-Stil-Block angehängt. Pro Stil 5 markante Form-Elemente angepasst:

| Stil | Inputs | Toggle | Stepper | Submit | Pills |
|---|---|---|---|---|---|
| **Editorial** | Hairline-bottom, no border | Outline-Variant | Standard | Mono-uppercase | Dezent |
| **Brutalist** | 3px schwarz, Yellow-on-focus | Block + Yellow on | 3px Borders | Yellow + Box-Shadow | 3px Borders |
| **Organic** | Rounded 24px, soft border | Rounded Pills | Round Circles | Italic, rounded pill | Rounded |
| **Mono** | 1px thin border, JetBrains | Square, Mono | Standard | Square Mono | Square Mono |
| **Opulent** | Gold-Border, italic Crimson | Italiana caps | Standard | Gold-Gradient | Italiana |
| **Liquefy** | Rounded 16px, glow on focus | Rounded blocks | Standard | Acid-Mint + Glow | Rounded |
| **Kinetic** | 2px black, Yellow-shadow focus | Tilted on selection | Standard | Tilted + Yellow-Shadow | Standard |
| **Bauhaus** | Bottom-Border navy → red | Solid color blocks | Standard | Navy + Yellow-Tag | Standard |

## Was du nach Deploy siehst

- **Wechsel im StilTab** zwischen den 8 Stilen → RSVP-Form passt Look & Feel komplett an
- **Inputs, Toggles, Buttons** transformieren sich pro Stil
- **Header-Ornament** wechselt entsprechend (Linie, Blob, Stern, Marquee-Text, Geometrie)
- Variants A/B/C behalten ihre Layout-Konzepte (Klassisch / Stepper / Chat), bekommen jetzt aber pro Stil eine eigene visuelle Sprache

## Nicht im Refactor enthalten

- **Layout-DNA der Variants A/B/C** bleibt strukturell wie sie ist. Die "C=Chat" funktioniert in allen 8 Stilen — wäre overkill, das pro Stil noch zu re-architektieren.
- **Custom-Questions Component** nutzt schon Token-Vars im bestehenden CSS, das greift automatisch.

## Verbleibend nach RSVP

13 Bereiche: Countdown, PhotoUpload, Gifts, MusicWishes, Guestbook, Accommodations, Directions, Gallery, Timeline, Witnesses, Lovestory, WeddingABC, FAQ.

Pattern für jeden Bereich folgt dem gleichen Schema:
1. `data-style-X={style}` aufs Wrapper-Top-Element
2. Stil-Hint extrahieren aus tokens
3. CSS-Block mit 8 Stilen ans design-system-v2.css anhängen
4. ggf. Decoration-Subkomponenten konditional einbinden
