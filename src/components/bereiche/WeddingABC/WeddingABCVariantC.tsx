'use client';

import { useCallback } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import { ABC_DEFAULTS, ALPHABET, readEntries, groupByLetter, renderText } from './shared';
import { AbcHeader, AbcEmpty } from './shared-ui';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

/**
 * Hochzeits-ABC Variante C — Alphabet-Index mit Sprung-Navigation
 *
 * Sticky A–Z-Leiste oben (vorhandene Buchstaben klickbar, fehlende
 * ausgegraut). Einträge nach Buchstaben gruppiert mit großem Sektions-
 * Buchstaben. Klick auf Index scrollt smooth zur Gruppe.
 *
 * Client Component wegen Smooth-Scroll. Kein Hydration-kritischer State
 * (Gruppen + Index sind deterministisch aus content).
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function WeddingABCVariantC({ tokens, content }: Props) {

  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const eyebrow = (content.eyebrow as string) ?? ABC_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? ABC_DEFAULTS.title;
  const description = (content.description as string) ?? ABC_DEFAULTS.description;
  const items = readEntries(content);
  const groups = groupByLetter(items);
  const present = new Set(groups.map((g) => g.letter));

  const jumpTo = useCallback((letter: string) => {
    const target = document.getElementById(`abc-group-${letter}`);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  return (
    <div className="abc abcC-section" data-style-abc={style}>
      <StyledBereichBg
        style={style}
        marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`}
      />
      <AbcHeader eyebrow={eyebrow} title={title} description={description} />

      {items.length === 0 ? (
        <AbcEmpty />
      ) : (
        <div className="abcC-wrap">
          <nav className="abcC-index" aria-label="Alphabet-Index">
            {ALPHABET.map((L) => {
              const has = present.has(L);
              return (
                <button
                  key={L}
                  type="button"
                  className={`abcC-idx-btn ${has ? 'has' : ''}`}
                  data-letter={L}
                  disabled={!has}
                  aria-disabled={!has}
                  tabIndex={has ? 0 : -1}
                  onClick={has ? () => jumpTo(L) : undefined}
                >
                  {L}
                </button>
              );
            })}
          </nav>

          <div className="abcC-groups">
            {groups.map((g) => (
              <section
                key={g.letter}
                className="abcC-group"
                id={`abc-group-${g.letter}`}
                data-letter={g.letter}
              >
                <h2 className="abcC-group-letter">{g.letter}</h2>
                <div className="abcC-entries">
                  {g.entries.map((e) => (
                    <div key={e.id} className="abcC-entry">
                      <h3
                        className="abcC-term"
                        data-editable={`weddingabc.items.${e.id}.term`}
                        data-edit-type="text"
                      >
                        {e.term}
                      </h3>
                      <div
                        className="abcC-text"
                        data-editable={`weddingabc.items.${e.id}.text`}
                        data-edit-type="markdown"
                        dangerouslySetInnerHTML={{ __html: renderText(e.text) }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
