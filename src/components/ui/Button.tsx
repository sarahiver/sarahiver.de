import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  showArrow?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  showArrow = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center gap-2.5 h-13 px-6 text-sm font-medium tracking-wide rounded-full transition-all duration-200 hover:-translate-y-px';

  const variantClasses =
    variant === 'primary'
      ? 'bg-ink text-paper-warm border border-ink hover:shadow-lg hover:shadow-ink/40'
      : 'bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper-warm';

  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
      {showArrow && (
        <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
          →
        </span>
      )}
    </button>
  );
}
