import type { ReactNode } from "react";

interface FootbridgeProps {
  children: ReactNode;
  className?: string;
  id?: string;
  title?: string;
  subtitle?: string;
}

const BALUSTER_X = Array.from({ length: 29 }, (_, i) => 48 + i * 48);

function archY(x: number, base: number, rise: number) {
  const t = (x - 720) / 720;
  return base - rise * (1 - t * t);
}

export default function Footbridge({
  children,
  className = "",
  id,
  title,
  subtitle,
}: FootbridgeProps) {
  return (
    <div id={id} className={`footbridge-span pointer-events-auto ${className}`}>
      {/* Left & Right Stacked Stone Embankments */}
      <div aria-hidden="true" className="bridge-abutment bridge-abutment-left" />
      <div
        aria-hidden="true"
        className="bridge-abutment bridge-abutment-right"
      />

      {/* Upper Arched Timber Handrail (Kōran) & Balusters */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className="pointer-events-none relative z-[2] block h-14 w-full sm:h-16"
      >
        {BALUSTER_X.map((x) => {
          const topY = archY(x, 30, 18);
          return (
            <g key={x}>
              <line
                x1={x}
                y1={topY}
                x2={x}
                y2={64}
                stroke="#140c07"
                strokeWidth="9"
              />
              <line
                x1={x}
                y1={topY}
                x2={x}
                y2={64}
                stroke="#7c5234"
                strokeWidth="6.5"
              />
              <line
                x1={x - 1.5}
                y1={topY}
                x2={x - 1.5}
                y2={64}
                stroke="#b8845a"
                strokeWidth="1.2"
              />
            </g>
          );
        })}

        {/* Lower Arched Stringer Rail */}
        <path
          d="M 12 50 Q 720 30 1428 50"
          fill="none"
          stroke="#140c07"
          strokeWidth="10"
        />
        <path
          d="M 12 50 Q 720 30 1428 50"
          fill="none"
          stroke="#7c5234"
          strokeWidth="7"
        />
        <path
          d="M 12 47.5 Q 720 27.5 1428 47.5"
          fill="none"
          stroke="#b8845a"
          strokeWidth="1.5"
        />

        {/* Upper Arched Handrail */}
        <path
          d="M 8 31 Q 720 -4 1432 31"
          fill="none"
          stroke="#140c07"
          strokeWidth="12"
        />
        <path
          d="M 8 31 Q 720 -4 1432 31"
          fill="none"
          stroke="#8a5b3a"
          strokeWidth="8.5"
        />
        <path
          d="M 8 27.5 Q 720 -7.5 1432 27.5"
          fill="none"
          stroke="#c99367"
          strokeWidth="1.8"
        />

        {/* Left & Right Newel Posts + Warm Garden Lanterns */}
        {[28, 1412].map((px) => {
          const lx = px < 720 ? px + 22 : px - 22;
          return (
            <g key={px}>
              <rect
                x={px - 8}
                y="12"
                width="16"
                height="52"
                fill="#5a3a23"
                stroke="#140c07"
                strokeWidth="1.5"
              />
              <rect
                x={px - 10}
                y="8"
                width="20"
                height="5"
                fill="#c99367"
                stroke="#140c07"
                strokeWidth="1"
              />
              <circle cx={lx} cy="52" r="14" fill="rgba(255, 184, 77, 0.35)" />
              <rect
                x={lx - 3}
                y="47"
                width="6"
                height="9"
                fill="#ffd073"
              />
            </g>
          );
        })}
      </svg>

      {/* Solid Opaque Timber Plank Walkway Deck */}
      <div
        className="footbridge-deck"
        style={{ backgroundColor: "#1b130e" }}
      >
        <div className="mx-auto w-full max-w-5xl px-10 py-8 sm:px-14 sm:py-10">
          {title && (
            <header className="mb-7 flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--line-strong)] pb-4">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="inline-block h-5 w-1 bg-[var(--kohaku)]"
                />
                <h2 className="font-display text-3xl font-normal leading-none text-[var(--fg)] sm:text-4xl">
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
      </div>

      {/* Under-Bridge Structural Arch Rib & Rippled Water Reflection */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        className="pointer-events-none relative z-[2] block h-10 w-full sm:h-12"
      >
        <path
          d="M 16 0 L 1424 0 L 1424 30 Q 720 14 16 30 Z"
          fill="rgba(0, 0, 0, 0.72)"
        />
        <path
          d="M 16 4 Q 720 26 1424 4"
          fill="none"
          stroke="#140c07"
          strokeWidth="10"
        />
        <path
          d="M 16 4 Q 720 26 1424 4"
          fill="none"
          stroke="#5a3a23"
          strokeWidth="6.5"
        />
        <path
          d="M 16 2 Q 720 24 1424 2"
          fill="none"
          stroke="#b8845a"
          strokeWidth="1.2"
        />
        <path
          d="M 60 26 Q 720 42 1380 26"
          fill="none"
          stroke="#7c5234"
          strokeWidth="2.5"
          strokeDasharray="22 12 8 14"
          opacity="0.65"
        />
        <ellipse cx="50" cy="28" rx="20" ry="5" fill="rgba(255, 184, 77, 0.35)" />
        <ellipse cx="1390" cy="28" rx="20" ry="5" fill="rgba(255, 184, 77, 0.35)" />
      </svg>
    </div>
  );
}
