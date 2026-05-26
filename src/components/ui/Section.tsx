import { ReactNode } from 'react';

interface SectionProps {
  id: string;
  eyebrow?: string;
  eyebrowNumber?: string;
  children: ReactNode;
  className?: string;
}

export default function Section({
  id,
  eyebrow,
  eyebrowNumber,
  children,
  className = '',
}: SectionProps) {
  return (
    <section
      id={id}
      className={`px-6 md:px-12 lg:px-20 py-20 lg:py-24 border-b border-rule-soft ${className}`}
    >
      {eyebrow && (
        <div className="eyebrow mb-7">
          <span className="dot" />
          {eyebrowNumber && <span className="text-ink font-medium">{eyebrowNumber}</span>}
          <span>{eyebrow}</span>
        </div>
      )}
      {children}
    </section>
  );
}
