# Decoration Components — Phase 2.1

8 wiederverwendbare Decoration-Komponenten als Bausteine für die Stil-spezifischen Bereich-Renderings.

## Was hier drin ist

```
src/components/decoration/
├── DecorationGoo.tsx              ← Organic (5 driftende Goo-Blobs)
├── DecorationAurora.tsx           ← Opulent (radial-gradient Aurora)
├── DecorationStars.tsx            ← Opulent (Gold-Sprenkel-Pattern)
├── DecorationMarquee.tsx          ← Brutalist (Endless Marquee + optional 3D-Z-Tilt)
├── DecorationKineticBg.tsx        ← Kinetic (Diagonal -15° Marquee Background)
├── DecorationBauhausShapes.tsx    ← Bauhaus (Circle + Rect + Triangle)
├── DecorationGrain.tsx            ← Editorial + Organic (Film-Grain-Overlay)
└── DecorationLiquefyBlob.tsx      ← Liquefy (Acid-Melt-Wrapper)

src/app/
└── decoration-extras.css          ← AN globals.css anhängen (Goo-Blob-Positionen)
```

## Installation

1. **Alle .tsx-Files** nach `src/components/decoration/` kopieren (Folder ist nach Foundation-Migration bereits da, enthält schon `DecorationFilters.tsx`)
2. **`decoration-extras.css`** Inhalt ans **Ende** deiner bestehenden `src/app/globals.css` anhängen (nach dem v2-globals-append-Block)

## Verwendung in Bereich-Komponenten

Beispiel-Pattern, wie eine Hero-Variant die Decorations konditional einsetzt:

```tsx
import DecorationGoo from '@/components/decoration/DecorationGoo';
import DecorationAurora from '@/components/decoration/DecorationAurora';
import DecorationStars from '@/components/decoration/DecorationStars';
import DecorationGrain from '@/components/decoration/DecorationGrain';
import DecorationBauhausShapes from '@/components/decoration/DecorationBauhausShapes';
import DecorationMarquee from '@/components/decoration/DecorationMarquee';
import DecorationKineticBg from '@/components/decoration/DecorationKineticBg';
import DecorationLiquefyBlob from '@/components/decoration/DecorationLiquefyBlob';

export default function HeroVariantA({ tokens, content }) {
  const style = tokens.start_style_id;
  const coupleNames = `${tokens.couple_name_1} & ${tokens.couple_name_2}`;
  
  return (
    <div className="hero-a" data-style-hero={style}>
      {/* Stil-spezifische Background-Decorations */}
      {style === 'editorial' && <DecorationGrain />}
      {style === 'organic'   && <DecorationGoo />}
      {style === 'opulent'   && (
        <>
          <DecorationAurora />
          <DecorationStars />
        </>
      )}
      {style === 'kinetic'   && (
        <DecorationKineticBg 
          text={`${coupleNames} Wedding Hamburg ${formattedDate}`}
        />
      )}
      {style === 'bauhaus'   && <DecorationBauhausShapes />}
      
      {/* Liquefy: Bild im Wrapper */}
      {style === 'liquefy' ? (
        <DecorationLiquefyBlob size="lg" shape="circle">
          <div 
            className="liquefy-blob-img"
            style={{ backgroundImage: 'var(--img-square)', backgroundSize: 'cover' }}
          />
        </DecorationLiquefyBlob>
      ) : (
        <img src={tokens.hero_image_url} alt="" />
      )}
      
      {/* Brutalist: Marquee als Hauptkomposition */}
      {style === 'brutalist' && (
        <DecorationMarquee 
          text={coupleNames}
          tilt="3d"
          fontSize="clamp(100px, 16vw, 240px)"
        />
      )}
      
      <div className="hero-a-content">
        <h1 className="display">{coupleNames}</h1>
        {/* ... gemeinsamer Content */}
      </div>
    </div>
  );
}
```

## Props-Übersicht

### DecorationGoo
- `intensity?: 'soft' | 'normal'` (Default: normal — 5 Blobs)
- `zIndex?: number` (Default: 0)

### DecorationAurora
- `intensity?: 'soft' | 'normal' | 'strong'`
- `blendMode?: 'normal' | 'screen' | 'overlay'` (für Bleed-Layouts auf Bild)
- `zIndex?: number`

### DecorationStars
- `density?: 'sparse' | 'normal' | 'dense'` (6 / 10 / 16 Stars)
- `zIndex?: number`

### DecorationMarquee
- `text: string` (Pflicht)
- `speed?: number` (sek pro Loop, default 22)
- `direction?: 'normal' | 'reverse'`
- `tilt?: 'none' | '3d'` (für Brutalist-Z-Tilt)
- `fontSize?: string`
- `separator?: string` (Default ` — `)

### DecorationKineticBg
- `text: string` (Pflicht)
- `rotation?: number` (deg, default -15)
- `speed?: number` (sek, default 18)
- `opacity?: number` (default 0.1)
- `fontSize?: string`
- `topPercent?: number` (vertikale Position, default 40)

### DecorationBauhausShapes
- `shapes?: ('circle' | 'rect' | 'triangle')[]` (Default: alle drei)
- `variant?: 'standard' | 'mirror'` (gespiegelte Komposition)
- `zIndex?: number`

### DecorationGrain
- `intensity?: 'soft' | 'normal' | 'strong'`
- `blendMode?: 'multiply' | 'overlay' | 'screen'`
- `zIndex?: number` (Default 1)

### DecorationLiquefyBlob
- `children: ReactNode` (was verflüssigt wird)
- `size?: 'sm' | 'md' | 'lg'` (320 / 420 / 520 px)
- `shape?: 'circle' | 'square' | 'free'`

## Wichtig: Z-Index-Hierarchie

Decorations sitzen standardmäßig auf `zIndex: 0` als Background. Der Content der Bereich-Komponente muss auf `position: relative; z-index: 2;` stehen, damit er drüber liegt:

```css
.hero-a-content {
  position: relative;
  z-index: 2;
}
```

Aurora unter Stars: Aurora auf `zIndex: 0`, Stars auf `zIndex: 1`. Beide unter Content `zIndex: 2`.

## Performance-Hinweise

- `DecorationLiquefyBlob` ist der teuerste Effekt (SVG-Displacement mit scale=100). Pro Hero maximal 1 Instanz, nicht in jeden Bereich packen.
- `DecorationGoo` läuft mit `filter: url(#org-goo)` — auch teuer, aber okay. Pro Bereich 1 Instanz.
- `DecorationMarquee` und `DecorationKineticBg` sind günstig (reine CSS-Transform-Animationen).
- `prefers-reduced-motion: reduce` deaktiviert alle Animationen (in globals-append.css definiert).

## Was ALS NÄCHSTES kommt

Nach diesem ZIP:
- **Hero-Refactor** auf das neue 8-Stile-System (`HeroVariantA/B/C.tsx`) — nutzt all diese Decorations
- Wir bauen 1 Variant zuerst, du testest live, dann B+C
