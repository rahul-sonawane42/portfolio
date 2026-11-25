import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { Theme } from "./ThemeToggle";

interface SteppingStoneProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  title?: string;
  subtitle?: string;
  variant?: number;
  align?: "center" | "left" | "right";
  theme?: Theme;
  /** Compact header stone padding */
  compact?: boolean;
  /** Uncarved fixed-dimension decorative accent pebble (sutegishi) */
  decorative?: boolean;
}

const stonePatternCache = new Map<string, CanvasPattern | null>();

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getStoneTexturePattern(
  ctx: CanvasRenderingContext2D,
  theme: Theme,
  variant: number
): CanvasPattern | null {
  const key = `${theme}:${variant}:v2`;
  if (stonePatternCache.has(key)) {
    return stonePatternCache.get(key) ?? null;
  }

  const tile = document.createElement("canvas");
  tile.width = 256;
  tile.height = 256;
  const tctx = tile.getContext("2d");
  if (!tctx) return null;

  const isDark = theme === "dark";
  const rng = seededRandom((isDark ? 9187 : 4421) + variant * 131);

  // Rich river basalt / Shirakawa granite base
  tctx.fillStyle = isDark ? "#23282e" : "#dbd8cf";
  tctx.fillRect(0, 0, 256, 256);

  // Soft mineral cloud mottling for natural geological depth
  for (let c = 0; c < 42; c++) {
    const cx = rng() * 256;
    const cy = rng() * 256;
    const cr = 18 + rng() * 34;
    const grad = tctx.createRadialGradient(cx, cy, 1, cx, cy, cr);
    if (isDark) {
      grad.addColorStop(
        0,
        rng() < 0.5 ? "rgba(12, 15, 19, 0.22)" : "rgba(56, 64, 72, 0.16)"
      );
      grad.addColorStop(1, "rgba(35, 40, 46, 0)");
    } else {
      grad.addColorStop(
        0,
        rng() < 0.5 ? "rgba(155, 154, 148, 0.18)" : "rgba(255, 254, 250, 0.24)"
      );
      grad.addColorStop(1, "rgba(219, 216, 207, 0)");
    }
    tctx.fillStyle = grad;
    tctx.beginPath();
    tctx.arc(cx, cy, cr, 0, Math.PI * 2);
    tctx.fill();
  }

  // Multi-octave mineral grain: feldspar, quartz, dark biotite & crystalline mica flecks
  for (let i = 0; i < 3200; i++) {
    const x = rng() * 256;
    const y = rng() * 256;
    const r = 0.55 + rng() * 2.05;
    const kind = rng();

    if (isDark) {
      if (kind < 0.44) {
        tctx.fillStyle = `rgba(10, 13, 17, ${0.22 + rng() * 0.28})`;
      } else if (kind < 0.84) {
        tctx.fillStyle = `rgba(68, 76, 86, ${0.15 + rng() * 0.22})`;
      } else {
        tctx.fillStyle = `rgba(218, 228, 238, ${0.1 + rng() * 0.16})`;
      }
    } else {
      if (kind < 0.44) {
        tctx.fillStyle = `rgba(88, 92, 96, ${0.14 + rng() * 0.2})`;
      } else if (kind < 0.84) {
        tctx.fillStyle = `rgba(255, 255, 255, ${0.24 + rng() * 0.3})`;
      } else {
        tctx.fillStyle = `rgba(38, 42, 46, ${0.2 + rng() * 0.24})`;
      }
    }

    tctx.beginPath();
    tctx.arc(x, y, r, 0, Math.PI * 2);
    tctx.fill();
  }

  const pattern = ctx.createPattern(tile, "repeat");
  stonePatternCache.set(key, pattern);
  return pattern;
}

function createOrganicStonePath(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number,
  isPebble: boolean,
  extraInset = 0
) {
  const rng = seededRandom(seed);
  const padX = (isPebble ? 7 : 12) + extraInset;
  const padY = (isPebble ? 7 : 11) + extraInset;
  const rx = Math.max(4, (w - padX * 2) * 0.5);
  const ry = Math.max(4, (h - padY * 2) * 0.5);
  const cx = w * 0.5;
  const cy = h * 0.5;

  // Authentic organic river-boulder superellipse curve
  const n = isPebble ? 2.25 : 3.15;
  const segments = isPebble ? 28 : 52;
  const pts: { x: number; y: number }[] = [];
  const p0 = rng() * Math.PI * 2;
  const p1 = rng() * Math.PI * 2;
  const p2 = rng() * Math.PI * 2;
  const p3 = rng() * Math.PI * 2;

  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const superR = Math.pow(
      Math.pow(Math.abs(cosT), n) + Math.pow(Math.abs(sinT), n),
      -1 / n
    );
    const wobble =
      1 +
      0.015 * Math.sin(2 * theta + p0) +
      0.022 * Math.sin(3 * theta + p1) +
      0.014 * Math.cos(5 * theta + p2) +
      0.008 * Math.sin(7 * theta + p3);

    pts.push({
      x: cx + cosT * rx * superR * wobble,
      y: cy + sinT * ry * superR * wobble,
    });
  }

  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % pts.length];
    const midX = (curr.x + next.x) * 0.5;
    const midY = (curr.y + next.y) * 0.5;
    if (i === 0) {
      const prev = pts[pts.length - 1];
      ctx.moveTo((prev.x + curr.x) * 0.5, (prev.y + curr.y) * 0.5);
    }
    ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
  }
  ctx.closePath();
}

export default function SteppingStone({
  children,
  className = "",
  style,
  id,
  title,
  subtitle,
  variant = 0,
  align = "center",
  theme = "dark",
  compact = false,
  decorative = false,
}: SteppingStoneProps) {
  const articleRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const article = articleRef.current;
    const canvas = canvasRef.current;
    if (!article || !canvas) return;

    const renderStone = () => {
      const rect = article.getBoundingClientRect();
      const w = Math.max(10, Math.round(rect.width));
      const h = Math.max(10, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = w * dpr;
      canvas.height = h * dpr;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const seed = 101 + variant * 97;
      const rng = seededRandom(seed);
      const isDark = theme === "dark";

      // 1. Soft Submerged Waterline Ambient Occlusion & Shadow
      ctx.save();
      ctx.translate(0, 7);
      createOrganicStonePath(ctx, w, h, seed, decorative);
      ctx.fillStyle = isDark
        ? "rgba(2, 5, 8, 0.78)"
        : "rgba(20, 48, 44, 0.32)";
      ctx.filter = "blur(7px)";
      ctx.fill();
      ctx.restore();

      // 2. 3D Quarried Rock Sidewall Thickness Skirt
      ctx.save();
      ctx.translate(0, 4);
      createOrganicStonePath(ctx, w, h, seed, decorative);
      ctx.fillStyle = isDark ? "#0d1116" : "#8b8f94";
      ctx.fill();
      ctx.restore();

      // 3. Main River Boulder Body + Cached Mineral Texture
      ctx.save();
      createOrganicStonePath(ctx, w, h, seed, decorative);
      ctx.clip();

      const pattern = getStoneTexturePattern(ctx, theme, variant);
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, w, h);
      }

      // Directional 3D Rock Illumination Gradient
      const lightGrad = ctx.createLinearGradient(0, 0, w * 0.28, h);
      if (isDark) {
        lightGrad.addColorStop(0, "rgba(175, 202, 224, 0.16)");
        lightGrad.addColorStop(0.45, "rgba(34, 40, 46, 0.12)");
        lightGrad.addColorStop(1, "rgba(7, 10, 14, 0.6)");
      } else {
        lightGrad.addColorStop(0, "rgba(255, 253, 248, 0.52)");
        lightGrad.addColorStop(0.55, "rgba(224, 220, 212, 0.12)");
        lightGrad.addColorStop(1, "rgba(124, 128, 134, 0.38)");
      }
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, w, h);

      // 4. Natural Geological Fracture Veins (Quartz / Basalt Fissures)
      const veinCount = decorative ? 1 : 3;
      for (let v = 0; v < veinCount; v++) {
        let vx = (0.15 + rng() * 0.7) * w;
        let vy = rng() < 0.5 ? 0 : h;
        const dirY = vy === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        const steps = 6;
        for (let s = 1; s <= steps; s++) {
          vx += (rng() - 0.5) * (w * 0.12);
          vy += dirY * (h / steps) * (0.7 + rng() * 0.5);
          ctx.lineTo(vx, vy);
        }
        ctx.strokeStyle = isDark
          ? "rgba(8, 10, 13, 0.48)"
          : "rgba(84, 88, 92, 0.24)";
        ctx.lineWidth = 1.25;
        ctx.stroke();

        ctx.strokeStyle = isDark
          ? "rgba(186, 204, 220, 0.09)"
          : "rgba(255, 255, 255, 0.48)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // 5. Organic Japanese Moss Clusters Near Outer Boulder Rim
      const mossClusters = decorative ? 2 : 5;
      for (let m = 0; m < mossClusters; m++) {
        const angle = rng() * Math.PI * 2;
        const mx = w * 0.5 + Math.cos(angle) * (w * 0.44);
        const my = h * 0.5 + Math.sin(angle) * (h * 0.42);
        const mr = (decorative ? 11 : 24) + rng() * 20;
        const mossGrad = ctx.createRadialGradient(mx, my, 1, mx, my, mr);
        if (isDark) {
          mossGrad.addColorStop(0, "rgba(54, 92, 56, 0.52)");
          mossGrad.addColorStop(0.6, "rgba(38, 68, 42, 0.26)");
          mossGrad.addColorStop(1, "rgba(38, 68, 42, 0)");
        } else {
          mossGrad.addColorStop(0, "rgba(82, 128, 68, 0.46)");
          mossGrad.addColorStop(0.6, "rgba(98, 140, 78, 0.22)");
          mossGrad.addColorStop(1, "rgba(98, 140, 78, 0)");
        }
        ctx.fillStyle = mossGrad;
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Carved Inner Stone Bed Bevel (Inset 16px inside outer boulder rim)
      if (!decorative) {
        ctx.save();
        createOrganicStonePath(ctx, w, h, seed, false, 16);
        ctx.strokeStyle = isDark
          ? "rgba(0, 0, 0, 0.46)"
          : "rgba(72, 76, 80, 0.2)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();

      // 7. Crisp Top Rim Catchlight & Waterline Edge Definition
      ctx.save();
      createOrganicStonePath(ctx, w, h, seed, decorative);
      ctx.strokeStyle = isDark
        ? "rgba(204, 222, 238, 0.2)"
        : "rgba(255, 255, 255, 0.76)";
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.restore();
    };

    renderStone();
    document.fonts?.ready.then(renderStone);
    const ro = new ResizeObserver(renderStone);
    ro.observe(article);
    return () => ro.disconnect();
  }, [theme, variant, decorative]);

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
      data-stepping-stone=""
      aria-hidden={decorative ? "true" : undefined}
      style={style}
      className={`stepping-stone pointer-events-auto ${alignClass} ${className}`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="stone-surface-canvas"
      />

      {!decorative && (
        <div
          className={
            compact ? "stone-content stone-content-compact" : "stone-content"
          }
        >
          {title && (
            <header className="stone-heading">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="stone-inlay" />
                <h2 className="engraved-title text-2xl leading-tight sm:text-3xl md:text-4xl">
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
      )}
    </article>
  );
}
