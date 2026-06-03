import DecorationKineticBg from './DecorationKineticBg';

/**
 * StyledBereichBg — pro-Bereich CONTEXT-Decorations.
 *
 * BAUHAUS update: drastisch reduziert. Statt 4 Shapes pro Bereich
 * (DecorationBauhausShapes + Square + Circle) nur noch EIN winziger
 * konsistenter Akzent (gelbes Quadrat top-right, 18px). Sieht in
 * jedem Bereich gleich aus, egal in welcher Reihenfolge sie liegen.
 * Hero behält sein eigenes DecorationBauhausShapes-Direct-Import als
 * Composition-Spot (der eine prominente Stil-Showcase).
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
      // Drastisch reduziert: ein winziger konsistenter Akzent statt 4 Shapes
      return (
        <div className="styled-bg-bauhaus" aria-hidden="true">
          <div className="styled-bg-bauhaus-marker" />
        </div>
      );

    // Organic, Liquefy: keine context-Decoration — alles ambient global.
    default:
      return null;
  }
}
