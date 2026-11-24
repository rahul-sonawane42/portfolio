import type { ReactNode } from "react";

interface SteppingStoneProps {
  children: ReactNode;
  className?: string;
  id?: string;
  title?: string;
  subtitle?: string;
}

export default function SteppingStone({ children, className = "", id, title, subtitle }: SteppingStoneProps) {
  return (
    <article id={id} className={`stepping-stone pointer-events-auto ${className}`}>
      <div className="stone-top">
        <div className="stone-content">
          {title && (
            <header className="stone-heading">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="stone-inlay" />
                <h2 className="font-display text-3xl font-normal leading-none text-[var(--fg)] sm:text-4xl">{title}</h2>
              </div>
              {subtitle && <span className="font-mono-tech text-xs text-[var(--muted)]">{subtitle}</span>}
            </header>
          )}
          {children}
        </div>
      </div>
    </article>
  );
}
