# CSS Einbindung Fix

## Problem

Du hast die CSS-Dateien (`globals-append.css`, `decoration-extras.css`, `hero-v2.css`) in den `src/app/`-Ordner deployed, aber Next.js bindet sie nicht automatisch ein. Sie liegen rum, ohne dass jemand sie importiert.

Deshalb: ungestyltes HTML, riesige SVGs, kein Layout.

## Lösung

Ich habe alle 3 CSS-Dateien zu **einer Datei** kombiniert (`design-system-v2.css`, 1864 Zeilen) und füge in `layout.tsx` einen einzigen `import` hinzu.

## Was im ZIP ist

```
src/app/
├── design-system-v2.css   ← NEU: kombiniertes CSS-Bundle
└── layout.tsx             ← ÜBERSCHREIBEN: 1 Zeile dazu
```

## Was du machst

1. **`design-system-v2.css`** nach `src/app/` kopieren (neue Datei)
2. **`layout.tsx`** ersetzt das bestehende `src/app/layout.tsx`

Die einzige Code-Änderung in layout.tsx:

```diff
  import type { Metadata } from 'next';
  import './globals.css';
+ import './design-system-v2.css';
  import { SITE_CONFIG } from '@/lib/content';
```

Alles andere in layout.tsx ist identisch zur bestehenden Version.

## Aufräumen (optional)

Die alten Einzeldateien kannst du löschen, sie werden nicht mehr gebraucht:
- `src/app/globals-append.css` (sofern vorhanden)
- `src/app/decoration-extras.css` (sofern vorhanden)
- `src/app/hero-v2.css` (sofern vorhanden)

Wenn sie da bleiben, schadet das nichts — sie werden einfach nicht geladen.

## Nach Deploy

Hero sollte jetzt komplett gestyled aussehen:
- Background-Image mit Vignette
- Display-Title in der Stil-spezifischen Schrift
- SVG-Pin auf 12px (klein, links neben dem Ortsnamen)
- Layout-Hierarchie steht
