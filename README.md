# sarahiver.de — Marketing & Waitlist Site (v3)

Pre-Launch Landing Page für die Self-Service-Hochzeitsseiten-Plattform für den DACH-Raum.

## Stack

- **Next.js 15** (App Router, RSC + Client Components)
- **React 19**
- **TypeScript 5** (strict)
- **Tailwind CSS v4** (@theme tokens, no PostCSS legacy)
- **Brevo** (für Waitlist-Anmeldung)
- **Fraunces + Inter + Caveat + DM Mono** (Google Fonts)

## Was v3 vs. v2 unterscheidet

Zwei neue Sektionen, Vokabular-Umstellung, DNA-System im Customizer:

| Bereich | v2 | v3 |
|---------|----|----|
| Sektionen | 8 + Print | **10 Sektionen** (+ Examples + Structure) |
| UI-Wortwahl | "Komponente" | **"Bereich"** durchgängig |
| Customizer | Theme-Wechsel | **DNA-System** (Layout, Spacing, Decor pro Stil) |
| Demo-Beispiele | fehlten | **4 Demo-Hochzeiten** mit echten Subdomain-Links |
| Aufbau-Erklärung | fehlte | **Structure-Sektion** mit allen 9 Bereichen |

## Sektions-Reihenfolge

1. **Hero** — Email-Sammlung + Pre-Launch-Hint, Julia-Tom-Demo-Mockup
2. **Features** — 6 Werkzeuge (RSVP, Gästeliste, Anpassbar, Privacy, EN/DE, Hosting)
3. **Examples** — 4 Demo-Hochzeiten (Featured + 3 Compact)
4. **Structure** — 9 Bereiche erklärt (4 Basis sage-akzentuiert + 5 Zusatz)
5. **Customizer** — Baukasten mit 4 Schritten + Live-Preview (DNA-basiert)
6. **Print** — PDF-Vorlagen kostenlos + 300€ Done-For-You
7. **How** — 3 Schritte mit Caveat-Tips
8. **Pricing** — Konfigurator (Basis 19€ + 0/4/7/9/11/13/15 Aufpreis)
9. **Voices** — 2 Beta-Stimmen + 9,4/10 Empfehlungswahrscheinlichkeit
10. **FAQ** — Accordion mit 8 Fragen
11. **CTA** — Finale Email-Sammlung in dark-warm

## DNA-System (Customizer)

Jeder Start-Stil hat eigene "DNA" — beim Wechsel ändert sich nicht nur die Farbe:

| Stil | Alignment | Spacing | Decor | Schrift |
|------|-----------|---------|-------|---------|
| Klassisch | center | regular | rule (Linie + Punkt) | Fraunces |
| Modern | left | airy | none | Inter Bold |
| Floral | center | regular | sprig (Ranken) | Fraunces Italic |
| Minimal | left | wide | hairline | DM Mono |
| Festlich | center | tight | gold | Fraunces 700 |

Siehe `src/lib/customizer.ts`.

## Setup

### 1. Dependencies installieren

```bash
npm install
```

### 2. Environment-Variablen

Kopiere `.env.example` zu `.env.local` und fülle die Werte:

```bash
BREVO_API_KEY=xkeysib-...
BREVO_WAITLIST_LIST_ID=42
```

**Brevo-Setup:**
1. Bei Brevo eine neue Kontaktliste anlegen: `sarahiver-de-waitlist`
2. List-ID kopieren (`Contacts → Lists`)
3. API-Key erstellen (`Settings → SMTP & API → API Keys`)

### 3. Dev-Server

```bash
npm run dev
```

Lokal unter http://localhost:3000

### 4. Production-Build

```bash
npm run build
npm start
```

## Deployment auf Vercel

```bash
vercel deploy --prod
```

**Wichtig:** Environment-Variablen im Vercel-Dashboard setzen. `BREVO_API_KEY` sollte als **Sensitive** markiert sein.

## Domain-Setup

- Hauptdomain: `sarahiver.de`
- Demo-Subdomains (zukünftig): `julia-tom.sarahiver.de`, `anna-und-lukas.sarahiver.de`, `mia-und-noah.sarahiver.de`, `elena-und-felix.sarahiver.de`

Demo-Subdomains werden im `si-wedding-themes`-System angelegt. Bis dahin führen die Links auf 404.

## File Structure

```
src/
├── app/
│   ├── api/waitlist/route.ts    # Brevo-Integration
│   ├── datenschutz/page.tsx
│   ├── impressum/page.tsx
│   ├── globals.css              # Tailwind v4 + @theme tokens
│   ├── layout.tsx
│   ├── page.tsx                 # Landing (11 Sektionen)
│   └── sitemap.ts
├── components/
│   ├── layout/                  # Sidebar, MobileNav, Footer
│   ├── sections/                # 11 Sektions-Komponenten
│   └── ui/                      # Section-Wrapper, WaitlistForm
└── lib/
    ├── bereiche.ts              # 9 Bereiche (4 basis + 5 zusatz)
    ├── content.ts               # Zentrale Copy-Datei
    ├── customizer.ts            # DNA-System (Paletten, Schriften, Stile)
    ├── demos.ts                 # 4 Demo-Hochzeiten
    └── pricing.ts               # Volumen-Rabatt (4-7-9-11-13-15)
```

## Roadmap nach Launch

- [ ] Echte Demo-Subdomains im `si-wedding-themes`-System
- [ ] 90-Sek Demo-Video für Hero (Loom/Riverside)
- [ ] OG-Image
- [ ] favicon.ico
- [ ] Vollständiges Impressum + Datenschutz
- [ ] EN-Übersetzung (Phase 2 ab 2027)

## Wortwahl-Regel

**Im Code:** `component`, `block`, `tier` sind OK (Dev-Sprache)
**Im UI:** Niemals "Komponente" → immer "Bereich"

| Tech (intern) | Marketing (UI) |
|---------------|----------------|
| Component | Bereich |
| Customizer | Baukasten |
| Plan/Tier | Paket |
| Subscription | Abo |
| Subdomain | Eure Adresse |
| Custom Domain | Eigene Domain |

## License

Proprietary © 2026 sarahiver UG (i. Gr.)
