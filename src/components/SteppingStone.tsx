import { useId } from "react";
import type { ReactNode } from "react";

interface SteppingStoneProps {
  children: ReactNode;
  className?: string;
  id?: string;
  title?: string;
  subtitle?: string;
}

export default function SteppingStone({ children, className = "", id, title, subtitle }: SteppingStoneProps) {
  const textureId = useId().replace(/:/g, "");

  return (
    <article id={id} className={`stepping-stone pointer-events-auto ${className}`}>
      <svg aria-hidden="true" className="stone-grain" viewBox="0 0 100 100" preserveAspectRatio="none">
        <filter id={textureId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed="9" />
          <feColorMatrix values="0.45 0 0 0 0.25 0 0.45 0 0 0.25 0 0 0.45 0 0.25 0 0 0 0.24 0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${textureId})`} />
      </svg>
      <span aria-hidden="true" className="stone-collar" />
      <div className="stone-top">
        <div className="stone-content">
          {title && (
            <header className="stone-heading">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="stone-inlay" />
                <h2 className="font-display engraved-title text-3xl font-normal leading-none sm:text-4xl">{title}</h2>
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
