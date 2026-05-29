'use client';

import type { EffectiveTokens } from '@/types/supabase';
import { WITNESSES_DEFAULTS, readPersons, initialsOf } from './shared';
import { WitHeader, WitContacts, WitEmpty } from './shared-ui';

/**
 * Trauzeugen Variante C — Editorial mit Vorstellung
 *
 * Großzügige Blöcke: großes Polaroid-Porträt + Rolle, Name, persönlicher
 * Satz (intro, NUR hier) und Kontakt-Buttons. Blöcke alternieren Foto
 * links/rechts (CSS :nth-child(even)). Client Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
}

export default function WitnessesVariantC({ content }: Props) {
  const eyebrow = (content.eyebrow as string) ?? WITNESSES_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? WITNESSES_DEFAULTS.title;
  const description = (content.description as string) ?? WITNESSES_DEFAULTS.description;
  const persons = readPersons(content);

  return (
    <div className="wit witC-section">
      <WitHeader eyebrow={eyebrow} title={title} description={description} />

      {persons.length === 0 ? (
        <WitEmpty />
      ) : (
        <div className="witC-wrap">
          {persons.map((p) => (
            <article key={p.id} className="witC-block">
              <div className="witC-photo-wrap">
                <div className="witC-photo">
                  {p.photo ? (
                    <img src={p.photo} alt="" />
                  ) : (
                    <div className="witC-photo-initials">{initialsOf(p.name)}</div>
                  )}
                </div>
              </div>
              <div className="witC-body">
                <p className="witC-role">{p.role}</p>
                <h3 className="witC-name">{p.name}</h3>
                {p.intro && (
                  <p
                    className="witC-intro"
                    data-editable={`witnesses.persons.${p.id}.intro`}
                    data-edit-type="text"
                  >
                    {p.intro}
                  </p>
                )}
                <WitContacts person={p} className="witC-contacts" />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
