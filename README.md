# Hero-Fix — Debug-Schritte

## Was du im Screenshot zeigst

- Title "Moni & Klaus" in Standard-Schrift (klein, oben links)
- Date "Sonntag, 15. November 2026" als Mini-Text
- Riesiges Location-Icon, das den ganzen Hero ausfüllt
- Navigation darüber (sieht ok aus)

**Das sieht aus wie ungestyltes HTML.** Die Komponenten sind installiert, aber `hero-v2.css` greift nicht.

## Wahrscheinlichste Ursache

Das CSS aus `hero-v2.css` ist **nicht in `globals.css` gelandet**. Bitte prüfe:

```bash
grep -c "hero-a\[data-style-hero" src/app/globals.css
# sollte ≥ 8 ausgeben (für 8 Stile)

grep -c "hero-c-vignette" src/app/globals.css
# sollte ≥ 1 sein
```

Falls 0: `hero-v2.css` Inhalt **vollständig** ans Ende von `src/app/globals.css` anhängen.

Falls > 0 aber Site sieht unstyled aus: schauen ob `globals.css` syntaktisch korrekt ist:
- Browser DevTools → Sources → globals.css aufmachen
- Mit Ctrl+F nach `hero-a` suchen
- Wenn die Regeln da sind aber im Element-Inspector grau/durchgestrichen: CSS-Fehler weiter oben hat den Parser abgebrochen

## Zweiter Fix in diesem ZIP: SVG-Größen

Auch wenn das CSS greift — das Location-SVG hatte kein explizites `width`/`height` Attribute, nur CSS. In Server-Rendering interpretieren manche Browser SVG ohne diese Attribute als full-block. Behoben: das SVG hat jetzt `width="12" height="12"` direkt am Tag.

## Was tun

1. **Erstmal:** `grep -c "hero-a\[data-style-hero" src/app/globals.css` — Output melden
2. **Wenn 0:** `hero-v2.css` an globals.css anhängen (kompletter Inhalt)
3. **Diese 3 Files installieren** (haben den SVG-Fix), egal ob CSS-Problem oder nicht:
   - `src/components/bereiche/Hero/HeroVariantA.tsx`
   - `src/components/bereiche/Hero/HeroVariantB.tsx`
   - `src/components/bereiche/Hero/HeroVariantC.tsx`

## Falls's nach CSS-Append immer noch kaputt ist

Möglich, dass Tailwind's `@layer` die Spezifität meiner Selektoren killt. Falls das CSS angehängt ist und Element-Inspector zeigt die Regeln aber sie sind durchgestrichen, wickel meinen ganzen Block am Ende der globals.css in:

```css
@layer utilities {
  /* ... mein ganzer Block ... */
}
```

Damit zwingt man Tailwind, die Regeln als utility-layer zu nehmen (höchste Spezifität).
