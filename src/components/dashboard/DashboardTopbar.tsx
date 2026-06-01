'use client';

import Link from 'next/link';
import DashboardIcon from './DashboardIcon';
import PublishButton from './PublishButton';
import type { DirtyState } from '@/app/dashboard/[slug]/publish-actions';

interface Props {
  slug: string;
  coupleNames: string;
  weddingDateISO: string;
  dirtyState: DirtyState;
}

/**
 * Topbar oben im Dashboard.
 *
 * Links: Burger (mobile, blendet Sidebar ein) + Brautpaar-Name + Hochzeitsdatum.
 * Mitte: PublishButton (mit Badge wenn Änderungen offen sind)
 * Rechts: "Vorschau"-Link auf die Gäste-Seite (öffnet in neuem Tab).
 *
 * Datum wird hier SSR-sicher formatiert (kein toLocaleDateString im Render).
 */
export default function DashboardTopbar({ slug, coupleNames, weddingDateISO, dirtyState }: Props) {
  const dateLabel = formatGermanDate(weddingDateISO);

  const openSidebar = () => {
    window.dispatchEvent(new Event('dashboard:sidebar-toggle'));
  };

  return (
    <header className="dash-topbar">
      <div className="dash-topbar-left">
        <button
          type="button"
          className="dash-topbar-burger"
          onClick={openSidebar}
          aria-label="Navigation öffnen"
        >
          <DashboardIcon name="menu" size={20} />
        </button>
        <div className="dash-topbar-title">
          <span className="dash-topbar-couple">{coupleNames}</span>
          {dateLabel && <span className="dash-topbar-date">{dateLabel}</span>}
        </div>
      </div>
      <div className="dash-topbar-center">
        <PublishButton slug={slug} initialState={dirtyState} />
      </div>
      <div className="dash-topbar-right">
        <Link href={`/${slug}`} target="_blank" rel="noopener noreferrer" className="dash-topbar-preview">
          <DashboardIcon name="external" size={14} />
          <span>Live ansehen</span>
        </Link>
      </div>
    </header>
  );
}

/** SSR-safes Datum: "So, 15. November 2026". */
function formatGermanDate(iso: string): string {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '';
  const [, y, mm, dd] = m;
  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10) - 1;
  const year = parseInt(y, 10);

  // Wochentag deterministisch berechnen (Zellers Kongruenz wäre overkill — wir
  // erstellen ein Date, das tun wir aber NUR mit konstanten Werten, sodass
  // Server und Client das gleiche Ergebnis liefern. Kein Timezone-Effekt,
  // weil wir nur das Y-M-D-Tripel betrachten und UTC-Konstruktor nutzen).
  const utcDate = new Date(Date.UTC(year, month, day));
  const weekdayIdx = utcDate.getUTCDay(); // 0 = So

  const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ];
  return `${weekdays[weekdayIdx]}, ${day}. ${months[month]} ${year}`;
}
