import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { Theme } from "./ThemeToggle";

interface SteppingStoneProps {
  children?: ReactNode;
  className?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  variant?: number;
  align?: "center" | "left" | "right";
  theme?: Theme;
  /** Compact padding & no outer koi collider when used inside a flagstone cluster */
  inCluster?: boolean;
  /** Uncarved decorative accent stone (sutegishi) tucked into cluster gaps */
  decorative?: boolean;
  minHeight?: number;
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

/* Broad, flat-shouldered quarried river flagstone exponent */
const BOULDER_EXPONENT = 4.6;

function buildBoulderPolygon(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  variant: number
): Pt[] {
  const rand = mulberry32(4109 + variant * 977);
  const steps = 44;
  const p = BOULDER_EXPONENT;
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

    const sx = Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / p);
    const sy = Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / p);

    const facet =
      1 +
      0.018 * Math.sin(3 * theta + phases[0]) +
      0.012 * Math.cos(5 * theta + phases[1]) +
      0.007 * Math.sin(9 * theta + phases[2]) +
      (rand() - 0.5) * 0.006;

    pts.push({
      x: cx + sx * rx * facet,
      y: cy + sy * ry * facet,
    });
  }
  return pts;
}

function tracePoly(
  ctx: CanvasRenderingContext2D,
  pts: Pt[],
  ox = 0,
  oy = 0,
  scale = 1,
  cx = 0,
  cy = 0
) {
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
  inCluster = false,
  decorative = false,
  minHeight = 96,
}: SteppingStoneProps) {
  const articleRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const article = articleRef.current;
    const canvas = canvasRef.current;
    if (!article || !canvas) return;

    const padX = 36;
    const padTop = 28;
    const padBottom = 46;

    const updateAndRender = () => {
      const w = article.offsetWidth;
      if (w <= 0) return;

      // 1. Closed-Form Inscribed Safe Padding (Compact Caps + Zero Overflow)
      if (!decorative && measureRef.current) {
        const innerW = measureRef.current.offsetWidth;
        const innerH = measureRef.current.offsetHeight;

        if (innerW > 0 && innerH > 0) {
          const safeScale = 0.86;
          const rxSafe = (w / 2 + 16) * safeScale;
          const u = Math.min(0.92, innerW / 2 / rxSafe);
          const alpha = Math.pow(
            Math.max(0.15, 1 - Math.pow(u, BOULDER_EXPONENT)),
            1 / BOULDER_EXPONENT
          );

          const minPadY = inCluster ? 24 : 34;
          const requiredH = Math.max(
            innerH + minPadY * 2,
            innerH / (alpha * safeScale) - 24
          );
          const padY = Math.ceil((requiredH - innerH) / 2);
          article.style.setProperty("--stone-pad-y", `${padY}px`);
        }
      }

      const h = article.offsetHeight;
      if (h <= 0) return;

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
      const rx = w / 2 + 16;
      const ry = h / 2 + 14;
      const pts = buildBoulderPolygon(cx, cy, rx, ry, variant);

      // 1. Soft Blended Underwater Pond Shadow (Stitches Stone Into Water Column)
      ctx.save();
      ctx.shadowColor = isLight
        ? "rgba(24, 58, 74, 0.34)"
        : "rgba(0, 0, 0, 0.84)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;
      tracePoly(ctx, pts, 0, 18, 1.015, cx, cy);
      ctx.fillStyle = isLight
        ? "rgba(32, 68, 84, 0.28)"
        : "rgba(0, 0, 0, 0.68)";
      ctx.fill();
      ctx.restore();

      // 2. Submerged Translucent Wet Collar (Blends Seamlessly Into Pond Bed)
      const collarGrad = ctx.createLinearGradient(0, cy - ry, 0, cy + ry + 24);
      if (isLight) {
        collarGrad.addColorStop(0, "rgba(86, 118, 128, 0.25)");
        collarGrad.addColorStop(0.65, "rgba(72, 102, 112, 0.58)");
        collarGrad.addColorStop(1, "rgba(56, 86, 98, 0.72)");
      } else {
        collarGrad.addColorStop(0, "rgba(10, 18, 26, 0.32)");
        collarGrad.addColorStop(0.65, "rgba(7, 13, 20, 0.72)");
        collarGrad.addColorStop(1, "rgba(4, 8, 14, 0.88)");
      }
      tracePoly(ctx, pts, 0, 22, 1.01, cx, cy);
      ctx.fillStyle = collarGrad;
      ctx.fill();

      // 3. Chiseled 3D Vertical Rock Thickness / Side Wall (16px height)
      const sideGrad = ctx.createLinearGradient(0, 0, cw, 0);
      if (isLight) {
        sideGrad.addColorStop(0, "#8a857a");
        sideGrad.addColorStop(0.28, "#b0aba0");
        sideGrad.addColorStop(0.72, "#827d73");
        sideGrad.addColorStop(1, "#635f56");
      } else {
        sideGrad.addColorStop(0, "#171c21");
        sideGrad.addColorStop(0.28, "#293038");
        sideGrad.addColorStop(0.72, "#15191e");
        sideGrad.addColorStop(1, "#0c0f12");
      }

      for (let dy = 16; dy >= 2; dy -= 2) {
        tracePoly(ctx, pts, 0, dy);
        ctx.fillStyle = sideGrad;
        ctx.fill();
      }

      // Vertical Cleavage Facets & Water-Bounce Rim Along Lower Rock Wall
      ctx.save();
      tracePoly(ctx, pts, 0, 16);
      ctx.clip();
      const randCleavage = mulberry32(9001 + variant * 313);
      for (
        let x = padX - 10;
        x < cw - padX + 10;
        x += 18 + randCleavage() * 22
      ) {
        ctx.beginPath();
        ctx.moveTo(x, cy + ry - 30);
        ctx.lineTo(x + (randCleavage() - 0.5) * 7, cy + ry + 20);
        ctx.strokeStyle =
          randCleavage() > 0.45
            ? isLight
              ? "rgba(42, 39, 34, 0.32)"
              : "rgba(0, 0, 0, 0.62)"
            : isLight
              ? "rgba(255, 255, 255, 0.38)"
              : "rgba(210, 224, 238, 0.14)";
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }

      // Cool pond-water light reflection bouncing onto the lower wet rock wall
      const bounceGrad = ctx.createLinearGradient(0, cy + ry - 12, 0, cy + ry + 18);
      bounceGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
      bounceGrad.addColorStop(
        1,
        isLight ? "rgba(210, 242, 255, 0.36)" : "rgba(110, 164, 214, 0.18)"
      );
      ctx.fillStyle = bounceGrad;
      ctx.fillRect(0, cy + ry - 12, cw, 32);
      ctx.restore();

      // 4. Flat Opaque Top River-Granite Face
      const topGrad = ctx.createLinearGradient(
        padX,
        padTop,
        cw - padX,
        ch - padBottom
      );
      if (isLight) {
        topGrad.addColorStop(0, "#ece8df");
        topGrad.addColorStop(0.45, "#dfd9ce");
        topGrad.addColorStop(1, "#cbc5b9");
      } else {
        topGrad.addColorStop(0, "#333941");
        topGrad.addColorStop(0.48, "#262b31");
        topGrad.addColorStop(1, "#1b1f24");
      }

      tracePoly(ctx, pts, 0, 0);
      ctx.fillStyle = topGrad;
      ctx.fill();

      // 5. Multi-Scale Geological Stone Texture
      ctx.save();
      tracePoly(ctx, pts, 0, 0);
      ctx.clip();

      const rand = mulberry32(7717 + variant * 521);
      const area = cw * ch;

      // 5a. Coarse Mineral Mottling Patches
      const patchCount = Math.min(260, Math.floor(area * 0.00055));
      for (let i = 0; i < patchCount; i++) {
        const px = rand() * cw;
        const py = rand() * ch;
        const prx = 4 + rand() * 11;
        const pry = 3 + rand() * 8;
        const rot = rand() * Math.PI;
        const darkPatch = rand() > 0.48;

        ctx.beginPath();
        ctx.ellipse(px, py, prx, pry, rot, 0, Math.PI * 2);
        ctx.fillStyle = darkPatch
          ? isLight
            ? `rgba(68, 62, 54, ${0.045 + rand() * 0.055})`
            : `rgba(8, 10, 14, ${0.14 + rand() * 0.16})`
          : isLight
            ? `rgba(255, 253, 248, ${0.12 + rand() * 0.14})`
            : `rgba(188, 202, 218, ${0.035 + rand() * 0.045})`;
        ctx.fill();
      }

      // 5b. High-Density Crystalline Grit
      const speckCount = Math.min(7200, Math.floor(area * 0.018));
      for (let i = 0; i < speckCount; i++) {
        const sx = rand() * cw;
        const sy = rand() * ch;
        const size = 0.75 + rand() * 1.85;
        const kind = rand();

        if (kind < 0.48) {
          ctx.fillStyle = isLight
            ? `rgba(48, 44, 38, ${0.08 + rand() * 0.14})`
            : `rgba(6, 8, 11, ${0.22 + rand() * 0.28})`;
        } else if (kind < 0.88) {
          ctx.fillStyle = isLight
            ? `rgba(255, 255, 255, ${0.22 + rand() * 0.32})`
            : `rgba(205, 218, 232, ${0.06 + rand() * 0.11})`;
        } else {
          ctx.fillStyle = isLight
            ? `rgba(142, 120, 88, ${0.09 + rand() * 0.09})`
            : `rgba(148, 130, 104, ${0.05 + rand() * 0.06})`;
        }
        ctx.fillRect(sx, sy, size, size);
      }

      // 5c. Recessed Hairline Rock Fissures with Highlight Ridges
      const fissureCount = decorative ? 3 : 5;
      for (let f = 0; f < fissureCount; f++) {
        let vx = (0.1 + rand() * 0.8) * cw;
        let vy = (0.1 + rand() * 0.8) * ch;
        let angle = (rand() - 0.5) * 1.4;
        const crackPts: Pt[] = [{ x: vx, y: vy }];

        for (let step = 0; step < 16; step++) {
          angle += (rand() - 0.5) * 0.52;
          vx += Math.cos(angle) * (cw / 18);
          vy += Math.sin(angle) * 13;
          crackPts.push({ x: vx, y: vy });
        }

        ctx.beginPath();
        crackPts.forEach((pt, idx) =>
          idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)
        );
        ctx.strokeStyle = isLight
          ? "rgba(54, 49, 42, 0.18)"
          : "rgba(5, 7, 10, 0.45)";
        ctx.lineWidth = 1.1;
        ctx.stroke();

        ctx.beginPath();
        crackPts.forEach((pt, idx) =>
          idx === 0
            ? ctx.moveTo(pt.x + 1, pt.y + 1)
            : ctx.lineTo(pt.x + 1, pt.y + 1)
        );
        ctx.strokeStyle = isLight
          ? "rgba(255, 255, 255, 0.34)"
          : "rgba(200, 214, 230, 0.09)";
        ctx.lineWidth = 0.85;
        ctx.stroke();
      }

      // 5d. Damp Moss/Lichen Patina Near the Outer Stone Rim
      const mossSpots = decorative ? 65 : 45;
      for (let m = 0; m < mossSpots; m++) {
        const theta = rand() * Math.PI * 2;
        const rimFactor = decorative
          ? 0.55 + rand() * 0.42
          : 0.89 + rand() * 0.1;
        const mx = cx + Math.cos(theta) * rx * rimFactor;
        const my = cy + Math.sin(theta) * ry * rimFactor;
        ctx.beginPath();
        ctx.arc(mx, my, 2.5 + rand() * 5, 0, Math.PI * 2);
        ctx.fillStyle = isLight
          ? `rgba(74, 112, 82, ${0.09 + rand() * 0.08})`
          : `rgba(68, 108, 84, ${0.08 + rand() * 0.09})`;
        ctx.fill();
      }

      // 5e. Carved Recessed Inner Stone Bed
      if (!decorative) {
        tracePoly(ctx, pts, 0, -1, 0.905, cx, cy);
        ctx.strokeStyle = isLight
          ? "rgba(44, 40, 34, 0.22)"
          : "rgba(0, 0, 0, 0.52)";
        ctx.lineWidth = 1.35;
        ctx.stroke();

        tracePoly(ctx, pts, 0, 1, 0.905, cx, cy);
        ctx.strokeStyle = isLight
          ? "rgba(255, 255, 255, 0.52)"
          : "rgba(210, 224, 238, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();

      // 6. Chiseled Top Rim Bevel Highlight
      tracePoly(ctx, pts, 0, 0);
      ctx.strokeStyle = isLight
        ? "rgba(255, 255, 255, 0.88)"
        : "rgba(215, 228, 242, 0.28)";
      ctx.lineWidth = 1.75;
      ctx.stroke();
    };

    updateAndRender();
    const ro = new ResizeObserver(updateAndRender);
    ro.observe(article);
    if (measureRef.current) ro.observe(measureRef.current);
    return () => ro.disconnect();
  }, [theme, variant, inCluster, decorative]);

  const alignClass =
    !inCluster && align === "left"
      ? "stone-shift-left"
      : !inCluster && align === "right"
        ? "stone-shift-right"
        : "";

  const baseClass = inCluster
    ? "stepping-stone stepping-stone-cluster pointer-events-auto"
    : `stepping-stone pointer-events-auto ${alignClass}`;

  return (
    <article
      ref={articleRef}
      id={id}
      data-stone-shore=""
      aria-hidden={decorative ? "true" : undefined}
      {...(!inCluster ? { "data-stepping-stone": "" } : {})}
      style={decorative ? { minHeight: `${minHeight}px` } : undefined}
      className={`${baseClass} ${className}`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="stone-surface-canvas"
      />

      {!decorative && (
        <div
          className={
            inCluster ? "stone-content stone-content-cluster" : "stone-content"
          }
        >
          <div ref={measureRef} className="w-full">
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
        </div>
      )}
    </article>
  );
}
