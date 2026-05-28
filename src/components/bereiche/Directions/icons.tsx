/**
 * Inline-SVG-Icons für den Anfahrt-Bereich (transit-Modi + Pin).
 */
import type { ReactElement } from 'react';
import type { TransitMode } from './shared';

const IconCar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 13 5 7.5A2 2 0 0 1 6.9 6h10.2a2 2 0 0 1 1.9 1.5L21 13" />
    <path d="M3 13h18v5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <circle cx="7" cy="16" r="1" />
    <circle cx="17" cy="16" r="1" />
  </svg>
);

const IconTrain = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="6" y="3" width="12" height="14" rx="2" />
    <path d="M6 11h12" />
    <circle cx="9" cy="14" r="0.8" fill="currentColor" />
    <circle cx="15" cy="14" r="0.8" fill="currentColor" />
    <path d="M8 17l-2 4M16 17l2 4" />
  </svg>
);

const IconBus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="4" width="16" height="13" rx="2" />
    <path d="M4 10h16" />
    <path d="M8 14h0M16 14h0" strokeWidth="2.2" />
    <path d="M7 17l-1.5 3M17 17l1.5 3" />
  </svg>
);

const IconPark = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M10 17V7h3.5a3 3 0 1 1 0 6H10" strokeWidth="1.8" />
  </svg>
);

const IconWalk = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="13" cy="4.5" r="1.5" />
    <path d="M9 12l2-3 3 1 3 4" />
    <path d="M9 12l-1 4 3 2-1 4" />
    <path d="M14 14l2 2" />
  </svg>
);

export const IconPin = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 14s-5-4-5-8a5 5 0 1 1 10 0c0 4-5 8-5 8z" />
    <circle cx="8" cy="6" r="1.6" />
  </svg>
);

export function transitIcon(mode: TransitMode | string): ReactElement {
  switch (mode) {
    case 'car':
      return <IconCar />;
    case 'train':
      return <IconTrain />;
    case 'bus':
      return <IconBus />;
    case 'park':
      return <IconPark />;
    case 'walk':
      return <IconWalk />;
    default:
      return <IconPin />;
  }
}
