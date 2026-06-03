'use client';

import type { EffectiveTokens } from '@/types/supabase';
import { WITNESSES_DEFAULTS, readPersons } from './shared';
import { WitHeader, WitPhoto, WitContacts, WitEmpty } from './shared-ui';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

/**
 * Trauzeugen Variante B — Zeilen-Liste
 *
 * Kompakt: kleines Foto links, Name + Rolle Mitte, Kontakt-Buttons rechts.
 * Gut für mehrere Personen. Client Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
}

export default function WitnessesVariantB({ tokens, content }: Props) {

  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const eyebrow = (content.eyebrow as string) ?? WITNESSES_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? WITNESSES_DEFAULTS.title;
  const description = (content.description as string) ?? WITNESSES_DEFAULTS.description;
  const persons = readPersons(content);

  return (
    <div className="wit witB-section" data-style-wit={style}>
      <StyledBereichBg
        style={style}
        marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`}
      />
      <WitHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="witB-wrap">
        {persons.length === 0 ? (
          <WitEmpty />
        ) : (
          <div className="witB-list">
            {persons.map((p) => (
              <div key={p.id} className="witB-row">
                <WitPhoto person={p} className="witB-photo" />
                <div className="witB-body">
                  <h3 className="witB-name">{p.name}</h3>
                  <span className="witB-role">{p.role}</span>
                </div>
                <div className="witB-actions">
                  <WitContacts person={p} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
