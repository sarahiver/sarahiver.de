'use client';

import type { EffectiveTokens } from '@/types/supabase';
import { WITNESSES_DEFAULTS, readPersons } from './shared';
import { WitHeader, WitPhoto, WitContacts, WitEmpty } from './shared-ui';

/**
 * Trauzeugen Variante A — Foto-Karten
 *
 * Auto-Fit-Raster mit runden Porträts, Rolle, Name, Kontakt-Buttons.
 * Spam-Schutz: Kontaktwerte nur kodiert (siehe WitContacts). Client Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
}

export default function WitnessesVariantA({ content }: Props) {
  const eyebrow = (content.eyebrow as string) ?? WITNESSES_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? WITNESSES_DEFAULTS.title;
  const description = (content.description as string) ?? WITNESSES_DEFAULTS.description;
  const persons = readPersons(content);

  return (
    <div className="wit witA-section">
      <WitHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="witA-wrap">
        {persons.length === 0 ? (
          <WitEmpty />
        ) : (
          <div className="witA-grid">
            {persons.map((p) => (
              <article key={p.id} className="witA-card">
                <WitPhoto person={p} className="witA-photo" />
                <div className="witA-headings">
                  <p className="witA-role">{p.role}</p>
                  <h3 className="witA-name">{p.name}</h3>
                </div>
                <WitContacts person={p} />
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
