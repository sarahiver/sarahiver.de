# sarahiver.de — Marketing + Wedding-Plattform (v5 unified)

**Eine Codebase, ein Vercel-Projekt, eine Domain für alles:**

```
sarahiver.de                    → Marketing-Landing (Hero, Features, Pricing, ...)
sarahiver.de/impressum          → Marketing-Pages (statisch)
sarahiver.de/datenschutz        → Marketing-Pages (statisch)
sarahiver.de/sarah-und-iver     → Hochzeitsseite eines Brautpaars (dynamisch via Slug)
sarahiver.de/julia-tom          → Demo-Hochzeit
sarahiver.de/api/waitlist       → Brevo-API für Warteliste
```

**sarahiver.com** ist das **Premium / Done-for-you-Produkt** und hat mit diesem Repo nichts zu tun.

## Stack

- **Next.js 15** (App Router, Server Components)
- **React 19**
- **TypeScript 5** (strict)
- **Tailwind CSS v4**
- **Supabase** (SSR via `@supabase/ssr`)
- **Brevo** für Wartelisten-Email-Sammlung

## Routing-Architektur

Path-basiert, keine Middleware nötig:

```
/                       → app/page.tsx                 (Marketing-Landing, statisch)
/impressum              → app/impressum/page.tsx       (Marketing, statisch)
/datenschutz            → app/datenschutz/page.tsx     (Marketing, statisch)
/api/waitlist           → app/api/waitlist/route.ts    (API-Route)
/[slug]                 → app/[slug]/page.tsx          (Wedding-Site, dynamisch)
                          └─ Reserved-Slugs werden via isReservedSlug() abgefangen → 404
```

**Wichtig:** Next.js priorisiert statische Routes (`/impressum`) über dynamische (`/[slug]`). Wenn ein Brautpaar versucht, einen reservierten Slug zu nehmen (`impressum`, `pricing`, etc.), greift die Reserved-Words-Liste in `lib/slug-validation.ts`.

## Datenfluss für Hochzeitsseiten

```
User ruft auf:   sarahiver.de/sarah-und-iver
        ↓
Next.js Routing: app/[slug]/page.tsx (slug = "sarah-und-iver")
        ↓
isReservedSlug?  → Wenn ja: 404
                   Wenn nein: weiter
        ↓
loadWeddingSite("sarah-und-iver")
        ↓
Supabase: SELECT * FROM v_effective_tokens WHERE slug = 'sarah-und-iver'
          UND   SELECT * FROM wedding_bereiche ORDER BY display_order
        ↓
tokensToCSSVariables(tokens) → React.CSSProperties
        ↓
<div style={cssVars}>
  <DnaProvider>
    {bereiche.map(BereichRenderer)}
  </DnaProvider>
</div>
```

## Verzeichnis-Struktur

```
src/
├── app/
│   ├── layout.tsx              # Root-Layout mit Google Fonts
│   ├── page.tsx                # Marketing-Landing (v4)
│   ├── not-found.tsx           # 404 (für reserved/unbekannte Slugs)
│   ├── globals.css             # Tailwind v4 + Marketing-Tokens + Wedding-Tokens
│   ├── api/waitlist/route.ts   # Brevo-Integration
│   ├── impressum/page.tsx      # Statische Marketing-Page
│   ├── datenschutz/page.tsx    # Statische Marketing-Page
│   ├── sitemap.ts              # SEO-Sitemap
│   └── [slug]/page.tsx         # Dynamische Wedding-Site
│
├── components/
│   ├── bereiche/               # Wedding-Bereich-Komponenten
│   │   └── Hero/
│   │       ├── HeroVariantA.tsx
│   │       ├── HeroVariantB.tsx
│   │       └── HeroVariantC.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx          # Marketing-Sidebar (Desktop)
│   │   ├── MobileNav.tsx        # Marketing-MobileNav
│   │   ├── Footer.tsx           # Marketing-Footer
│   │   ├── BereichRenderer.tsx  # Wedding: wählt Variante pro Bereich
│   │   └── BereichPlaceholder.tsx # Wedding: Stub für not-yet-built
│   ├── sections/                # Marketing-Sektionen (Hero/Features/Pricing/...)
│   │   └── (alle v4-Sektionen)
│   └── ui/
│       ├── Section.tsx          # Marketing-Wrapper
│       ├── WaitlistForm.tsx     # Marketing-Form (Brevo)
│       └── Decor.tsx            # Wedding-Decor (DNA-basiert)
│
├── lib/
│   ├── bereiche.ts              # Bereiche-Daten (Marketing + Wedding)
│   ├── content.ts               # Marketing-Copy
│   ├── customizer.ts            # DNA-System (Paletten/Schriften/Stile)
│   ├── demos.ts                 # Demo-Hochzeiten für Marketing-Examples
│   ├── pricing.ts               # Marketing-Preis-Logik
│   ├── slug-validation.ts       # Reserved-Words + Slug-Format
│   ├── supabase-server.ts       # Supabase-Client (SSR)
│   ├── tokens.ts                # Token-Loader + CSS-Variable-Generator
│   └── dna-context.tsx          # DnaProvider + useDna() für Client Components
│
└── types/
    └── supabase.ts              # TypeScript-Types fürs Schema
```

## Setup

### 1. Dependencies

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

Fülle ein:
- `NEXT_PUBLIC_SUPABASE_URL` — deine sarahiver.de-Supabase-Projekt-URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon-Key
- `BREVO_API_KEY` — für die Warteliste
- `BREVO_WAITLIST_LIST_ID` — Brevo-List-ID
- `NEXT_PUBLIC_APP_DOMAIN` — `sarahiver.de`

### 3. Dev-Server

```bash
npm run dev
```

Test-URLs lokal:
- http://localhost:3000/ → Marketing-Landing
- http://localhost:3000/sarah-und-iver-demo → Demo-Hochzeit
- http://localhost:3000/impressum → Marketing-Page

### 4. Production-Build

```bash
npm run build && npm start
```

## Deployment auf Vercel

```bash
vercel
```

Environment Variables im Vercel-Dashboard setzen (alle aus `.env.example`).

**Domain-Setup (nach 04.07.2026):**
1. Vercel Settings → Domains → Add `sarahiver.de`
2. DNS bei deinem Registrar: A-Record auf Vercel-IP (zeigt Vercel an)
3. Auto-HTTPS funktioniert sofort

**Keine Wildcard-DNS nötig** — wir nutzen Path-basiertes Multi-Tenant statt Subdomain.

## Reserved Slugs

Folgende Wörter dürfen NICHT als Hochzeit-Slug verwendet werden (in `lib/slug-validation.ts`):

- Marketing-Pages: `impressum`, `datenschutz`, `agb`, `kontakt`
- System-Routes: `api`, `admin`, `dashboard`, `login`, `auth`
- Static Assets: `static`, `_next`, `public`, `favicon`
- Häufige Konflikte: `pricing`, `features`, `baukasten`, `demo`
- Vollständige Liste in `src/lib/slug-validation.ts`

## Komponenten-Status

**Marketing-Sektionen (v4, alle fertig):**
- Hero, Features, Examples, Structure, Customizer, Print, How, Pricing, Voices, FAQ, CTA

**Wedding-Bereich-Komponenten:**

| Bereich | Variante A | Variante B | Variante C |
|---------|------------|------------|------------|
| Hero | ⚠️ Stub | ⚠️ Stub | ⚠️ Stub |
| RSVP | ⏳ Open | ⏳ Open | ⏳ Open |
| Timeline | ⏳ Open | ⏳ Open | ⏳ Open |
| Infos | ⏳ Open | ⏳ Open | ⏳ Open |
| Lovestory | ⏳ Open | ⏳ Open | ⏳ Open |
| ... (11 weitere) | ⏳ Open | ⏳ Open | ⏳ Open |

## Roadmap

- [ ] Hero-Design finalisieren (via Claude Design)
- [ ] RSVP-Komponente mit Form-Submit zu Supabase
- [ ] Customer-Dashboard für Brautpaare (auf eigener Route `/dashboard`)
- [ ] Auth-Flow (Email + Magic-Link via Supabase Auth)
- [ ] OG-Image-Generator pro Hochzeit
- [ ] EN-Übersetzung (Phase 2 ab 2027)

## License

Proprietary © 2026 sarahiver UG (i. Gr.)
