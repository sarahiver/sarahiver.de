import DecorationGoo from './DecorationGoo';
import DecorationAurora from './DecorationAurora';
import DecorationStars from './DecorationStars';
import DecorationGrain from './DecorationGrain';
import DecorationBauhausShapes from './DecorationBauhausShapes';
import DecorationKineticBg from './DecorationKineticBg';

/**
 * StyledBereichBg — universelle Background-Decoration je Stil.
 *
 * Wird in jeden Bereich-Wrapper (RSVP, Countdown, Lovestory, ...) eingebaut
 * als erstes Child. Liefert je Stil die richtige BG-Decoration:
 *
 *   Editorial   → Film-Grain Layer
 *   Brutalist   → Keine BG-Decoration (Charakter kommt aus Layout/Borders)
 *   Organic     → Driftende Goo-Blobs + Grain
 *   Mono        → Keine BG-Decoration (Terminal-Look kommt aus CSS-Frame)
 *   Opulent     → Aurora + Gold-Stars
 *   Liquefy     → Keine BG-Decoration (Acid-Glow-Frame in CSS)
 *   Kinetic     → Diagonal-Marquee-Background (wenn marqueeText gegeben)
 *   Bauhaus     → Circle + Rect (subtle)
 *
 * Pro Bereich kann mit `intensity="subtle"` die Anzahl/Stärke reduziert werden,
 * damit der Form-Content nicht überlagert wird.
 *
 * Usage:
 *   <div className="rsvp" data-style-rsvp={style}>
 *     <StyledBereichBg style={style} marqueeText={`${couple} · Wedding`} />
 *     ... rest of bereich ...
 *   </div>
 */

type Props = {
  style: string;
  marqueeText?: string;
  intensity?: 'subtle' | 'normal';
};

export default function StyledBereichBg({ style, marqueeText, intensity = 'subtle' }: Props) {
  switch (style) {
    case 'editorial':
      return <DecorationGrain intensity="soft" />;

    case 'organic':
      return (
        <>
          <DecorationGoo intensity={intensity === 'subtle' ? 'soft' : 'normal'} />
          <DecorationGrain intensity="soft" />
        </>
      );

    case 'opulent':
      return (
        <>
          <DecorationAurora intensity={intensity === 'subtle' ? 'soft' : 'normal'} />
          <DecorationStars density={intensity === 'subtle' ? 'sparse' : 'normal'} />
        </>
      );

    case 'kinetic':
      return marqueeText ? (
        <DecorationKineticBg
          text={marqueeText}
          opacity={intensity === 'subtle' ? 0.06 : 0.1}
        />
      ) : null;

    case 'bauhaus':
      return (
        <DecorationBauhausShapes
          shapes={intensity === 'subtle' ? ['circle'] : ['circle', 'rect']}
        />
      );

    // Brutalist, Mono, Liquefy: keine BG-Decoration —
    // ihr Charakter kommt aus Layout, Borders, Typografie.
    default:
      return null;
  }
}
