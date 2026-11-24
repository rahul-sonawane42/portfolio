import { useId } from "react";
import type { ReactNode } from "react";

interface SteppingStoneProps {
  children: ReactNode;
  className?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  variant?: 0 | 1 | 2 | 3 | 4;
  align?: "center" | "left" | "right";
}

/* Five distinct asymmetric river-worn flat boulder (tobi-ishi) contours */
const STONE_SHAPES: string[] = [
  "M 56 38 C 190 16, 420 12, 690 18 C 845 22, 938 30, 964 56 C 986 82, 988 875, 966 914 C 942 948, 815 964, 540 966 C 275 968, 86 956, 46 924 C 16 896, 18 92, 42 56 C 47 46, 50 40, 56 38 Z",
  "M 44 46 C 165 20, 495 14, 745 22 C 885 26, 948 40, 970 68 C 988 94, 982 882, 954 918 C 924 952, 760 966, 480 964 C 225 962, 76 950, 38 914 C 14 888, 22 96, 44 46 Z",
  "M 62 34 C 240 16, 540 18, 795 24 C 905 28, 956 44, 974 74 C 990 105, 984 876, 958 916 C 930 950, 790 964, 515 966 C 245 968, 82 952, 44 918 C 16 890, 20 88, 48 50 C 53 42, 57 36, 62 34 Z",
  "M 48 42 C 210 18, 465 14, 725 20 C 870 24, 946 36, 968 64 C 988 92, 986 886, 960 920 C 932 952, 775 966, 495 966 C 235 966, 78 952, 40 916 C 14 890, 18 94, 48 42 Z",
  "M 54 36 C 220 16, 510 14, 765 22 C 895 26, 952 40, 972 68 C 990 96, 984 880, 956 916 C 928 950, 780 965, 505 966 C 240 967, 80 952, 42 918 C 15 890, 20 90, 46 52 Z",
];

export default function SteppingStone({
  children,
  className = "",
  id,
  title,
  subtitle,
  variant = 0,
  align = "center",
}: SteppingStoneProps) {
  const uid = useId().replace(/:/g, "");
  const path = STONE_SHAPES[variant % STONE_SHAPES.length];

  const alignClass =
    align === "left"
      ? "stone-shift-left"
      : align === "right"
        ? "stone-shift-right"
        : "";

  return (
    <article
      id={id}
      data-stepping-stone
      className={`stepping-stone pointer-events-auto ${alignClass} ${className}`}
    >
      {/* Multi-Layered Organic River Boulder & Water Meniscus */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="stone-slab-svg"
      >
        <defs>
          <linearGradient id={`top-${uid}`} x1="0.12" y1="0" x2="0.88" y2="1">
            <stop offset="0%" stopColor="var(--stone-top-hi)" />
            <stop offset="48%" stopColor="var(--stone-top)" />
            <stop offset="100%" stopColor="var(--stone-top-lo)" />
          </linearGradient>

          <linearGradient id={`side-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--stone-side)" />
            <stop offset="32%" stopColor="var(--stone-side-hi)" />
            <stop offset="78%" stopColor="var(--stone-side)" />
            <stop offset="100%" stopColor="var(--stone-wet)" />
          </linearGradient>

          <filter id={`grain-${uid}`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.72"
              numOctaves="3"
              seed={11 + variant * 7}
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="0.35 0 0 0 0.25  0 0.35 0 0 0.25  0 0 0.35 0 0.25  0 0 0 0.16 0"
            />
          </filter>

          <clipPath id={`clip-${uid}`}>
            <path d={path} />
          </clipPath>
        </defs>

        {/* Subtle Water Meniscus Ripple Around Submerged Stone */}
        <path
          d={path}
          transform="translate(0, 10) scale(1.018)"
          fill="none"
          stroke="var(--waterline)"
          strokeWidth="1.5"
          className="stone-ripple-ring"
        />

        {/* Underwater Soft Drop Shadow */}
        <path
          d={path}
          transform="translate(0, 26)"
          fill="rgba(0, 0, 0, 0.42)"
        />

        {/* Submerged Wet Waterline Base Collar */}
        <path
          d={path}
          transform="translate(0, 20)"
          fill="var(--stone-wet)"
        />

        {/* Chiseled Vertical Rock Thickness / Side Wall */}
        <path
          d={path}
          transform="translate(0, 14)"
          fill={`url(#side-${uid})`}
          stroke="var(--stone-wet)"
          strokeWidth="2"
        />

        {/* Flat Opaque Top Stone Face */}
        <path
          d={path}
          fill={`url(#top-${uid})`}
          stroke="var(--stone-rim)"
          strokeWidth="2.2"
        />

        {/* Natural Mineral Grain Overlay Clipped to Stone Top */}
        <rect
          x="0"
          y="0"
          width="1000"
          height="1000"
          clipPath={`url(#clip-${uid})`}
          filter={`url(#grain-${uid})`}
        />
      </svg>

      {/* Engraved / Chiseled Content */}
      <div className="stone-content">
        {title && (
          <header className="stone-heading">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="stone-inlay" />
              <h2 className="font-display engraved-title text-3xl font-normal leading-none sm:text-4xl">
                {title}
              </h2>
            </div>
            {subtitle && (
              <span className="font-mono-tech text-xs text-[var(--muted)]">
                {subtitle}
              </span>
            )}
          </header>
        )}
        {children}
      </div>
    </article>
  );
}
