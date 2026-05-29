'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { WeddingBereich, BereichKey } from '@/types/supabase';
import type { WeddingSiteRecord, DashboardStats } from '@/lib/dashboard-data';

/**
 * Context, der die Dashboard-Daten allen Sub-Pages zur Verfügung stellt.
 * Geladen wird im Server-Layout (layout.tsx), hier nur durchgereicht.
 *
 * Kein State-Management — wenn eine Section etwas ändert, lädt sie via
 * router.refresh() neu. Das passt zu Next-App-Router-Patterns und vermeidet
 * Inkonsistenzen.
 */

interface DashboardContextValue {
  site: WeddingSiteRecord;
  bereiche: WeddingBereich[];
  purchasedKeys: BereichKey[];
  stats: DashboardStats;
}

const Ctx = createContext<DashboardContextValue | null>(null);

export function DashboardDataProvider({
  site,
  bereiche,
  purchasedKeys,
  stats,
  children,
}: DashboardContextValue & { children: ReactNode }) {
  return (
    <Ctx.Provider value={{ site, bereiche, purchasedKeys, stats }}>{children}</Ctx.Provider>
  );
}

export function useDashboardData(): DashboardContextValue {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error('useDashboardData must be used within DashboardDataProvider');
  }
  return v;
}
