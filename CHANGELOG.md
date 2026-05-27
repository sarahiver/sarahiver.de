# Patch: Countdown — alle 3 Varianten produktionsfertig

## ⚠️ WICHTIG: Reihenfolge

**Erst SQL ausführen, DANN Code deployen.** Sonst gibt's Build-Errors weil das Type-System wedding_date als TIMESTAMP erwartet.

## SQL-Patches (in dieser Reihenfolge)

1. **`supabase-wedding-date-to-timestamp.sql`** — migriert wedding_date von DATE auf TIMESTAMPTZ, re-erstellt die View
2. **`supabase-add-countdown-bereich.sql`** — fügt Countdown-Bereich zu allen 3 Demo-Sites hinzu (Variant A/B/C)

## Geänderte Dateien

| Datei | Was |
|-------|-----|
| `src/app/globals.css` | +Flip-Card CSS für Variante B (3D-Animation) |
| `src/app/[slug]/page.tsx` | +`data-style` Attribut auf Wrapper für CSS-Stilselektoren |
| `src/components/bereiche/Countdown/CountdownVariantA.tsx` | NEU — Number-Grid |
| `src/components/bereiche/Countdown/CountdownVariantB.tsx` | NEU — Split-Flap mit 3D-Animation |
| `src/components/bereiche/Countdown/CountdownVariantC.tsx` | NEU — Zeitstrahl (Bars) |
| `src/components/bereiche/Countdown/use-countdown.ts` | NEU — Hook für Live-Ticking |
| `src/components/layout/BereichRenderer.tsx` | +Countdown-Routing |
| `src/lib/countdown.ts` | NEU — Berechnungs-Logik + formatDateStamp |
| `src/lib/defaults.ts` | NEU — globale Default-Texte (eyebrow, footer, past_text) |

## Test-URLs nach Deploy

```
https://sarahiver-de.vercel.app/sarah-iver-demo-a → Countdown Variant A (Number-Grid)
https://sarahiver-de.vercel.app/sarah-iver-demo-b → Countdown Variant B (Split-Flap mit 3D)
https://sarahiver-de.vercel.app/sarah-iver-demo-c → Countdown Variant C (Bars)
```

## Datenfluss aus Supabase

Alle Daten kommen aus der DB:
- `tokens.wedding_date` → Zielzeitpunkt (TIMESTAMP)
- `content.eyebrow` → optional Override, sonst Default aus `defaults.ts`
- `content.footer` → optional Override, sonst Default aus `defaults.ts`
- `content.past_text` → optional Override (z.B. "Es war wunderschön!")

Brautpaare können später im Dashboard alle Texte überschreiben — Defaults greifen nur wenn nichts gesetzt ist.

## Berechnungs-Formel

Saubere Kalender-Monat-Logik (NICHT die fehlerhafte `% 30 days` Variante). Tests:
- `now` = 27.05.2026 12:00, `target` = 27.06.2026 14:00 → **1 Monat, 0 Tage, 2 Stunden** ✅
- `now` = 27.05.2026 17:00, `target` = 27.06.2026 14:00 → **0 Monate, 30 Tage, 21 Stunden** ✅
