/**
 * sarahiver.de — Landing v4: Icon-Set.
 * Alle Icons 1px-Strichstärke, currentColor, kein externes Icon-Paket.
 */

type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
});

export function IconCheck({ size = 14, className }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={1.6} className={className}>
      <path d="M4 12.5 9 17.5 20 6.5" />
    </svg>
  );
}

export function IconSparkle({ size = 26, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 3.5 13.7 9.3 19.5 11 13.7 12.7 12 18.5 10.3 12.7 4.5 11 10.3 9.3Z" />
      <path d="M18.5 16.5 19.2 18.8 21.5 19.5 19.2 20.2 18.5 22.5 17.8 20.2 15.5 19.5 17.8 18.8Z" />
    </svg>
  );
}

export function IconHeart({ size = 26, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 20.5s-7.5-4.6-7.5-9.7a4.3 4.3 0 0 1 7.5-2.9 4.3 4.3 0 0 1 7.5 2.9c0 5.1-7.5 9.7-7.5 9.7Z" />
    </svg>
  );
}

export function IconDevices({ size = 26, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="2.5" y="5.5" width="14" height="10" rx="1.4" />
      <path d="M6.5 19.5h7" />
      <rect x="16.5" y="9.5" width="5" height="10" rx="1.2" />
    </svg>
  );
}

export function IconPen({ size = 26, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 20h4l10-10a2.6 2.6 0 0 0-3.7-3.7L4.3 16.3 4 20Z" />
      <path d="M13.8 7.2 16.8 10.2" />
    </svg>
  );
}

export function IconInfinity({ size = 26, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M8.2 8.4c2 0 2.7 1.4 3.8 3.6 1.1 2.2 1.8 3.6 3.8 3.6a3.6 3.6 0 0 0 0-7.2c-2 0-2.7 1.4-3.8 3.6-1.1 2.2-1.8 3.6-3.8 3.6a3.6 3.6 0 0 1 0-7.2Z" />
    </svg>
  );
}

export function IconUser({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="9" r="3.4" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="12" cy="12" r="9.2" />
    </svg>
  );
}

export function IconPalette({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.6" />
      <path d="M3.5 15.5 9 10.5l4.5 4 3-2.5 4 3.5" />
      <circle cx="8.8" cy="8.6" r="1.2" />
    </svg>
  );
}

export function IconUpload({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 16V5.5" />
      <path d="M8 9.2 12 5.2l4 4" />
      <path d="M4.5 15.5v3a1.6 1.6 0 0 0 1.6 1.6h11.8a1.6 1.6 0 0 0 1.6-1.6v-3" />
    </svg>
  );
}

export function IconRocket({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 3c2.9 2.3 4.4 5.3 4.4 8.6l-2 3.5H9.6l-2-3.5C7.6 8.3 9.1 5.3 12 3Z" />
      <circle cx="12" cy="9.4" r="1.6" />
      <path d="M9.6 15.1 7.6 17.6M14.4 15.1l2 2.5" />
      <path d="M12 16.6v4" />
    </svg>
  );
}

export function IconArrowRight({ size = 15, className }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={1.5} className={className}>
      <path d="M4.5 12h14" />
      <path d="M13.5 6.8 18.7 12l-5.2 5.2" />
    </svg>
  );
}

export function IconChevronLeft({ size = 15, className }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={1.5} className={className}>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </svg>
  );
}

export function IconChevronRight({ size = 15, className }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={1.5} className={className}>
      <path d="M9.5 5.5 16 12l-6.5 6.5" />
    </svg>
  );
}

export function IconInstagram({ size = 17, className }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={1.3} className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.6" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.1" cy="6.9" r=".9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPinterest({ size = 17, className }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={1.3} className={className}>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M10.2 16.8c.6-2.2 1.5-5.6 1.5-5.6-.3-.6-.3-1.5-.1-2.1.4-1.3 2.2-1 2.2.5 0 1-.6 2.4-.7 3.4-.2 1.3 1 1.9 2 1.1 1.2-1 1.5-3.2.7-4.6-.9-1.6-3.6-1.9-5-.5-1.3 1.3-1.2 3.2-.4 4.1" />
      <path d="M10.5 15.4 9.4 19.8" />
    </svg>
  );
}

/** Handgezeichneter Pfeil für die Script-Notizen (dekorativ). */
export function IconNoteArrow({ className }: { className?: string }) {
  return (
    <svg
      width="62"
      height="42"
      viewBox="0 0 62 42"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      className={className}
    >
      <path d="M58 9C44 2 22 5 7 21c-1.6 1.7-3 3.7-4 5.8" />
      <path d="M2.4 18.8 3 27.4l8.4-1.6" />
    </svg>
  );
}
