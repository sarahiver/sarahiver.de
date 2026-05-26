# sarahiver.de — Marketing Site

Pre-Launch-Marketing-Site für die Self-Service-Hochzeitswebsite-SaaS.

## Stack

- **Next.js 15** (App Router) — modern, zukunftssicher
- **TypeScript 5** — Type-Safety, Senior-Portfolio-Standard
- **Tailwind CSS v4** — CSS-First-Config, kein PostCSS-Config-File nötig
- **React 19**
- **Brevo-API** — Waitlist-Anmeldungen

## Lokal entwickeln

```bash
# Dependencies installieren
npm install

# Env-Vars setzen (Datei kopieren und Werte einfügen)
cp .env.example .env.local

# Dev-Server starten
npm run dev
# → http://localhost:3000
```

## Environment Variables

In Vercel Dashboard setzen (Settings → Environment Variables):

| Variable | Beschreibung |
|----------|--------------|
| `BREVO_API_KEY` | API-Schlüssel aus Brevo (Settings → SMTP & API → API Keys) |
| `BREVO_WAITLIST_LIST_ID` | Numerische ID der `sarahiver-de-waitlist` Liste |

**Wichtig:** Bei Vercel auf "Sensitive" markieren (Production + Preview Environments).

## Brevo Setup

1. Im Brevo-Dashboard: neue Liste anlegen → `sarahiver-de-waitlist`
2. Liste-ID notieren (siehe URL oder in Listen-Übersicht)
3. **Double-Opt-In aktivieren:** Settings → Forms → Templates → DOI für die Liste konfigurieren
4. **Sender verifizieren:** `hallo@sarahiver.de` als Sender hinzufügen + DKIM/SPF/DMARC für die Domain einrichten

## Deployment auf Vercel

```bash
# 1. Mit Vercel CLI
npx vercel

# 2. Oder über GitHub:
#    - Push zu GitHub-Repo
#    - In Vercel: "Import Project" → Repo wählen
#    - Custom Domain: sarahiver.de
#    - Env-Vars setzen
```

## Projekt-Struktur

```
src/
├── app/
│   ├── layout.tsx          # Root Layout mit Fonts + Metadata
│   ├── page.tsx            # Landing Page (alle Sektionen)
│   ├── globals.css         # Tailwind + Design Tokens
│   ├── sitemap.ts          # Dynamische Sitemap für SEO
│   ├── api/
│   │   └── waitlist/
│   │       └── route.ts    # Brevo-Integration (POST /api/waitlist)
│   ├── impressum/page.tsx  # Impressum (Platzhalter)
│   └── datenschutz/page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx     # Desktop-Sidebar (≥ 1024px)
│   │   ├── MobileNav.tsx   # Mobile Top-Nav (< 1024px)
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── Hero.tsx        # Hero mit Browser-Mockup
│   │   ├── Features.tsx    # 6 Feature-Cards
│   │   ├── Themes.tsx      # 7 Themes
│   │   ├── HowItWorks.tsx  # 3-Schritte
│   │   ├── Pricing.tsx     # KONFIGURATOR mit Volumen-Rabatt
│   │   ├── Social.tsx      # Testimonials
│   │   ├── Faq.tsx         # FAQ Accordion
│   │   └── Cta.tsx         # Final Waitlist-CTA
│   └── ui/
│       ├── Button.tsx
│       ├── Section.tsx
│       └── WaitlistForm.tsx  # Mit Honeypot-Spam-Schutz
│
└── lib/
    ├── content.ts          # ALLE Texte zentral (leicht editierbar)
    ├── pricing.ts          # Pricing-Logik (Volumen-Rabatt)
    └── addons.ts           # Add-On-Komponenten-Daten
```

## Pricing-Logik

**Basis:** 19€/Monat (4 Core-Components inklusive)

**Add-Ons mit Volumen-Rabatt:**

| Anzahl | Aufpreis | Pro Komponente |
|--------|----------|----------------|
| 1 | +4€ | 4,00€ |
| 2 | +7€ | 3,50€ |
| 3 ⭐ | +9€ | 3,00€ (Sweet Spot) |
| 4 | +11€ | 2,75€ |
| 5 | +13€ | 2,60€ |
| 6+ ⭐ | +15€ flat (Komplett-Cap) |

Logik in `src/lib/pricing.ts` — wiederverwendbar.

## Was zu tun ist vor Launch

- [ ] Echte Impressum-Daten in `src/app/impressum/page.tsx`
- [ ] Vollständige Datenschutzerklärung in `src/app/datenschutz/page.tsx`
- [ ] Brevo-Liste anlegen + Double-Opt-In aktivieren
- [ ] Brevo-Sender `hallo@sarahiver.de` verifizieren
- [ ] Vercel-Projekt erstellen + Domain sarahiver.de connecten
- [ ] Env-Vars in Vercel als "Sensitive" setzen
- [ ] Cookie-Banner einfügen (vor Launch-Marketing-Push)
- [ ] OG-Image für Social-Sharing in `public/og.png` legen
- [ ] Favicon in `public/favicon.ico` legen

## Bekannte TODOs

- Cookie-Banner fehlt noch (für Launch nötig — siehe sarahiver.com als Vorlage)
- OG-Image (1200x630px) fehlt
- Favicon fehlt
- Logo-Asset: Aktuell als Wortmarke "sarahiver.de" gerendert. Falls Logo-Datei später vorhanden, ersetzen in `Sidebar.tsx` und `MobileNav.tsx`.
- Theme-Preview-Bilder: Aktuell SVG-Mockups. Können später durch echte Cloudinary-Bilder ersetzt werden.

## Senior-PM-Lernpunkte (Next.js 15 App Router)

- **Server vs. Client Components:** Sektionen ohne State sind Server-Components (default). Sektionen mit `useState` (Sidebar Scroll-Spy, Pricing-Konfigurator, FAQ-Accordion, Waitlist-Form) brauchen `'use client'` oben.
- **Layout-Pattern:** `app/layout.tsx` wrapped alle Seiten. Sidebar wird aber in `page.tsx` gerendert, nicht im Root-Layout, damit Legal-Pages ohne Sidebar erscheinen.
- **API Routes:** Statt `pages/api/*.ts` jetzt `app/api/*/route.ts` mit `POST/GET`-Exports.
- **Metadata API:** Statt `<Head>` jetzt `export const metadata` pro Page.
