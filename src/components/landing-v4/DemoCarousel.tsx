'use client';

import { useCallback, useRef } from 'react';
import { IconArrowRight, IconChevronLeft, IconChevronRight } from './icons';

export interface DemoItem {
  couple: string;
  note?: string;
  date: string;
  style: string;
  text: string;
  href: string;
  image: string;
}

/**
 * Horizontales Demo-Karussell mit Scroll-Snap.
 * Die Pfeile scrollen um genau eine Kartenbreite — kein JS-Layout, damit die
 * Karten auf jeder Breite dieselben bleiben wie im CSS-Grid definiert.
 */
export default function DemoCarousel({ items }: { items: DemoItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = useCallback((dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 20 : track.clientWidth * 0.6;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  }, []);

  return (
    <div className="sd-carousel">
      <button
        type="button"
        className="sd-cbtn sd-cbtn--prev"
        onClick={() => scrollBy(-1)}
        aria-label="Vorheriges Design"
      >
        <IconChevronLeft />
      </button>

      <div className="sd-track" ref={trackRef}>
        {items.map((item) => (
          <article className="sd-demo" key={item.couple}>
            <a
              className="sd-demo-media"
              href={item.href}
              style={{ backgroundImage: `url(${item.image})` }}
              aria-label={`Demo ansehen: ${item.style} — ${item.couple}`}
            >
              <div className="sd-demo-names">
                <h3>{item.couple}</h3>
                {item.note ? <p className="sd-demo-note">{item.note}</p> : null}
                <p className="sd-demo-date">{item.date}</p>
              </div>
              <span className="sd-demo-go" aria-hidden>
                <IconArrowRight size={13} />
              </span>
            </a>
            <div className="sd-demo-meta">
              <h4>{item.style}</h4>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="sd-cbtn sd-cbtn--next"
        onClick={() => scrollBy(1)}
        aria-label="Nächstes Design"
      >
        <IconChevronRight />
      </button>
    </div>
  );
}
