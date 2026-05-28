import Decor from '@/components/ui/Decor';
import { renderTitleWithEm } from './shared';

export function AbcHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="abc-head">
      {eyebrow && (
        <p className="abc-eyebrow" data-editable="weddingabc.eyebrow" data-edit-type="text">
          {eyebrow}
        </p>
      )}
      <h2
        className="abc-title"
        data-editable="weddingabc.title"
        data-edit-type="text"
        dangerouslySetInnerHTML={{ __html: renderTitleWithEm(title) }}
      />
      <div className="abc-head-decor-wrap">
        <Decor />
      </div>
      {description && (
        <p className="abc-desc" data-editable="weddingabc.description" data-edit-type="text">
          {description}
        </p>
      )}
    </div>
  );
}

export function AbcEmpty() {
  return (
    <div className="abc-empty">
      <Decor />
      <span>Unser Hochzeits-ABC füllt sich bald.</span>
    </div>
  );
}
