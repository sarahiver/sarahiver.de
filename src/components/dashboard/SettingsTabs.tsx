'use client';

import { useState, type ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

/**
 * Einfacher Tab-Switcher fürs Dashboard. Hält den aktiven Tab im Client-State
 * — bewusst kein URL-Param, damit die Tabs nicht in die History wandern.
 */
export default function SettingsTabs({ tabs, initialId }: { tabs: Tab[]; initialId?: string }) {
  const [active, setActive] = useState(initialId || tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) || tabs[0];

  return (
    <div className="dash-tabs">
      <div className="dash-tabs-bar" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            className={`dash-tab ${active === t.id ? 'is-active' : ''}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="dash-tabs-panel" role="tabpanel">
        {current?.content}
      </div>
    </div>
  );
}
