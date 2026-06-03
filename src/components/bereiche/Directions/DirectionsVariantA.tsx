import type { EffectiveTokens } from '@/types/supabase';
import { DIR_DEFAULTS, readLocations, renderDesc } from './shared';
import { DirHeader, DirLabelChip, DirTransit, RouteBtn, MapFrame, DirEmpty } from './shared-ui';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

/**
 * Anfahrt Variante A — Karte oben, Location-Infos darunter
 *
 * Große Map (erste Location) oben, darunter pro Location ein Info-Block
 * (2 Spalten, zentrierte Einzelkarte bei 1). Server Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function DirectionsVariantA({ tokens, content }: Props) {

  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const eyebrow = (content.eyebrow as string) ?? DIR_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? DIR_DEFAULTS.title;
  const description = (content.description as string) ?? DIR_DEFAULTS.description;
  const items = readLocations(content);

  if (items.length === 0) {
    return (
      <div className="dir dirA-section" data-style-dir={style}>
      <StyledBereichBg
        style={style}
        marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`}
      />
        <DirHeader eyebrow={eyebrow} title={title} description={description} />
        <DirEmpty />
      </div>
    );
  }

  const primary = items[0];
  const gridCls = items.length === 1 ? ' is-one' : '';

  return (
    <div className="dir dirA-section" data-style-dir={style}>
      <DirHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="dirA-wrap">
        <MapFrame loc={primary} className="dirA-map" />
        <div className={`dirA-grid${gridCls}`}>
          {items.map((loc) => (
            <article key={loc.id} className="dirA-card" data-id={loc.id}>
              <DirLabelChip loc={loc} />
              <h3
                className="dir-name"
                data-editable={`directions.items.${loc.id}.name`}
                data-edit-type="text"
              >
                {loc.name}
              </h3>
              <p
                className="dir-address"
                data-editable={`directions.items.${loc.id}.address`}
                data-edit-type="text"
              >
                {loc.address}
              </p>
              {loc.description && (
                <div
                  className="dir-description"
                  data-editable={`directions.items.${loc.id}.description`}
                  data-edit-type="markdown"
                  dangerouslySetInnerHTML={{ __html: renderDesc(loc.description) }}
                />
              )}
              <DirTransit loc={loc} />
              <RouteBtn loc={loc} />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
