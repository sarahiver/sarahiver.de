import type { ReactNode } from 'react';

/**
 * Einheitliche Hülle für jede Dashboard-Section. Liefert Titel, optionale
 * Description und eine Action-Slot rechts (z.B. "Speichern"-Button).
 *
 * Server Component. Interne Interaktion macht jede Section selbst.
 */
interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export default function DashboardSection({ title, description, action, children }: Props) {
  return (
    <section className="dash-section">
      <header className="dash-section-head">
        <div className="dash-section-head-text">
          <h1 className="dash-section-title">{title}</h1>
          {description && <p className="dash-section-desc">{description}</p>}
        </div>
        {action && <div className="dash-section-head-action">{action}</div>}
      </header>
      <div className="dash-section-body">{children}</div>
    </section>
  );
}
