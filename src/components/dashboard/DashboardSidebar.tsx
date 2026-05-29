'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { DashboardNavSection } from '@/lib/dashboard-nav';
import DashboardIcon from './DashboardIcon';

interface Props {
  slug: string;
  sections: DashboardNavSection[];
}

/**
 * Sidebar fürs Dashboard.
 *
 * Desktop: feste Spalte links, immer sichtbar.
 * Mobile: ausklappbarer Drawer (gesteuert von DashboardTopbar via Custom-Event).
 *
 * Das aktive Item wird über usePathname() ermittelt. Reihenfolge der Checks
 * matters: Wir matchen den am genauesten passenden Pfad zuerst (länger zuerst).
 */
export default function DashboardSidebar({ slug, sections }: Props) {
  const pathname = usePathname() || '';
  const [open, setOpen] = useState(false);

  // Mobile-Drawer-Steuerung via Custom Event aus der Topbar
  useEffect(() => {
    const onToggle = () => setOpen((prev) => !prev);
    const onClose = () => setOpen(false);
    window.addEventListener('dashboard:sidebar-toggle', onToggle);
    window.addEventListener('dashboard:sidebar-close', onClose);
    return () => {
      window.removeEventListener('dashboard:sidebar-toggle', onToggle);
      window.removeEventListener('dashboard:sidebar-close', onClose);
    };
  }, []);

  // Beim Routenwechsel den Drawer schließen
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Body-Scroll-Lock im offenen Drawer
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const base = `/dashboard/${slug}`;

  // Längster passender Treffer gewinnt — sonst würde "Dashboard" (href '')
  // bei /rsvp/123 fälschlich auch aktiv erscheinen.
  const candidates = sections
    .flatMap((s) => s.items.map((i) => ({ id: i.id, full: i.href ? `${base}/${i.href}` : base })))
    .sort((a, b) => b.full.length - a.full.length);
  const activeId = candidates.find((c) => pathname === c.full || pathname.startsWith(c.full + '/'))?.id ?? 'dashboard';

  return (
    <>
      {/* Backdrop für Mobile */}
      <div
        className={`dash-sidebar-backdrop ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside className={`dash-sidebar ${open ? 'is-open' : ''}`} aria-label="Dashboard-Navigation">
        <div className="dash-sidebar-brand">
          <span className="dash-brand-mark">S&amp;I.</span>
          <span className="dash-brand-text">Dashboard</span>
        </div>

        <nav className="dash-sidebar-nav">
          {sections.map((section) => (
            <div key={section.id} className="dash-sidebar-section">
              <h3 className="dash-sidebar-section-label">{section.label}</h3>
              <ul className="dash-sidebar-list">
                {section.items.map((item) => {
                  const href = item.href ? `${base}/${item.href}` : base;
                  const isActive = item.id === activeId;
                  return (
                    <li key={item.id}>
                      <Link
                        href={href}
                        className={`dash-sidebar-item ${isActive ? 'is-active' : ''}`}
                      >
                        <span className="dash-sidebar-item-icon" aria-hidden="true">
                          <DashboardIcon name={item.icon} />
                        </span>
                        <span className="dash-sidebar-item-label">{item.label}</span>
                        {typeof item.badge === 'number' && item.badge > 0 && (
                          <span className={`dash-sidebar-badge ${item.warning ? 'is-warning' : ''}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
