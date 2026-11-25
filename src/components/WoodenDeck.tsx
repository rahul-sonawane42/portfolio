import type { ReactNode } from "react";
import type { Theme } from "./ThemeToggle";

interface WoodenDeckProps {
  children: ReactNode;
  className?: string;
  theme?: Theme;
}

export default function WoodenDeck({
  children,
  className = "",
}: WoodenDeckProps) {
  return (
    <div
      data-wooden-deck=""
      className={`wooden-deck pointer-events-auto ${className}`}
    >      <div className="relative w-full">
        {/* Full-Width Architectural Taiko-Bashi Bridge (Clean Open Water Below Center Span) */}
        <svg
          viewBox="0 0 1440 420"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="block h-[360px] w-full select-none pointer-events-none sm:h-[365px] md:h-[395px]"
        >
          <defs>
            <linearGradient id="bridgeTimberMain" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4e3423" />
              <stop offset="28%" stopColor="#3a2518" />
              <stop offset="75%" stopColor="#291910" />
              <stop offset="100%" stopColor="#1b100a" />
            </linearGradient>

            <linearGradient id="bridgeHandrail" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6b4730" />
              <stop offset="40%" stopColor="#482e1e" />
              <stop offset="100%" stopColor="#27170e" />
            </linearGradient>

            <linearGradient id="bridgePiling" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1b100a" />
              <stop offset="35%" stopColor="#3c2618" />
              <stop offset="70%" stopColor="#2a1910" />
              <stop offset="100%" stopColor="#140b07" />
            </linearGradient>

            <linearGradient id="giboshiBronze" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d8b47c" />
              <stop offset="45%" stopColor="#9e7946" />
              <stop offset="100%" stopColor="#573f21" />
            </linearGradient>

            <linearGradient id="abutmentStone" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#474d54" />
              <stop offset="55%" stopColor="#2c3136" />
              <stop offset="100%" stopColor="#191c20" />
            </linearGradient>

            <pattern id="cedarGrain" width="120" height="24" patternUnits="userSpaceOnUse">
              <path
                d="M0 5 Q30 3 60 5 T120 5"
                fill="none"
                stroke="rgba(255,215,175,0.06)"
                strokeWidth="1"
              />
              <path
                d="M0 12 Q40 14 80 11 T120 12"
                fill="none"
                stroke="rgba(0,0,0,0.22)"
                strokeWidth="1.2"
              />
              <path
                d="M0 19 Q25 17 55 19 T120 19"
                fill="none"
                stroke="rgba(255,205,155,0.04)"
                strokeWidth="0.9"
              />
            </pattern>
          </defs>

          {/* Four Vertical Support Pilings Entering the Pond Water */}
          <rect x="285" y="218" width="22" height="178" rx="3" fill="url(#bridgePiling)" />
          <rect x="285" y="218" width="22" height="178" rx="3" fill="url(#cedarGrain)" />
          <rect x="495" y="198" width="24" height="198" rx="3" fill="url(#bridgePiling)" />
          <rect x="495" y="198" width="24" height="198" rx="3" fill="url(#cedarGrain)" />
          <rect x="921" y="198" width="24" height="198" rx="3" fill="url(#bridgePiling)" />
          <rect x="921" y="198" width="24" height="198" rx="3" fill="url(#cedarGrain)" />
          <rect x="1133" y="218" width="22" height="178" rx="3" fill="url(#bridgePiling)" />
          <rect x="1133" y="218" width="22" height="178" rx="3" fill="url(#cedarGrain)" />

          {/* Diagonal Timber Cross-Braces */}
          <path d="M307 265 L495 225 L495 239 L307 279 Z" fill="#25160e" opacity="0.88" />
          <path d="M1133 265 L945 225 L945 239 L1133 279 Z" fill="#25160e" opacity="0.88" />

          {/* Concentric Waterline Ripples Around Support Pilings */}
          <g fill="none" stroke="rgba(210, 232, 236, 0.26)" strokeWidth="1.2">
            <ellipse cx="296" cy="395" rx="28" ry="5.5" />
            <ellipse cx="296" cy="395" rx="44" ry="8.5" strokeOpacity="0.14" />
            <ellipse cx="507" cy="395" rx="30" ry="6" />
            <ellipse cx="507" cy="395" rx="48" ry="9" strokeOpacity="0.14" />
            <ellipse cx="933" cy="395" rx="30" ry="6" />
            <ellipse cx="933" cy="395" rx="48" ry="9" strokeOpacity="0.14" />
            <ellipse cx="1144" cy="395" rx="28" ry="5.5" />
            <ellipse cx="1144" cy="395" rx="44" ry="8.5" strokeOpacity="0.14" />
          </g>

          {/* Left & Right Stone Bank Abutments */}
          <path d="M0 165 L138 175 L154 295 L0 315 Z" fill="url(#abutmentStone)" />
          <path d="M0 165 L138 175" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
          <path d="M1440 165 L1302 175 L1286 295 L1440 315 Z" fill="url(#abutmentStone)" />
          <path d="M1440 165 L1302 175" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />

          {/* Upper Arched Handrail (Kasagi) */}
          <path
            d="M0 105 Q720 12 1440 105 L1440 124 Q720 31 0 124 Z"
            fill="url(#bridgeHandrail)"
          />
          <path
            d="M0 105 Q720 12 1440 105"
            fill="none"
            stroke="rgba(255, 224, 186, 0.34)"
            strokeWidth="2"
          />

          {/* Secondary Mid-Rail (Nuki) */}
          <path
            d="M0 144 Q720 52 1440 144 L1440 156 Q720 64 0 156 Z"
            fill="#2d1b11"
          />
          <path
            d="M0 144 Q720 52 1440 144"
            fill="none"
            stroke="rgba(255, 212, 168, 0.16)"
            strokeWidth="1.2"
          />

          {/* Baluster Posts (Tsuka) + Giboshi Bronze Finials */}
          <g>
            <rect x="142" y="82" width="16" height="96" rx="2" fill="url(#bridgeHandrail)" />
            <ellipse cx="150" cy="79" rx="10" ry="6" fill="url(#giboshiBronze)" />
            <circle cx="150" cy="72" r="4" fill="url(#giboshiBronze)" />

            <rect x="362" y="56" width="16" height="106" rx="2" fill="url(#bridgeHandrail)" />
            <ellipse cx="370" cy="53" rx="10" ry="6" fill="url(#giboshiBronze)" />
            <circle cx="370" cy="46" r="4" fill="url(#giboshiBronze)" />

            <rect x="711" y="42" width="18" height="108" rx="2" fill="url(#bridgeHandrail)" />
            <ellipse cx="720" cy="39" rx="11" ry="6.5" fill="url(#giboshiBronze)" />
            <circle cx="720" cy="31" r="4.5" fill="url(#giboshiBronze)" />

            <rect x="1062" y="56" width="16" height="106" rx="2" fill="url(#bridgeHandrail)" />
            <ellipse cx="1070" cy="53" rx="10" ry="6" fill="url(#giboshiBronze)" />
            <circle cx="1070" cy="46" r="4" fill="url(#giboshiBronze)" />

            <rect x="1282" y="82" width="16" height="96" rx="2" fill="url(#bridgeHandrail)" />
            <ellipse cx="1290" cy="79" rx="10" ry="6" fill="url(#giboshiBronze)" />
            <circle cx="1290" cy="72" r="4" fill="url(#giboshiBronze)" />
          </g>

          {/* Main Arched Bridge Deck & Structural Girder Beam */}
          <path
            d="M0 168 Q720 76 1440 168 L1440 278 Q720 186 0 278 Z"
            fill="url(#bridgeTimberMain)"
          />
          <path
            d="M0 168 Q720 76 1440 168 L1440 278 Q720 186 0 278 Z"
            fill="url(#cedarGrain)"
          />
          <path
            d="M0 168 Q720 76 1440 168"
            fill="none"
            stroke="rgba(255, 224, 184, 0.34)"
            strokeWidth="2.2"
          />
          <path
            d="M0 264 Q720 172 1440 264 L1440 280 Q720 188 0 280 Z"
            fill="#190f09"
          />
          <path
            d="M0 264 Q720 172 1440 264"
            fill="none"
            stroke="rgba(232, 188, 138, 0.2)"
            strokeWidth="1.2"
          />

          {/* Forged Bronze/Iron Nail Heads (Byo) */}
          <g fill="#c9a26b" opacity="0.72">
            <circle cx="150" cy="252" r="2.6" />
            <circle cx="296" cy="233" r="2.6" />
            <circle cx="507" cy="212" r="2.6" />
            <circle cx="720" cy="203" r="2.8" />
            <circle cx="933" cy="212" r="2.6" />
            <circle cx="1144" cy="233" r="2.6" />
            <circle cx="1290" cy="252" r="2.6" />
          </g>
        </svg>

        {/* Bridge Deck Plaque Overlay */}
        <div className="absolute inset-0 flex items-center justify-center px-4 pt-4 pb-12 sm:px-8 sm:pt-2 sm:pb-14">
          <div
            className="w-full max-w-3xl rounded-2xl px-5 py-4 text-center backdrop-blur-md sm:px-8 sm:py-5"
            style={{
              background:
                "linear-gradient(180deg, rgba(34, 21, 14, 0.88) 0%, rgba(22, 13, 9, 0.92) 100%)",
              border: "1px solid rgba(235, 198, 148, 0.24)",
              boxShadow:
                "0 18px 40px rgba(0, 0, 0, 0.52), inset 0 1px 0 rgba(255, 224, 184, 0.18)",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
