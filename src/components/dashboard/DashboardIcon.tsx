import type { ReactElement } from 'react';

/**
 * Dashboard-Icons (Inline-SVG, einheitlich gestylt).
 * Pro Icon-Name eine einfache, robuste SVG-Path-Definition.
 */

interface IconProps {
  name: string;
  size?: number;
}

const PATHS: Record<string, ReactElement> = {
  home: <path d="M3 12l9-8 9 8M5 10v10h14V10" />,
  envelope: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  book: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  camera: (
    <>
      <path d="M4 7h3l2-2h6l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" />
      <path d="M5 12v8h14v-8M12 8v14M8 8a2 2 0 0 1 0-4c1.5 0 4 4 4 4M16 8a2 2 0 0 0 0-4c-1.5 0-4 4-4 4" />
    </>
  ),
  pencil: <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />,
  layers: (
    <>
      <path d="m12 2 9 5-9 5-9-5z" />
      <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 21V14M4 10V3M12 21V12M12 8V3M20 21V16M20 12V3" />
      <path d="M1 14h6M9 8h6M17 16h6" />
    </>
  ),
  external: (
    <>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6M10 14 21 3" />
    </>
  ),
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  close: <path d="m4 4 16 16M20 4 4 20" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m4 12 5 5L20 7" />,
};

export default function DashboardIcon({ name, size = 18 }: IconProps) {
  const content = PATHS[name];
  if (!content) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {content}
    </svg>
  );
}
