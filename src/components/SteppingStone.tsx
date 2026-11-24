import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { Theme } from "./ThemeToggle";

interface SteppingStoneProps {
  children: ReactNode;
  className?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  variant?: 0 | 1 | 2 | 3 | 4;
  align?: "center" | "left" | "right";
  theme?: Theme;
}

interface Pt {
  x: number;
  y: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildBoulderPolygon(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  variant: number
): Pt[] {
  const rand = mulberry32(4109 + variant * 977);
  const steps = 36;
  const p = 3.1; // Flat-topped river boulder superellipse exponent
  const phases = [
    rand() * Math.PI * 2,
    rand() * Math.PI * 2,
    rand() * Math.PI * 2,
  ];
  const pts: Pt[] = [];

  for (let i = 0; i < steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    // Superellipse base contour (flat horizontal top/bottom, rounded-faceted sides)
    const sx = Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / p);
    const sy = Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / p);

    // Organic hand-quarried stone cleavage facets
    const facet =
      1 +
      0.022 * Math.sin(3 * theta + phases[0]) +
      0.015 * Math.cos(5 * theta + phases[1]) +
      0.009 * Math.sin(9 * theta + phases[2]) +
      (rand() - 0.5) * 0.008;

    pts.push({
      x: cx + sx * rx * facet,
      y: cy + sy * ry * facet,
    });
  }
  return pts;
}

function tracePoly(ctx: CanvasRenderingContext2D, pts: Pt[], ox = 0, oy = 0, scale = 1, cx = 0, cy = 0) {
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const px = cx + (pts[i].x - cx) * scale + ox;
    const py = cy + (pts[i].y - cy) * scale + oy;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export default function SteppingStone({
  children,
  className = "",
  id,
  title,
  subtitle,
  variant = 0,
  align = "center",
  theme = "dark",
}: SteppingStoneProps) {
  const articleRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const article = articleRef.current;
    const canvas = canvasRef.current;
    if (!article || !canvas) return;

    const padX = 28;
    const padTop = 20;
    const padBottom = 38;

    const renderStone = () => {
      const w = article.offsetWidth;
      const h = article.offsetHeight;
      if (w <= 0 || h <= 0) return;

      const cw = w + padX * 2;
      const ch = h + padTop + padBottom;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      canvas.style.left = `${-padX}px`;
      canvas.style.top = `${-padTop}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      const isLight = theme === "light";
      const cx = cw / 2;
      const cy = padTop + h / 2;
      const rx = w / 2 + 6;
      const ry = h / 2 + 4;
      const pts = buildBoulderPolygon(cx, cy, rx, ry, variant);

      // 1. Concentric Water Meniscus Ripples Around Submerged Stone
      ctx.save();
      for (const [scale, alpha] of [
        [1.032, isLight ? 0.42 : 0.24],
        [1.016, isLight ? 0.62 : 0.36],
      ] as const) {
        tracePoly(ctx, pts, 0, 12, scale, cx, cy);
        ctx.strokeStyle = isLight
          ? `rgba(255, 255, 255, ${alpha})`
          : `rgba(148, 192, 224, ${alpha})`;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }
      ctx.restore();

      // 2. Soft Underwater Pond Shadow
      ctx.save();
      ctx.shadowColor = isLight
        ? "rgba(24, 58, 74, 0.36)"
        : "rgba(0, 0, 0, 0.85)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 10;
      tracePoly(ctx, pts, 0, 18);
      ctx.fillStyle = isLight ? "rgba(32, 68, 84, 0.35)" : "rgba(0, 0, 0, 0.75)";
      ctx.fill();
      ctx.restore();

      // 3. Wet Darkened Waterline Base Collar (Submerged Rim)
      tracePoly(ctx, pts, 0, 22, 1.006, cx, cy);
      ctx.fillStyle = isLight ? "#556466" : "#080b0e";
      ctx.fill();

      // 4. Chiseled 3D Vertical Rock Thickness / Side Wall (16px height)
      const sideGrad = ctx.createLinearGradient(0, 0, cw, 0);
      if (isLight) {
        sideGrad.addColorStop(0, "#8f8a7f");
        sideGrad.addColorStop(0.28, "#b2ada2");
        sideGrad.addColorStop(0.72, "#878278");
        sideGrad.addColorStop(1, "#69655c");
      } else {
        sideGrad.addColorStop(0, "#191e23");
        sideGrad.addColorStop(0.28, "#282f36");
        sideGrad.addColorStop(0.72, "#171b20");
        sideGrad.addColorStop(1, "#0e1114");
      }

      for (let dy = 16; dy >= 2; dy -= 2) {
        tracePoly(ctx, pts, 0, dy);
        ctx.fillStyle = sideGrad;
        ctx.fill();
      }

      // Vertical Cleavage Facets on the Front Rock Side-Wall
      ctx.save();
      tracePoly(ctx, pts, 0, 16);
      ctx.clip();
      const randCleavage = mulberry32(9001 + variant * 313);
      for (let x = padX; x < cw - padX; x += 22 + randCleavage() * 24) {
        ctx.beginPath();
        ctx.moveTo(x, cy + ry - 26);
        ctx.lineTo(x + (randCleavage() - 0.5) * 6, cy + ry + 20);
        ctx.strokeStyle =
          randCleavage() > 0.45
            ? isLight
              ? "rgba(45, 42, 36, 0.28)"
              : "rgba(0, 0, 0, 0.55)"
            : isLight
              ? "rgba(255, 255, 255, 0.35)"
              : "rgba(210, 224, 238, 0.12)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.restore();

      // 5. Flat Opaque Top River-Granite Face
      const topGrad = ctx.createLinearGradient(padX, padTop, cw - padX, ch - padBottom);
      if (isLight) {
        // Warm sunlit Shirakawa granite
        topGrad.addColorStop(0, "#eae6dd");
        topGrad.addColorStop(0.45, "#dfdbd1");
        topGrad.addColorStop(1, "#cec9be");
      } else {
        // Moonlit cool river basalt/granite (visible mineral tone, not pitch black)
        topGrad.addColorStop(0, "#31373e");
        topGrad.addColorStop(0.48, "#262b31");
        topGrad.addColorStop(1, "#1c2025");
      }

      tracePoly(ctx, pts, 0, 0);
      ctx.fillStyle = topGrad;
      ctx.fill();

      // 6. Tactile Mineral Grain, Quartz Flecks, Biotite Specks & Hairline Veins
      ctx.save();
      tracePoly(ctx, pts, 0, 0);
      ctx.clip();

      const rand = mulberry32(7717 + variant * 521);
      const area = w * h;
      const speckCount = Math.min(4800, Math.floor(area * 0.014));

      for (let i = 0; i < speckCount; i++) {
        const sx = padX + rand() * w;
        const sy = padTop + rand() * h;
        const size = 0.8 + rand() * 1.6;
        const kind = rand();

        if (kind < 0.46) {
          // Dark biotite / mica mineral grain
          ctx.fillStyle = isLight
            ? `rgba(52, 48, 42, ${0.06 + rand() * 0.11})`
            : `rgba(8, 10, 13, ${0.18 + rand() * 0.24})`;
        } else if (kind < 0.88) {
          // Pale quartz / feldspar mineral fleck
          ctx.fillStyle = isLight
            ? `rgba(255, 255, 255, ${0.18 + rand() * 0.28})`
            : `rgba(195, 208, 222, ${0.05 + rand() * 0.09})`;
        } else {
          // Warm iron/ochre mineral tint
          ctx.fillStyle = isLight
            ? `rgba(148, 128, 98, ${0.07 + rand() * 0.08})`
            : `rgba(140, 124, 102, ${0.04 + rand() * 0.05})`;
        }
        ctx.fillRect(sx, sy, size, size);
      }

      // Subtle Natural Quartz / Mineral Veins
      const veinCount = 3;
      for (let v = 0; v < veinCount; v++) {
        let vx = padX + (0.15 + rand() * 0.7) * w;
        let vy = padTop + rand() * h;
        let angle = (rand() - 0.5) * 1.2;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        for (let step = 0; step < 14; step++) {
          angle += (rand() - 0.5) * 0.45;
          vx += Math.cos(angle) * (w / 14);
          vy += Math.sin(angle) * 12;
          ctx.lineTo(vx, vy);
        }
        ctx.strokeStyle = isLight
          ? "rgba(255, 255, 255, 0.28)"
          : "rgba(180, 196, 214, 0.07)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Subtle Hand-Dressed Inner Mason Frame (Tobi-ishi border relief)
      tracePoly(ctx, pts, 0, 0, 0.968, cx, cy);
      ctx.strokeStyle = isLight
        ? "rgba(48, 44, 38, 0.14)"
        : "rgba(0, 0, 0, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      // 7. Chiseled Top Rim Bevel Highlight & Lower Edge Shadow
      tracePoly(ctx, pts, 0, 0);
      ctx.strokeStyle = isLight
        ? "rgba(255, 255, 255, 0.85)"
        : "rgba(215, 228, 242, 0.26)";
      ctx.lineWidth = 1.75;
      ctx.stroke();
    };

    renderStone();
    const ro = new ResizeObserver(renderStone);
    ro.observe(article);
    return () => ro.disconnect();
  }, [theme, variant]);

  const alignClass =
    align === "left"
      ? "stone-shift-left"
      : align === "right"
        ? "stone-shift-right"
        : "";

  return (
    <article
      ref={articleRef}
      id={id}
      data-stepping-stone
      className={`stepping-stone pointer-events-auto ${alignClass} ${className}`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="stone-surface-canvas"
      />

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
