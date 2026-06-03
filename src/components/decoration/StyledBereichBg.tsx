import DecorationBauhausShapes from './DecorationBauhausShapes';
import DecorationKineticBg from './DecorationKineticBg';

/**
 * StyledBereichBg — pro-Bereich CONTEXT-Decorations.
 *
 * Was hier passiert vs. GlobalStyledBg:
 *   - StyledBereichBg = CONTEXT. Decorations die zum Bereich gehören
 *     (Brutalist-Marquee überm Form, Mono-Cursor neben Eyebrow, etc.)
 *     Scrollen mit dem Bereich mit.
 *   - GlobalStyledBg = AMBIENT (Goo, Aurora, Stars, Grain). Bleibt im VP.
 *     Liegt im Site-Wrapper, NICHT pro Bereich.
 *
 * Ambient-Decorations (Goo, Aurora, Stars, Grain, Acid-Blobs) sind
 * AUS DIESER KOMPONENTE RAUSGENOMMEN — die kommen aus GlobalStyledBg.
 */

type Props = {
  style: string;
  marqueeText?: string;
};

export default function StyledBereichBg({ style, marqueeText }: Props) {
  switch (style) {
    case 'editorial':
      return (
        <div className="styled-bg-editorial" aria-hidden="true">
          <div className="styled-bg-editorial-rule" />
          <div className="styled-bg-editorial-mark">Ed. 01</div>
        </div>
      );

    case 'brutalist':
      return (
        <div className="styled-bg-brutalist" aria-hidden="true">
          <div className="styled-bg-brutalist-marquee">
            <span>★ ANTWORT BITTE ★ ANTWORT BITTE ★ ANTWORT BITTE ★ ANTWORT BITTE</span>
          </div>
          <div className="styled-bg-brutalist-star">★</div>
        </div>
      );

    case 'mono':
      return (
        <div className="styled-bg-mono" aria-hidden="true">
          <div className="styled-bg-mono-comment">
            <span className="styled-bg-mono-prefix">//</span> awaiting input
            <span className="styled-bg-mono-cursor">_</span>
          </div>
        </div>
      );

    case 'opulent':
      return (
        <div className="styled-bg-opulent" aria-hidden="true">
          <div className="styled-bg-opulent-sparkle styled-bg-opulent-sparkle--1">✦</div>
          <div className="styled-bg-opulent-sparkle styled-bg-opulent-sparkle--2">✧</div>
          <div className="styled-bg-opulent-sparkle styled-bg-opulent-sparkle--3">✦</div>
        </div>
      );

    case 'kinetic':
      return (
        <>
          {marqueeText && <DecorationKineticBg text={marqueeText} opacity={0.08} />}
          <div className="styled-bg-kinetic" aria-hidden="true">
            <div className="styled-bg-kinetic-stripe styled-bg-kinetic-stripe--1">
              SAVE THE DATE · SAVE THE DATE · SAVE THE DATE · SAVE THE DATE
            </div>
            <div className="styled-bg-kinetic-stripe styled-bg-kinetic-stripe--2">
              ANTWORT BITTE · ANTWORT BITTE · ANTWORT BITTE · ANTWORT BITTE
            </div>
          </div>
        </>
      );

    case 'bauhaus':
      return (
        <>
          <DecorationBauhausShapes shapes={['circle', 'rect']} />
          <div className="styled-bg-bauhaus" aria-hidden="true">
            <div className="styled-bg-bauhaus-square" />
            <div className="styled-bg-bauhaus-circle" />
          </div>
        </>
      );

    // Organic, Liquefy: keine context-Decoration mehr — alles ambient global.
    default:
      return null;
  }
}
