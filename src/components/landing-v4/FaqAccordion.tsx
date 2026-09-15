'use client';

import { useId, useState } from 'react';

export interface FaqItem {
  q: string;
  a: string;
}

/** Akkordeon — eine Frage offen, Klick auf die offene schließt sie wieder. */
export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const uid = useId();

  return (
    <div className="sd-acc">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${uid}-panel-${i}`;
        const buttonId = `${uid}-q-${i}`;

        return (
          <div className="sd-acc-item" key={item.q} data-open={isOpen}>
            <button
              type="button"
              id={buttonId}
              className="sd-acc-q"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span>{item.q}</span>
              <span className="sd-acc-sign" aria-hidden>
                +
              </span>
            </button>

            {isOpen ? (
              <p className="sd-acc-a" id={panelId} role="region" aria-labelledby={buttonId}>
                {item.a}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
