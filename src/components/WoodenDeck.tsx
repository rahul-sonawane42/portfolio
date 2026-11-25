import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { Theme } from "./ThemeToggle";

interface WoodenDeckProps {
  children: ReactNode;
  className?: string;
  id?: string;
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

/* Graceful Japanese Taiko-Bashi / Soribashi Garden Bridge Arch */
function bridgeArchY(t: number): number {
  return Math.sin(t * Math.PI) * 28;
}

function buildBridgeOutline(
  left: number,
  top: number,
  right: number,
  bottom: number
): Pt[] {
  const w = right - left;
  const pts: Pt[] = [];
  const steps = 56;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({
      x: left + t * w,
      y: top - bridgeArchY(t),
    });
  }

  for (let i = 0; i <= steps; i++) {
    const t = 1 - i / steps;
    pts.push({
      x: left + t * w,
      y: bottom - bridgeArchY(t) * 0.72 + Math.sin(t * Math.PI) * 10,
    });
  }

  return pts;
}

function tracePoly(ctx: CanvasRenderingContext2D, pts: Pt[], ox = 0, oy = 0) {
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const px = pts[i].x + ox;
    const py = pts[i].y + oy;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export default function WoodenDeck({
  children,
  className = "",
  id,
  theme = "dark",
}: WoodenDeckProps) {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const padX = 24;
    const padTop = 68;
    const padBottom = 64;

    const renderBridge = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
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
      const left = padX;
      const top = padTop;
      const bottom = padTop + h;
      const pts = buildBridgeOutline(0, top, cw, bottom);

      const frontEdgeY = (t: number) =>
        bottom - bridgeArchY(t) * 0.72 + Math.sin(t * Math.PI) * 10;
      const backEdgeY = (t: number) => top - bridgeArchY(t);

      // 1. Dark Cedar Support Pilings Standing in the Pond Beneath the Bridge
      const postFractions = [0.22, 0.41, 0.59, 0.78];
      for (const frac of postFractions) {
        const px = left + w * frac;
        const pyTop = frontEdgeY(frac) + 12;
        const postH = 28;
        const postW = 20;

        for (const [rx, ry, alpha] of [
          [34, 10, isLight ? 0.48 : 0.25],
          [21, 6.5, isLight ? 0.72 : 0.38],
        ] as const) {
          ctx.beginPath();
          ctx.ellipse(px, pyTop + postH - 2, rx, ry, 0, 0, Math.PI * 2);
          ctx.strokeStyle = isLight
            ? `rgba(255, 255, 255, ${alpha})`
            : `rgba(155, 198, 232, ${alpha})`;
          ctx.lineWidth = 1.25;
          ctx.stroke();
        }

        const postGrad = ctx.createLinearGradient(
          px - postW / 2,
          0,
          px + postW / 2,
          0
        );
        postGrad.addColorStop(0, "#120c08");
        postGrad.addColorStop(0.35, "#261b14");
        postGrad.addColorStop(0.75, "#1a120d");
        postGrad.addColorStop(1, "#0d0805");
        ctx.fillStyle = postGrad;
        ctx.fillRect(px - postW / 2, pyTop, postW, postH);
      }

      // 2. Soft Underwater Shadow Cast by the Arched Bridge
      ctx.save();
      ctx.shadowColor = isLight
        ? "rgba(22, 54, 68, 0.46)"
        : "rgba(0, 0, 0, 0.92)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 16;
      tracePoly(ctx, pts, 0, 18);
      ctx.fillStyle = isLight
        ? "rgba(26, 62, 78, 0.4)"
        : "rgba(0, 0, 0, 0.85)";
      ctx.fill();
      ctx.restore();

      // 3. Curved Structural Stringer Beam (Keta) & Fascia Under the Front Arch
      const fasciaGrad = ctx.createLinearGradient(0, 0, cw, 0);
      fasciaGrad.addColorStop(0, "#140e0a");
      fasciaGrad.addColorStop(0.3, "#261c15");
      fasciaGrad.addColorStop(0.55, "#2e2219");
      fasciaGrad.addColorStop(0.82, "#1d1510");
      fasciaGrad.addColorStop(1, "#110c08");

      for (let dy = 18; dy >= 2; dy -= 2) {
        tracePoly(ctx, pts, 0, dy);
        ctx.fillStyle = fasciaGrad;
        ctx.fill();
      }

      // 4. Traditional Japanese Bridge Railings (Rankan) Along the Back Arch
      const railPostFracs = [0.09, 0.29, 0.71, 0.91];
      const railHeight = 32;

      // Horizontal middle cross-rail (Nuki) & top handrail (Kasagi)
      for (const [offsetY, thickness] of [
        [15, 5],
        [railHeight, 7],
      ] as const) {
        ctx.beginPath();
        for (let s = 0; s <= 48; s++) {
          const t = 0.06 + (s / 48) * 0.88;
          const px = left + t * w;
          const py = backEdgeY(t) - offsetY;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = "#17110c";
        ctx.lineWidth = thickness + 2.5;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.strokeStyle = "#2d2118";
        ctx.lineWidth = thickness;
        ctx.stroke();

        // Top bevel catchlight on each rail
        ctx.beginPath();
        for (let s = 0; s <= 48; s++) {
          const t = 0.06 + (s / 48) * 0.88;
          const px = left + t * w;
          const py = backEdgeY(t) - offsetY - thickness * 0.35;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = isLight
          ? "rgba(255, 228, 190, 0.38)"
          : "rgba(226, 184, 136, 0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Upright Bridge Newel Posts (Oyabashira) with Giboshi Finial Caps
      for (const frac of railPostFracs) {
        const px = left + w * frac;
        const baseY = backEdgeY(frac) + 4;
        const postTopY = baseY - (railHeight + 10);
        const postW = 10;

        const pGrad = ctx.createLinearGradient(
          px - postW / 2,
          0,
          px + postW / 2,
          0
        );
        pGrad.addColorStop(0, "#140e0a");
        pGrad.addColorStop(0.4, "#31241a");
        pGrad.addColorStop(1, "#120c08");
        ctx.fillStyle = pGrad;
        ctx.fillRect(px - postW / 2, postTopY, postW, baseY - postTopY);

        // Traditional Giboshi Finial Cap (aged bronze / carved stone lotus bud)
        ctx.beginPath();
        ctx.ellipse(px, postTopY - 2, 6.5, 4.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? "#5e5749" : "#3a352c";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(px - 4.5, postTopY - 3);
        ctx.quadraticCurveTo(px, postTopY - 12, px + 4.5, postTopY - 3);
        ctx.closePath();
        ctx.fillStyle = isLight ? "#746c5b" : "#4b4438";
        ctx.fill();

        // Catchlight on giboshi cap
        ctx.beginPath();
        ctx.arc(px - 1.5, postTopY - 5, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = isLight
          ? "rgba(255, 242, 214, 0.55)"
          : "rgba(246, 192, 118, 0.35)";
        ctx.fill();
      }

      // 5. Vertical Smoked-Walnut Planks Clipped to Arched Bridge Outline
      ctx.save();
      tracePoly(ctx, pts, 0, 0);
      ctx.clip();

      const plankTones = [
        "#271d16",
        "#211812",
        "#2d221a",
        "#1c140f",
        "#291f18",
        "#231a14",
      ];
      const rand = mulberry32(2803);
      const yMin = top - 34;
      const yMax = bottom + 24;
      const plankSpanH = yMax - yMin;

      let curX = -6;
      let colIdx = 0;

      while (curX < cw + 6) {
        const plankW = Math.round(31 + (rand() - 0.5) * 7);
        const x0 = curX;
        const x1 = curX + plankW;
        const xMid = (x0 + x1) * 0.5;

        const hasButtJoint = rand() > 0.58;
        const splitY = hasButtJoint
          ? yMin + plankSpanH * (0.3 + rand() * 0.4)
          : yMax;

        const segments = hasButtJoint
          ? [
              { y0: yMin, y1: splitY },
              { y0: splitY, y1: yMax },
            ]
          : [{ y0: yMin, y1: yMax }];

        for (let segIdx = 0; segIdx < segments.length; segIdx++) {
          const seg = segments[segIdx];
          const segH = seg.y1 - seg.y0;
          const tone =
            plankTones[
              (colIdx * 2 + segIdx + Math.floor(rand() * 3)) % plankTones.length
            ];

          ctx.fillStyle = tone;
          ctx.fillRect(x0, seg.y0, plankW, segH);

          const crossGrad = ctx.createLinearGradient(x0, seg.y0, x1, seg.y0);
          crossGrad.addColorStop(0, "rgba(6, 4, 2, 0.28)");
          crossGrad.addColorStop(0.45, "rgba(185, 152, 120, 0.05)");
          crossGrad.addColorStop(1, "rgba(6, 4, 2, 0.24)");
          ctx.fillStyle = crossGrad;
          ctx.fillRect(x0, seg.y0, plankW, segH);

          if (segH > 55) {
            const cyArch = seg.y0 + (0.25 + rand() * 0.5) * segH;
            for (let ring = 1; ring <= 3; ring++) {
              ctx.beginPath();
              ctx.ellipse(
                xMid + (rand() - 0.5) * 4,
                cyArch,
                3.2 * ring,
                24 * ring + rand() * 14,
                (rand() - 0.5) * 0.05,
                0,
                Math.PI * 2
              );
              ctx.strokeStyle = `rgba(8, 5, 3, ${0.22 - ring * 0.04})`;
              ctx.lineWidth = 0.85;
              ctx.stroke();
            }
          }

          const fiberCount = 10;
          for (let g = 0; g < fiberCount; g++) {
            const gxOff = 2.5 + rand() * (plankW - 5);
            const isDarkFiber = rand() > 0.32;
            ctx.beginPath();
            for (let s = 0; s <= 12; s++) {
              const t = s / 12;
              const py = seg.y0 + t * segH;
              const wave = Math.sin(t * 14 + colIdx * 1.9 + g * 0.8) * 0.85;
              const px = x0 + gxOff + wave;
              if (s === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = isDarkFiber
              ? `rgba(7, 4, 2, ${0.22 + rand() * 0.22})`
              : `rgba(176, 142, 108, ${0.045 + rand() * 0.06})`;
            ctx.lineWidth = 0.7 + rand() * 0.65;
            ctx.stroke();
          }

          if (rand() > 0.74) {
            const kx = x0 + (0.28 + rand() * 0.44) * plankW;
            const ky = seg.y0 + (0.2 + rand() * 0.6) * segH;
            ctx.beginPath();
            ctx.ellipse(
              kx,
              ky,
              2.2,
              4.5 + rand() * 3.5,
              (rand() - 0.5) * 0.16,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = "rgba(6, 3, 2, 0.55)";
            ctx.fill();
          }

          if (hasButtJoint && segIdx === 0) {
            ctx.beginPath();
            ctx.moveTo(x0, splitY);
            ctx.lineTo(x1, splitY);
            ctx.strokeStyle = "rgba(6, 4, 2, 0.88)";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x0 + 1, splitY + 1.3);
            ctx.lineTo(x1 - 1, splitY + 1.3);
            ctx.strokeStyle = "rgba(210, 174, 138, 0.12)";
            ctx.lineWidth = 0.85;
            ctx.stroke();

            for (const dyPeg of [-6, 6]) {
              for (const dxPeg of [8, plankW - 8]) {
                ctx.beginPath();
                ctx.arc(x0 + dxPeg, splitY + dyPeg, 1.25, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(6, 4, 2, 0.72)";
                ctx.fill();
              }
            }
          }
        }

        ctx.beginPath();
        ctx.moveTo(x0, yMin);
        ctx.lineTo(x0, yMax);
        ctx.strokeStyle = "rgba(5, 3, 2, 0.92)";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x0 + 1.4, yMin);
        ctx.lineTo(x0 + 1.4, yMax);
        ctx.strokeStyle = isLight
          ? "rgba(255, 226, 186, 0.22)"
          : "rgba(224, 180, 132, 0.11)";
        ctx.lineWidth = 0.9;
        ctx.stroke();

        curX += plankW;
        colIdx++;
      }

      // 6. Curved Perimeter Coping / Bullnose Border Plank
      const drawBorderTrim = (isTopEdge: boolean) => {
        ctx.beginPath();
        const steps = 56;
        const trimWidth = 9;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const px = t * cw;
          const py = isTopEdge ? backEdgeY(t) : frontEdgeY(t);
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        for (let s = steps; s >= 0; s--) {
          const t = s / steps;
          const px = t * cw;
          const py = isTopEdge
            ? backEdgeY(t) + trimWidth
            : frontEdgeY(t) - trimWidth;
          ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = "#221913";
        ctx.fill();
        ctx.strokeStyle = "rgba(6, 4, 2, 0.85)";
        ctx.lineWidth = 1.3;
        ctx.stroke();
      };
      drawBorderTrim(true);
      drawBorderTrim(false);

      // 7. Theme Lighting Pass (Same dark wood colors — only lighting changes)
      if (isLight) {
        const sunWash = ctx.createLinearGradient(0, top, cw, bottom);
        sunWash.addColorStop(0, "rgba(255, 236, 204, 0.18)");
        sunWash.addColorStop(0.5, "rgba(255, 224, 178, 0.11)");
        sunWash.addColorStop(1, "rgba(28, 18, 10, 0.14)");
        ctx.fillStyle = sunWash;
        ctx.fillRect(0, 0, cw, ch);
      } else {
        const lanternCenter = ctx.createRadialGradient(
          cw * 0.45,
          top + h * 0.45,
          20,
          cw * 0.48,
          top + h * 0.5,
          cw * 0.42
        );
        lanternCenter.addColorStop(0, "rgba(246, 174, 92, 0.17)");
        lanternCenter.addColorStop(0.55, "rgba(176, 114, 54, 0.05)");
        lanternCenter.addColorStop(1, "rgba(4, 6, 10, 0.42)");
        ctx.fillStyle = lanternCenter;
        ctx.fillRect(0, 0, cw, ch);
      }

      ctx.restore();

      // 8. Crisp Top Rim Catchlight Along the Bridge Edge
      tracePoly(ctx, pts, 0, 0);
      ctx.strokeStyle = isLight
        ? "rgba(255, 228, 190, 0.42)"
        : "rgba(218, 178, 134, 0.22)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 9. Moss-Draped Granite Bridge Abutments (Hashidai) Anchoring Both Ends
      for (const side of ["left", "right"] as const) {
        const isLeft = side === "left";
        const ax = isLeft ? left - 6 : left + w + 6;
        const ay = (backEdgeY(isLeft ? 0 : 1) + frontEdgeY(isLeft ? 0 : 1)) * 0.5;
        const rx = Math.min(92, w * 0.11);
        const ry = h * 0.62;

        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < 24; i++) {
          const theta = (i / 24) * Math.PI * 2;
          const jitter = 1 + 0.08 * Math.sin(theta * 3 + (isLeft ? 1 : 3));
          const px = ax + Math.cos(theta) * rx * jitter;
          const py = ay + Math.sin(theta) * ry * jitter;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        ctx.fillStyle = isLight ? "#c6c0b4" : "#22272d";
        ctx.fill();
        ctx.strokeStyle = isLight
          ? "rgba(255, 255, 255, 0.6)"
          : "rgba(195, 210, 225, 0.18)";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Cushioned Garden Moss Tufts on Top of the Stone Abutment
        ctx.clip();
        const randMoss = mulberry32(isLeft ? 311 : 733);
        for (let m = 0; m < 18; m++) {
          const mx = ax + (randMoss() - 0.5) * rx * 1.5;
          const my = ay - ry * (0.15 + randMoss() * 0.65);
          ctx.beginPath();
          ctx.ellipse(
            mx,
            my,
            10 + randMoss() * 14,
            6 + randMoss() * 8,
            0,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = isLight
            ? `rgba(56, 98, 62, ${0.42 + randMoss() * 0.25})`
            : `rgba(34, 62, 44, ${0.55 + randMoss() * 0.25})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // 10. Stone Landing Threshold (Kutsunugi-ishi) Linking Bridge Center to Stepping Stones
      const stepX = cw * 0.5;
      const stepY = frontEdgeY(0.5) + 18;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(stepX, stepY, 64, 15, 0, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? "#d4cfc4" : "#262c33";
      ctx.fill();
      ctx.strokeStyle = isLight
        ? "rgba(255, 255, 255, 0.72)"
        : "rgba(205, 220, 236, 0.22)";
      ctx.lineWidth = 1.25;
      ctx.stroke();
      ctx.restore();
    };

    renderBridge();
    const ro = new ResizeObserver(renderBridge);
    ro.observe(container);
    return () => ro.disconnect();
  }, [theme]);

  return (
    <article
      ref={containerRef}
      id={id}
      className={`wooden-deck pointer-events-auto ${className}`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="deck-surface-canvas"
      />
      <div className="deck-content">{children}</div>
    </article>
  );
}
