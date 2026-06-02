import DecorationGoo from './DecorationGoo';
import DecorationAurora from './DecorationAurora';
import DecorationStars from './DecorationStars';
import DecorationGrain from './DecorationGrain';
import DecorationBauhausShapes from './DecorationBauhausShapes';
import DecorationKineticBg from './DecorationKineticBg';

/**
 * StyledBereichBg — universelle Decoration je Stil mit drastisch sichtbaren,
 * animierten Visual-Elements.
 *
 * Wird in jeden Bereich-Wrapper als erstes Child eingebaut.
 * Pro Stil rendert die Komponente charakteristische Visual-Elemente, die
 * den Stil sofort erkennbar machen — nicht nur passiver Background-Layer
 * sondern aktive animierte Elemente.
 *
 * Alle Decorations sind via CSS-Klasse `.styled-bg-*` positioniert und
 * animiert. CSS-Definitionen liegen in design-system-v2.css unter dem
 * `STYLED-BG ANIMATIONS`-Block.
 */

type Props = {
  style: string;
  marqueeText?: string;
};

export default function StyledBereichBg({ style, marqueeText }: Props) {
  switch (style) {
    case 'editorial':
      return (
        <>
          <DecorationGrain intensity="soft" />
          <div className="styled-bg-editorial" aria-hidden="true">
            <div className="styled-bg-editorial-rule" />
            <div className="styled-bg-editorial-mark">Ed. 01</div>
          </div>
        </>
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

    case 'organic':
      return (
        <>
          <DecorationGoo intensity="normal" />
          <DecorationGrain intensity="soft" />
          <div className="styled-bg-organic" aria-hidden="true">
            <div className="styled-bg-organic-blob styled-bg-organic-blob--1" />
            <div className="styled-bg-organic-blob styled-bg-organic-blob--2" />
          </div>
        </>
      );

    case 'mono':
      return (
        <div className="styled-bg-mono" aria-hidden="true">
          <div className="styled-bg-mono-grid" />
          <div className="styled-bg-mono-comment">
            <span className="styled-bg-mono-prefix">//</span> awaiting input
            <span className="styled-bg-mono-cursor">_</span>
          </div>
        </div>
      );

    case 'opulent':
      return (
        <>
          <DecorationAurora intensity="normal" />
          <DecorationStars density="normal" />
          <div className="styled-bg-opulent" aria-hidden="true">
            <div className="styled-bg-opulent-sparkle styled-bg-opulent-sparkle--1">✦</div>
            <div className="styled-bg-opulent-sparkle styled-bg-opulent-sparkle--2">✧</div>
            <div className="styled-bg-opulent-sparkle styled-bg-opulent-sparkle--3">✦</div>
          </div>
        </>
      );

    case 'liquefy':
      return (
        <div className="styled-bg-liquefy" aria-hidden="true">
          <div className="styled-bg-liquefy-blob styled-bg-liquefy-blob--1" />
          <div className="styled-bg-liquefy-blob styled-bg-liquefy-blob--2" />
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

    default:
      return null;
  }
}
