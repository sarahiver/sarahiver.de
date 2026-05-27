'use client';

import { useState } from 'react';
import { FAQ } from '@/lib/content';
import Section from '@/components/ui/Section';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" eyebrow={FAQ.eyebrow} eyebrowNumber="10">
      <div className="mb-12">
        <h2 className="h2-editorial max-w-3xl">
          {FAQ.titlePart1} <em>{FAQ.titleEm}</em>
        </h2>
      </div>

      <div className="max-w-4xl">
        {FAQ.items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="border-b border-rule">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full py-6 flex items-baseline gap-6 text-left group"
                aria-expanded={isOpen}
              >
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted flex-shrink-0 pt-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="flex-1 text-xl md:text-2xl leading-snug text-ink group-hover:text-terra-deep transition-colors"
                  style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}
                >
                  {item.q}
                </span>
                <span
                  className={`text-2xl transition-transform duration-300 flex-shrink-0 ${
                    isOpen ? 'rotate-45' : ''
                  }`}
                  style={{ color: 'var(--color-terra)' }}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="pb-6 pl-0 sm:pl-14">
                  <p className="text-[15px] leading-relaxed text-ink-soft max-w-2xl">{item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
