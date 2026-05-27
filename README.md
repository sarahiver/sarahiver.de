# sarahiver.de — Wedding Site Repo

Multi-Tenant Next.js 15 App, die Hochzeitsseiten via Subdomain ausliefert:

```
sarah-und-iver.sarahiver.de   →   /site/sarah-und-iver
anna-und-lukas.sarahiver.de   →   /site/anna-und-lukas
sarahiver.de                  →   Landing-Verweis auf Marketing-Repo
```

## Stack

- **Next.js 15** (App Router, Server Components)
- **React 19**
- **TypeScript 5** (strict)
- **Tailwind CSS v4**
- **Supabase** (SSR via `@supabase/ssr`)
- **Subdomain-Multi-Tenant** via Middleware

## Architektur

### Datenfluss

```
[Subdomain] → [Middleware] → [/site/[slug] Server Component]
                                      ↓
                              [loadWeddingSite(slug)]
                                      ↓
                          [v_effective_tokens View]
                                      ↓
                      [tokensToCSSVariables(tokens)]
                                      ↓
                      [CSS-Variablen ins <div style>]
                                      ↓
                        [Bereich-Komponenten erben]
```

### Verzeichnis-Struktur

```
src/
├── app/
│   ├── layout.tsx              # Root-Layout mit Google Fonts
│   ├── page.tsx                # Homepage auf sarahiver.de (Hauptdomain)
│   ├── not-found.tsx           # 404
│   ├── globals.css             # Tailwind v4 + Token-Defaults
│   └── site/[slug]/page.tsx    # Multi-Tenant Hochzeitsseite
│
├── components/
│   ├── bereiche/
│   │   └── Hero/
│   │       ├── HeroVariantA.tsx   # Großes Hintergrundbild
│   │       ├── HeroVariantB.tsx   # Bild rechts, Text links
│   │       └── HeroVariantC.tsx   # Polaroid Editorial
│   ├── layout/
│   │   ├── BereichRenderer.tsx    # wählt Variante pro Bereich
│   │   └── BereichPlaceholder.tsx # Stub für not-yet-built
│   └── ui/
│       └── Decor.tsx              # Decor je nach DNA (sprig/gold/rule/...)
│
├── lib/
│   ├── supabase-server.ts      # Supabase-Client (SSR)
│   ├── tokens.ts                # Token-Loader + CSS-Variable-Generator
│   └── dna-context.tsx          # DnaProvider + useDna() für Client Components
│
├── types/
│   └── supabase.ts              # TypeScript-Types fürs Schema
│
└── middleware.ts                # Subdomain → /site/[slug] Rewrite
```

## Wie eine Hochzeitsseite gerendert wird

1. **Middleware** fängt `sarah-und-iver.sarahiver.de` ab
2. Rewrite zu `/site/sarah-und-iver`
3. **Server Component** in `app/site/[slug]/page.tsx`:
   - Lädt `v_effective_tokens` für den Slug
   - Lädt alle aktiven `wedding_bereiche` der Seite
   - Generiert CSS-Variablen via `tokensToCSSVariables()`
   - Wrappt alles in `<div style={cssVars}>`
   - Wrappt mit `<DnaProvider>` für Client-Components
4. **BereichRenderer** wählt für jeden Bereich die richtige Komponente
   basierend auf `bereich_key` + `variant`
5. **Background-Rhythmus** via `getBereichBackground(index, key, isLast)`:
   - Bereich 0 (Hero): `--bg`
   - Bereich 1: `--bg-soft`
   - Bereich 2: `--bg`
   - …
   - Featured (`lovestory`, `gifts`): immer `--bg-soft`
   - Letzter Bereich: immer `--bg`

## Token-System

Jede Bereich-Komponente nutzt AUSSCHLIESSLICH CSS-Variablen:

```tsx
// ✅ RICHTIG
<h1 style={{ color: 'var(--accent-deep)', fontFamily: 'var(--font-display)' }}>

// ❌ FALSCH
<h1 className="text-[#8E574E] font-serif">
```

Verfügbare Token (kommen aus Supabase + werden injiziert):

```
--bg            Hauptfläche-Hintergrund
--bg-soft       Sekundär-Hintergrund (alternierende Sektionen)
--accent        Primärer Akzent (Buttons, Icons, "&"-Symbol)
--accent-deep   Tiefer Akzent (Headlines, Borders)
--ink           Haupttext
--ink-soft      Sekundär-Text (auto-berechnet)
--muted         Tertiär-Text (auto-berechnet)
--border        Standard-Border (auto-berechnet)
--border-soft   Subtile Border (auto-berechnet)

--font-display  Headlines
--font-body     Fließtext
--font-script   Handschrift-Akzente (Caveat)
--font-mono     Eyebrows, Tags

--align         center | left
--spacing       tight | regular | airy | wide
--decor         none | rule | sprig | hairline | gold
--contrast      warm | clean | soft | neutral | high
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
- `NEXT_PUBLIC_APP_DOMAIN` — `sarahiver.de` (oder lokaler Wert)

### 3. Dev-Server

```bash
npm run dev
```

Zwei Wege zum Testen:

**A) Mit lokalem Subdomain-Setup:**
- Trage in `/etc/hosts` ein: `127.0.0.1 sarah-und-iver-demo.sarahiver.local`
- Setze `NEXT_PUBLIC_APP_DOMAIN=sarahiver.local`
- Browse zu `http://sarah-und-iver-demo.sarahiver.local:3000`

**B) Mit Query-Param (einfacher für Dev):**
- Browse zu `http://localhost:3000?slug=sarah-und-iver-demo`
- Middleware rewriting nutzt automatisch den Slug

### 4. Production-Build

```bash
npm run build && npm start
```

## Deployment auf Vercel

```bash
vercel
```

### Domain-Setup in Vercel

1. Project Settings → Domains → Add Domain
2. Hauptdomain: `sarahiver.de`
3. **Wildcard:** `*.sarahiver.de` (Wedding-Subdomains)
4. DNS bei deinem Registrar:
   - `A` Record: `sarahiver.de` → Vercel IPs
   - `CNAME` Record: `*.sarahiver.de` → `cname.vercel-dns.com`

### Environment Variables in Vercel

- `NEXT_PUBLIC_SUPABASE_URL` ✅ (visible)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ (visible)
- `NEXT_PUBLIC_APP_DOMAIN` = `sarahiver.de`
- `SUPABASE_SERVICE_ROLE_KEY` 🔒 (Sensitive)

## Komponenten-Status

| Bereich | Variante A | Variante B | Variante C |
|---------|------------|------------|------------|
| Hero | ⚠️ Stub | ⚠️ Stub | ⚠️ Stub |
| RSVP | ⏳ Open | ⏳ Open | ⏳ Open |
| Timeline | ⏳ Open | ⏳ Open | ⏳ Open |
| Infos | ⏳ Open | ⏳ Open | ⏳ Open |
| Lovestory | ⏳ Open | ⏳ Open | ⏳ Open |
| Galerie | ⏳ Open | ⏳ Open | ⏳ Open |
| Foto-Upload | ⏳ Open | ⏳ Open | ⏳ Open |
| Geschenke | ⏳ Open | ⏳ Open | ⏳ Open |
| Übernachtung | ⏳ Open | ⏳ Open | ⏳ Open |
| Countdown | ⏳ Open | ⏳ Open | ⏳ Open |
| Gästebuch | ⏳ Open | ⏳ Open | ⏳ Open |
| FAQ | ⏳ Open | ⏳ Open | ⏳ Open |
| Musikwünsche | ⏳ Open | ⏳ Open | ⏳ Open |
| Trauzeugen | ⏳ Open | ⏳ Open | ⏳ Open |
| Hochzeits-ABC | ⏳ Open | ⏳ Open | ⏳ Open |

⚠️ Stub = funktioniert, aber rudimentäres Design (warten auf Claude-Design-Output)
⏳ Open = noch nicht angefangen

## Roadmap

- [ ] Hero-Komponenten via Claude Design final designen
- [ ] RSVP mit Supabase-Insert (Form-Backend)
- [ ] Galerie mit Cloudinary-Upload
- [ ] PhotoUpload mit Supabase-Storage + Approval
- [ ] Customer-Dashboard (separates `/dashboard` Subdomain oder eigenes Repo)
- [ ] Editor-Mode (`?edit=true` zeigt editierbare Felder visuell)

## License

Proprietary © 2026 sarahiver UG (i. Gr.)
