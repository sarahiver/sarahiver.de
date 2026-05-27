'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Alignment, Spacing, Decor, Contrast } from '@/types/supabase';

/**
 * DnaContext — gibt DNA-Werte an Client Components weiter.
 *
 * Server Components nutzen die Tokens direkt via CSS-Variablen.
 * Client Components, die DNA-Werte in JavaScript brauchen
 * (z.B. für Conditional Rendering von Decor-Elementen),
 * holen sich diese via useDna().
 */
export interface DnaValues {
  align: Alignment;
  spacing: Spacing;
  decor: Decor;
  contrast: Contrast;
  spacingMultiplier: number;
}

const DnaContext = createContext<DnaValues | null>(null);

interface DnaProviderProps {
  dna: DnaValues;
  children: ReactNode;
}

export function DnaProvider({ dna, children }: DnaProviderProps) {
  return <DnaContext.Provider value={dna}>{children}</DnaContext.Provider>;
}

export function useDna(): DnaValues {
  const ctx = useContext(DnaContext);
  if (!ctx) {
    throw new Error(
      'useDna() must be used within a DnaProvider — wrap your tree with <DnaProvider>'
    );
  }
  return ctx;
}
