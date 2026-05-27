# sarahiver.de — Marketing & Waitlist Site (v4)

Pre-Launch Landing Page für die Self-Service-Hochzeitsseiten-Plattform für den DACH-Raum.

## Was v4 anders macht als v3

Diese Iteration fokussiert auf Reviewer-Feedback + Mobile-Tauglichkeit:

| # | Change | Begründung |
|---|--------|-----------|
| 1 | **Bereich-Katalog auf 15 erweitert** (4 Basis + 11 Zusatz) | Analog zum si-wedding-themes Repo |
| 2 | **Customizer-Live-Preview entfernt** → Coming-Soon-Placeholder | Reviewer: kollabiert auf Mobile |
| 3 | **Customizer mobile-tauglich** mit Summary-Card statt Split-Screen | Reviewer: Mobile-First |
| 4 | **Pricing: Laufzeit-Erklärung** (12 Monate / 18 Monate / Archiv) | Reviewer: Abo-Falle-Reflex |
| 5 | **Pricing: Streichpreis-Logik** sichtbar (z.B. "~~28€~~ 19€") | Reviewer: Rabatt-Beweis |
| 6 | **Pricing: Gesamtkosten-Anzeige** über 12 Monate | Reviewer: Transparenz |
| 7 | **Bereich-Empfehlungen pro Start-Stil** | Reviewer: Choice Overload lösen |
| 8 | **Redundanz "je mehr desto günstiger"** nur noch 1× | Reviewer: IA |
| 9 | **Volume-Discount-Tabelle erweitert** für 11 Bereiche | Notwendig durch #1 |
| 10 | **FAQ: neue Frage zu Abo-Modell** ganz oben | Reviewer: Transparenz |

### Was bewusst NICHT geändert wurde

- **Recurring Subscription beibehalten** (SaaS-Bewertung, RankBrief-Konsistenz)
- **Hero-Mockup** weiterhin als fertige Hochzeitsseite (Entscheidung User)
- **Modulares Bereich-System** (Differenzierung vs. Joy/Zola)

## Stack

- **Next.js 15** (App Router, RSC + Client Components)
- **React 19**
- **TypeScript 5** (strict)
- **Tailwind CSS v4** (@theme tokens)
- **Brevo** für Waitlist
- **Fraunces + Inter + Caveat + DM Mono** (Google Fonts)

## Sektions-Reihenfolge

1. **Hero** — Email-Sammlung + Pre-Launch-Hint, Julia-Tom-Demo-Mockup
2. **Features** — 6 Werkzeuge
3. **Examples** — 4 Demo-Hochzeiten
4. **Structure** — **15 Bereiche** erklärt (4 Basis + 11 Zusatz)
5. **Customizer** — Baukasten ohne fragile Live-Preview, mit Empfehlungen pro Stil
6. **Print** — PDF kostenlos + 300€ Done-For-You
7. **How** — 3 Schritte
8. **Pricing** — Konfigurator mit Streichpreis + Laufzeit-Erklärung
9. **Voices** — Beta-Stimmen
10. **FAQ** — 9 Fragen (neu: Abo-Frage ganz oben)
11. **CTA** — Finale Email-Sammlung

## Bereich-Katalog (15 total)

**4 Basis-Bereiche (immer dabei):**
- Hero, RSVP, Timeline, Infos

**11 Zusatz-Bereiche (frei wählbar):**
- Lovestory ⭐, Galerie, Foto-Upload, Geschenke ⭐, Übernachtung, Countdown,
  Gästebuch, FAQ, Musikwünsche, Trauzeugen, Hochzeits-ABC

Namen synchron mit `si-wedding-themes` Repo (Hero.js, RSVP.js, Timeline.js, ...).

## Pricing-Tabelle (Volume Discount)

| # Zusatz | Aufpreis | Gesamt/Monat | 12-Monate-Total |
|----------|----------|--------------|-----------------|
| 0 | – | 19€ | 228€ |
| 1 | +4€ | 23€ | 276€ |
| 2 | +7€ | 26€ | 312€ |
| 3 | +9€ ⭐ | 28€ | 336€ |
| 4 | +11€ | 30€ | 360€ |
| 5 | +13€ | 32€ | 384€ |
| 6 | +15€ | 34€ | 408€ |
| 7 | +17€ | 36€ | 432€ |
| **8+** | **+20€ (Cap)** | **39€** | **468€** |

## Setup

```bash
npm install
cp .env.example .env.local
# BREVO_API_KEY + BREVO_WAITLIST_LIST_ID eintragen
npm run dev
```

Build:
```bash
npm run build && npm start
```

## Bereich-Empfehlungen pro Start-Stil

Definiert in `src/lib/customizer.ts` — `recommendedBereiche`:

| Stil | Empfohlene Zusatz-Bereiche | Anzahl |
|------|---------------------------|--------|
| Klassisch & Warm | Lovestory, Galerie, Übernachtung, Geschenke, FAQ | 5 |
| Modern & Klar | Lovestory, Foto-Upload, Geschenke, Musikwünsche | 4 |
| Verspielt & Floral | Lovestory, Galerie, Gästebuch, Geschenke, Hochzeits-ABC | 5 |
| Minimal & Ruhig | Countdown, Geschenke, FAQ | 3 |
| Bold & Festlich | Lovestory, Galerie, Foto-Upload, Geschenke, Übernachtung, Trauzeugen, Musikwünsche | 7 |

Diese Empfehlung wird in Step 4 ("Bereiche") automatisch vorgewählt — User kann ergänzen oder abwählen.

## File Structure

```
src/
├── app/
│   ├── api/waitlist/route.ts
│   ├── datenschutz/page.tsx
│   ├── impressum/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── sitemap.ts
├── components/
│   ├── layout/
│   ├── sections/  (11 Sektionen)
│   └── ui/
└── lib/
    ├── bereiche.ts        (15 Bereiche)
    ├── content.ts          (Copy + Pricing-Terms)
    ├── customizer.ts       (DNA + Empfehlungen)
    ├── demos.ts            (4 Demo-Hochzeiten)
    └── pricing.ts          (Volume Discount + Laufzeit)
```

## Roadmap nach Launch

- [ ] Live-Preview im Customizer einbauen, sobald die echten Bereich-Komponenten fertig sind
- [ ] Hero-Mockup mit Tool-Hint anreichern (Customizer-Tooltip-Overlay)
- [ ] 4 Demo-Subdomains live schalten
- [ ] OG-Image + Favicon
- [ ] EN-Übersetzung (Phase 2 ab 2027)

## License

Proprietary © 2026 sarahiver UG (i. Gr.)
