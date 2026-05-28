'use client';

import { useState } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import { FAQ_DEFAULTS, readItems, renderAnswer } from './shared';
import { FaqHeader, FaqEmpty } from './shared-ui';

/**
 * FAQ Variante A — Akkordeon
 *
 * Liste von Fragen, Klick öffnet die Antwort (grid-rows 0fr→1fr Slide).
 * Erste Frage ist initial offen. Mehrere können gleichzeitig offen sein.
 * Client Component wegen Open-State. Initial-Open = erstes Item →
 * deterministisch, SSR-safe.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function FaqVariantA({ content }: Props) {
  const eyebrow = (content.eyebrow as string) ?? FAQ_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? FAQ_DEFAULTS.title;
  const description = (content.description as string) ?? FAQ_DEFAULTS.description;
  const items = readItems(content);

  const [open, setOpen] = useState<Set<string>>(
    () => new Set(items.length > 0 ? [items[0].id] : []),
  );

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="faq faqA-section">
      <FaqHeader eyebrow={eyebrow} title={title} description={description} />

      {items.length === 0 ? (
        <FaqEmpty />
      ) : (
        <div className="faqA-wrap">
          <ul className="faqA-list">
            {items.map((f) => {
              const isOpen = open.has(f.id);
              return (
                <li key={f.id} className="faqA-item" data-open={isOpen ? 'true' : 'false'}>
                  <button
                    type="button"
                    className="faqA-q-btn"
                    aria-expanded={isOpen}
                    onClick={() => toggle(f.id)}
                  >
                    <span data-editable={`faq.items.${f.id}.question`} data-edit-type="text">
                      {f.question}
                    </span>
                    <span className="icon" aria-hidden="true">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                        <path d="M3 6l5 5 5-5" />
                      </svg>
                    </span>
                  </button>
                  <div className="faqA-panel">
                    <div className="faqA-panel-inner">
                      <div
                        className="faqA-answer"
                        data-editable={`faq.items.${f.id}.answer`}
                        data-edit-type="markdown"
                        dangerouslySetInnerHTML={{ __html: renderAnswer(f.answer) }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
