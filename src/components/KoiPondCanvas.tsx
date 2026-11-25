import { useEffect, useRef } from "react";
import type { Theme } from "./ThemeToggle";

const PAL = {
  dark: {
    bgTop: "#040a11",
    bgMid: "#02060b",
    bgBottom: "#000000",
    koi: ["#FF4D00", "#F8FAFC", "#FFB800"],
    eye: "#F8FAFC",
    bed: "#16232F",
    shadow: "#14212E",
    rock: "#2C4156",
    weed: "#2C6B52",
    moss: "#285943",
    grass: "#3D8262",
    grassTip: "#6BB38E",
    pad: "#214E3A",
    padRim: "#397A5C",
    lotus: "#F4A261",
    bamboo: "#2E5B44",
    bambooNode: "#4A8566",
    lanternStone: "#4E5863",
    lanternGlow: "#FFB347",
    waterDim: "#1A2736",
    waterMid: "#3B5A78",
    glintBright: "#E4F2FF",
    glintSoft: "#8DB4DA",
    food: "#FFB800",
  },
  light: {
    bgTop: "#B2DAE8",
    bgMid: "#8EC2D6",
    bgBottom: "#5D96AF",
    koi: ["#FF451A", "#FFFFFF", "#FFB703"],
    eye: "#181B20",
    bed: "#6A9FB6",
    shadow: "#2F5F75",
    rock: "#5B8CA3",
    weed: "#2E7A5C",
    moss: "#3A7D5C",
    grass: "#2D6A4F",
    grassTip: "#529978",
    pad: "#2E7052",
    padRim: "#489974",
    lotus: "#E76F51",
    bamboo: "#2D6A4F",
    bambooNode: "#40916C",
    lanternStone: "#7A766C",
    lanternGlow: "#F48C06",
    waterDim: "#8FBDCF",
    waterMid: "#CFE8F2",
    glintBright: "#FFFFFF",
    glintSoft: "#EAF6FB",
    food: "#FF451A",
  },
};

const RAMP = " .:-=+*#%@";
const W = [3.6, 5.0, 5.8, 5.7, 5.0, 4.1, 3.1, 2.3, 1.6, 1.15, 0.9];
const N = W.length;
const OVERSCAN = 220;

const ATLAS_CHARS = [
  "#",
  "=",
  ":",
  ".",
  "^",
  "(",
  ")",
  "o",
  "m",
  "'",
  "/",
  "\\",
  "|",
  "~",
  "*",
  "@",
  "+",
  "-",
  "{",
  "}",
  "[",
  "]",
  "_",
] as const;

const ATLAS_CHAR_INDEX = new Map<string, number>(
  ATLAS_CHARS.map((ch, idx) => [ch, idx])
);

const ATLAS_COLOR_KEYS = [
  "rock",
  "weed",
  "moss",
  "grass",
  "grassTip",
  "pad",
  "padRim",
  "lotus",
  "bamboo",
  "bambooNode",
  "lanternStone",
  "lanternGlow",
  "food",
  "waterMid",
  "glintSoft",
  "glintBright",
] as const;

type AtlasColorKey = (typeof ATLAS_COLOR_KEYS)[number];
const ATLAS_COLOR_INDEX = new Map<AtlasColorKey, number>(
  ATLAS_COLOR_KEYS.map((key, idx) => [key, idx])
);

const hex = (h: string) =>
  [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const x = hex(a),
    y = hex(b);
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(",")})`;
};

// Fast rational Gaussian approximation (~15x faster than Math.exp in inner loops)
const fastGauss = (d2: number) =>
  d2 > 8 ? 0 : 1 / (1 + d2 + 0.48 * d2 * d2);

interface P {
  x: number;
  y: number;
}
interface Koi {
  x: number;
  y: number;
  a: number;
  sp: number;
  s: number;
  ph: number;
  tx: number;
  ty: number;
  wanderTimer: number;
  wakeTimer: number;
  seg: P[];
  pat: number[];
  spot: number[];
}
interface Food {
  x: number;
  y: number;
  age: number;
  dead: boolean;
}
interface Ripple {
  x: number;
  y: number;
  t: number;
  life: number;
  speed: number;
  wake?: boolean;
}
interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}
interface StoneBox {
  x: number;
  y: number;
  rx: number;
  ry: number;
  shoreRx: number;
  shoreRy: number;
}

export default function KoiPondCanvas({ theme }: { theme: Theme }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const target = useRef(theme === "dark" ? 0 : 1);
  target.current = theme === "dark" ? 0 : 1;

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;

    const glowCanvas = document.createElement("canvas");
    const glowCtx = glowCanvas.getContext("2d")!;
    const bloomScale = 0.16;

    const atlasCanvas = document.createElement("canvas");
    const atlasCtx = atlasCanvas.getContext("2d")!;
    let atlasStepW = 10;
    let atlasStepH = 18;
    let lastAtlasMix = -1;

    const fs = 13;
    let cw = 8,
      chh = 15,
      cols = 0,
      rows = 0,
      vw = 0,
      vh = 0,
      renderH = 0;
    let worldHeight = Math.max(
      window.innerHeight,
      document.documentElement.scrollHeight
    );
    let val = new Float32Array(0),
      col = new Uint8Array(0);
    let colSin1 = new Float32Array(0),
      colU = new Float32Array(0),
      colBand = new Float32Array(0),
      colSpA = new Float32Array(0),
      colSpB = new Float32Array(0),
      colPx = new Float32Array(0);

    const mouse = { x: -9999, y: -9999 };
    const stones: StoneBox[] = [];
    const foods: Food[] = [],
      ripples: Ripple[] = [],
      sparks: Spark[] = [];
    let tmix = target.current;
    let lastAnchorY = Number.NaN;

    const rebuildAtlas = (palette: Record<AtlasColorKey, string>) => {
      atlasStepW = Math.ceil(cw + 2);
      atlasStepH = Math.ceil(chh + 2);
      atlasCanvas.width = ATLAS_CHARS.length * atlasStepW;
      atlasCanvas.height = ATLAS_COLOR_KEYS.length * atlasStepH;
      atlasCtx.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);
      atlasCtx.font = `600 ${fs}px "JetBrains Mono", ui-monospace, Menlo, monospace`;
      atlasCtx.textBaseline = "top";

      ATLAS_COLOR_KEYS.forEach((key, rIdx) => {
        atlasCtx.fillStyle = palette[key];
        ATLAS_CHARS.forEach((ch, cIdx) => {
          atlasCtx.fillText(ch, cIdx * atlasStepW + 1, rIdx * atlasStepH + 1);
        });
      });
    };

    const stampGlyph = (
      targetCtx: CanvasRenderingContext2D,
      ch: string,
      colorKey: AtlasColorKey,
      dx: number,
      dy: number
    ) => {
      const cIdx = ATLAS_CHAR_INDEX.get(ch);
      const rIdx = ATLAS_COLOR_INDEX.get(colorKey);
      if (cIdx === undefined || rIdx === undefined) return;
      targetCtx.drawImage(
        atlasCanvas,
        cIdx * atlasStepW + 1,
        rIdx * atlasStepH + 1,
        cw,
        chh,
        dx,
        dy,
        cw,
        chh
      );
    };

    const stampText = (
      targetCtx: CanvasRenderingContext2D,
      text: string,
      colorKey: AtlasColorKey,
      dx: number,
      dy: number
    ) => {
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch !== " ") {
          stampGlyph(targetCtx, ch, colorKey, dx + i * cw, dy);
        }
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = window.innerWidth;
      vh = window.innerHeight;
      renderH = vh + OVERSCAN * 2;

      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(renderH * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${renderH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `600 ${fs}px "JetBrains Mono", ui-monospace, Menlo, monospace`;
      ctx.textBaseline = "top";

      glowCanvas.width = Math.max(1, Math.ceil(vw * bloomScale));
      glowCanvas.height = Math.max(1, Math.ceil(renderH * bloomScale));
      glowCtx.setTransform(bloomScale, 0, 0, bloomScale, 0, 0);
      glowCtx.font = `700 ${fs}px "JetBrains Mono", ui-monospace, Menlo, monospace`;
      glowCtx.textBaseline = "top";

      cw = ctx.measureText("M").width || 8;
      chh = Math.round(fs * 1.15);
      cols = Math.ceil(vw / cw);
      rows = Math.ceil(renderH / chh) + 1;
      val = new Float32Array(cols * rows);
      col = new Uint8Array(cols * rows);
      colSin1 = new Float32Array(cols);
      colU = new Float32Array(cols);
      colBand = new Float32Array(cols);
      colSpA = new Float32Array(cols);
      colSpB = new Float32Array(cols);
      colPx = new Float32Array(cols);
      for (let x = 0; x < cols; x++) {
        colPx[x] = (x + 0.5) * cw;
      }
      lastAtlasMix = -1;
      lastAnchorY = Number.NaN;
    };
    resize();

    const syncWorld = () => {
      worldHeight = Math.max(
        window.innerHeight,
        document.documentElement.scrollHeight
      );
      stones.length = 0;

      document
        .querySelectorAll<HTMLElement>("[data-stepping-stone]")
        .forEach((element) => {
          const rect = element.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;
          stones.push({
            x: rect.left + window.scrollX + rect.width / 2,
            y: rect.top + window.scrollY + rect.height / 2,
            rx: rect.width / 2 + 28,
            ry: rect.height / 2 + 22,
            shoreRx: Math.max(4, rect.width * 0.5 - 12),
            shoreRy: Math.max(4, rect.height * 0.5 - 11),
          });
        });
    };
    syncWorld();
    document.fonts?.ready.then(() => {
      resize();
      syncWorld();
    });

    const worldObserver = new ResizeObserver(syncWorld);
    worldObserver.observe(document.documentElement);

    const onResize = () => {
      resize();
      syncWorld();
    };

    const pickTarget = (k: Koi) => {
      const pad = 130;
      for (let n = 0; n < 8; n++) {
        const an = k.a + (Math.random() - 0.5) * 1.6,
          d = 280 + Math.random() * 340;
        const x = k.x + Math.cos(an) * d,
          y = k.y + Math.sin(an) * d;
        if (x > pad && x < vw - pad && y > pad && y < worldHeight - pad) {
          k.tx = x;
          k.ty = y;
          k.wanderTimer = 6;
          return;
        }
      }
      k.tx = vw / 2 + (Math.random() - 0.5) * vw * 0.45;
      k.ty = Math.max(
        pad,
        Math.min(worldHeight - pad, k.y + (Math.random() - 0.5) * 520)
      );
      k.wanderTimer = 6;
    };

    const count = 20;
    const kois: Koi[] = Array.from({ length: count }, (_, n) => {
      const s = 1.6 + (n / Math.max(1, count - 1)) * 0.65 + Math.random() * 0.1;
      const x = Math.random() * vw;
      const y = ((n + Math.random()) / count) * worldHeight;
      const a = Math.random() * 6.283;
      const base = n % 3;
      const pat: number[] = [];
      let cur = base;
      for (let i = 0; i < N; i++) {
        if (Math.random() < 0.28) cur = Math.floor(Math.random() * 3);
        pat.push(i === 0 ? base : cur);
      }
      const spot = pat.map((c, i) =>
        i > 0 && i < N - 2 && Math.random() < 0.35
          ? (c + 1 + Math.floor(Math.random() * 2)) % 3
          : -1
      );
      const koi: Koi = {
        x,
        y,
        a,
        sp: 32,
        s,
        ph: Math.random() * 6,
        tx: x,
        ty: y,
        wanderTimer: 0,
        wakeTimer: Math.random() * 0.6,
        pat,
        spot,
        seg: Array.from({ length: N }, (_, i) => ({
          x: x - Math.cos(a) * i * 6.8 * s,
          y: y - Math.sin(a) * i * 6.8 * s,
        })),
      };
      pickTarget(koi);
      return koi;
    });

    const addRipple = (
      x: number,
      y: number,
      life = 2.6,
      speed = 75,
      wake = false
    ) => ripples.push({ x, y, t: 0, life, speed, wake });

    const splash = (x: number, y: number) => {
      for (let i = 0; i < 16; i++) {
        const an = Math.random() * 6.283,
          v = 30 + Math.random() * 70;
        sparks.push({
          x,
          y,
          vx: Math.cos(an) * v,
          vy: Math.sin(an) * v,
          life: 0.5 + Math.random() * 0.4,
        });
      }
      addRipple(x, y, 1.8, 60);
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const targetEl = e.target as HTMLElement | null;
      if (
        targetEl?.closest(
          "a, button, input, textarea, select, [data-stepping-stone], [data-wooden-deck]"
        )
      ) {
        return;
      }
      const worldY = e.clientY + window.scrollY;
      foods.push({ x: e.clientX, y: worldY, age: 0, dead: false });
      addRipple(e.clientX, worldY);
    };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY + window.scrollY;
    };

    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);

    let anchorY = Math.round(window.scrollY - OVERSCAN);

    const splat = (
      px: number,
      py: number,
      r: number,
      c: number,
      amp = 1,
      over = false
    ) => {
      const localY = py - anchorY;
      const x0 = Math.max(0, Math.floor((px - r) / cw)),
        x1 = Math.min(cols - 1, Math.floor((px + r) / cw));
      const y0 = Math.max(0, Math.floor((localY - r) / chh)),
        y1 = Math.min(rows - 1, Math.floor((localY + r) / chh));
      for (let cy = y0; cy <= y1; cy++)
        for (let cx = x0; cx <= x1; cx++) {
          const d = Math.hypot((cx + 0.5) * cw - px, (cy + 0.5) * chh - localY);
          if (d >= r) continue;
          const t = d / r;
          const v = (1 - t * t * 0.65) * amp;
          const i = cy * cols + cx;
          if (v > val[i] || (over && v > 0.42)) {
            val[i] = v;
            col[i] = c;
          }
        }
    };

    const step = (k: Koi, dt: number) => {
      let best: Food | null = null,
        bd = 650;
      for (const f of foods) {
        if (!f.dead) {
          const d = Math.hypot(f.x - k.x, f.y - k.y);
          if (d < bd) {
            bd = d;
            best = f;
          }
        }
      }

      let ta: number,
        want = k.s * 34;

      if (best) {
        ta = Math.atan2(best.y - k.y, best.x - k.x);
        want = bd < 140 ? Math.max(12, k.s * 95 * (bd / 140)) : k.s * 95;
        if (bd < 14 + 8 * k.s) {
          best.dead = true;
          splash(best.x, best.y);
        }
      } else {
        k.wanderTimer -= dt;
        const distToTarget = Math.hypot(k.tx - k.x, k.ty - k.y);
        if (k.wanderTimer <= 0 || distToTarget < 140) {
          pickTarget(k);
        }
        const baseAngle = Math.atan2(k.ty - k.y, k.tx - k.x);
        ta = baseAngle + Math.sin(k.ph * 0.25) * 0.14;
      }

      const m = 110;
      let pushX = 0,
        pushY = 0,
        avoidX = 0,
        avoidY = 0;
      if (k.x < m) pushX += (m - k.x) / m;
      if (k.x > vw - m) pushX -= (k.x - (vw - m)) / m;
      if (k.y < m) pushY += (m - k.y) / m;
      if (k.y > worldHeight - m) pushY -= (k.y - (worldHeight - m)) / m;

      for (const stone of stones) {
        const dx = k.x - stone.x;
        const dy = k.y - stone.y;
        const nx = dx / stone.rx;
        const ny = dy / stone.ry;
        const distance = Math.hypot(nx, ny);
        if (distance > 1.24) continue;
        const force = ((1.24 - distance) / 0.24) ** 2;
        const direction = distance < 0.001 ? k.ph : Math.atan2(ny, nx);
        avoidX += Math.cos(direction) * force;
        avoidY += Math.sin(direction) * force;
      }

      if (pushX !== 0 || pushY !== 0 || avoidX !== 0 || avoidY !== 0) {
        ta = Math.atan2(
          Math.sin(ta) + pushY * 1.5 + avoidY * 2.5,
          Math.cos(ta) + pushX * 1.5 + avoidX * 2.5
        );
      }

      if (Math.hypot(mouse.x - k.x, mouse.y - k.y) < 105) {
        ta = Math.atan2(k.y - mouse.y, k.x - mouse.x);
        want = k.s * 85;
      }

      const diff =
        (((ta - k.a + Math.PI) % 6.283185) + 6.283185) % 6.283185 - Math.PI;
      const mt = (best ? 2.2 : 1.1) * dt;
      k.a += Math.max(-mt, Math.min(mt, diff));

      k.sp += (want - k.sp) * Math.min(1, dt * 2.5);
      k.x += Math.cos(k.a) * k.sp * dt;
      k.y += Math.sin(k.a) * k.sp * dt;
      k.ph += dt * (3 + k.sp * 0.06);

      k.wakeTimer -= dt * (k.sp / 45);
      if (k.wakeTimer <= 0) {
        k.wakeTimer = 0.65;
        addRipple(k.seg[3].x, k.seg[3].y, 1.5, 26, true);
      }

      k.seg[0].x = k.x;
      k.seg[0].y = k.y;
      const sd = 6.8 * k.s;
      for (let i = 1; i < N; i++) {
        const p = k.seg[i - 1],
          q = k.seg[i];
        const dx = q.x - p.x,
          dy = q.y - p.y,
          l = Math.hypot(dx, dy) || 1;
        q.x = p.x + (dx / l) * sd;
        q.y = p.y + (dy / l) * sd;
      }
    };

    const eyes: { x: number; y: number }[] = [];
    const shadowBlobs: { x: number; y: number; r: number; s: number }[] = [];
    const drawKoi = (k: Koi) => {
      const u = k.s * 2.2;
      const wave = (i: number, extra = 0) =>
        Math.sin(k.ph - i * 0.65) * u * (0.1 + i * 0.16 + extra);
      const pts: {
        x: number;
        y: number;
        tx: number;
        ty: number;
        nx: number;
        ny: number;
      }[] = [];

      for (let i = 0; i < N; i++) {
        const a = k.seg[Math.max(0, i - 1)],
          b = k.seg[Math.min(N - 1, i + 1)];
        const l = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const tx = (a.x - b.x) / l,
          ty = (a.y - b.y) / l,
          nx = -ty,
          ny = tx;
        const off = wave(i) * (i === 0 ? 0.25 : 1);
        pts.push({
          x: k.seg[i].x + nx * off,
          y: k.seg[i].y + ny * off,
          tx,
          ty,
          nx,
          ny,
        });
      }

      for (let i = 0; i < N; i++) {
        const p = pts[i],
          j = Math.min(N - 1, i + 1),
          q = pts[j];
        for (let h = 0; h < 3; h++) {
          const f = h / 3;
          splat(
            p.x + (q.x - p.x) * f,
            p.y + (q.y - p.y) * f,
            (W[i] + (W[j] - W[i]) * f) * u,
            k.pat[i]
          );
        }
        for (let h = 0; h < 3; h++) {
          const f = h / 3;
          shadowBlobs.push({
            x: p.x + (q.x - p.x) * f,
            y: p.y + (q.y - p.y) * f,
            r: (W[i] + (W[j] - W[i]) * f) * u,
            s: k.s,
          });
        }
        if (k.spot[i] >= 0) {
          const sg = i % 2 ? 1 : -1;
          splat(
            p.x + p.nx * W[i] * u * 0.3 * sg,
            p.y + p.ny * W[i] * u * 0.3 * sg,
            W[i] * u * 0.55,
            k.spot[i],
            1,
            true
          );
        }
      }

      for (const si of [2, 6]) {
        const p = pts[si],
          big = si === 2 ? 1 : 0.6;
        for (const side of [-1, 1])
          for (let j = 1; j <= 4; j++) {
            const d =
              W[si] * u +
              j * 0.85 * u * big +
              Math.sin(k.ph * 0.7 + side) * 0.22 * u * j;
            const back = j * 1.1 * u * big;
            splat(
              p.x + p.nx * side * d - p.tx * back,
              p.y + p.ny * side * d - p.ty * back,
              u * (1.0 - j * 0.15) * big,
              1,
              0.72
            );
          }
      }

      const t = pts[N - 1],
        tl = 2.9 * u,
        base = wave(N - 1);
      for (let f = -2; f <= 2; f++) {
        const len = tl * (0.55 + 0.45 * (Math.abs(f) / 2));
        for (let j = 1; j <= 5; j++) {
          const d = (j / 5) * len;
          const sway =
            Math.sin(k.ph - (N - 1 + j * 0.6) * 0.65) *
              u *
              (0.1 + (N - 1) * 0.16 + j * 0.2) -
            base;
          const lat = f * (j / 5) * 1.5 * u + sway;
          shadowBlobs.push({
            x: t.x - t.tx * d + t.nx * lat,
            y: t.y - t.ty * d + t.ny * lat,
            r: 0.75 * u * (1 - j * 0.08),
            s: k.s,
          });
          splat(
            t.x - t.tx * d + t.nx * lat,
            t.y - t.ty * d + t.ny * lat,
            0.9 * u * (1 - j * 0.08),
            k.pat[N - 2],
            0.7
          );
        }
      }

      const h = pts[0];
      for (const sd of [-1, 1]) {
        eyes.push({
          x: h.x + h.tx * 0.5 * u + h.nx * sd * 2.3 * u,
          y: h.y + h.ty * 0.5 * u + h.ny * sd * 2.3 * u,
        });
      }
    };

    const rocks = Array.from({ length: 14 }, (_, i) => ({
      nx: 0.12 + ((i * 0.37) % 0.78),
      ny: (i + 0.35) / 14,
      rx: 42 + (i % 4) * 9,
      ry: 22 + (i % 3) * 6,
      ph: i * 1.15,
    }));

    const weeds = Array.from({ length: 12 }, (_, i) => ({
      nx: i % 2 === 0 ? 0.06 + (i % 3) * 0.04 : 0.88 + (i % 3) * 0.03,
      ny: (i + 0.5) / 12,
      ph: i * 1.7,
    }));

    const bankStones = Array.from({ length: 18 }, (_, i) => {
      const leftSide = i % 2 === 0;
      return {
        nx: leftSide ? 0.015 + (i % 3) * 0.025 : 0.985 - (i % 3) * 0.025,
        ny: (i + 0.4) / 18,
        rx: 68 + (i % 3) * 14,
        ry: 38 + (i % 3) * 8,
        ph: i * 0.85,
      };
    });

    const grassTufts = Array.from({ length: 16 }, (_, i) => {
      const leftSide = i % 2 === 0;
      return {
        nx: leftSide ? 0.02 + (i % 3) * 0.03 : 0.98 - (i % 3) * 0.03,
        ny: (i + 0.55) / 16,
        blades: 7 + (i % 4),
        h: 6 + (i % 3),
        ph: i * 0.7,
      };
    });

    const lilyPads = Array.from({ length: 14 }, (_, index) => ({
      nx:
        index % 2 === 0
          ? 0.08 + Math.random() * 0.14
          : 0.78 + Math.random() * 0.14,
      ny: (index + 0.45) / 14,
      r: 20 + Math.random() * 12,
      notch: Math.random() * Math.PI * 2,
      flower: index % 2 === 0,
    }));

    const stoneLanterns = [
      { nx: 0.065, yPx: 305 },
      { nx: 0.935, yPx: 270 },
      { nx: 0.055, ny: 0.48 },
      { nx: 0.945, ny: 0.72 },
    ];

    const bambooClusters = [
      { nx: 0.024, stalks: 4, topY: 16, lenRows: 22, ph: 0.4 },
      { nx: 0.976, stalks: 4, topY: 16, lenRows: 20, ph: 1.9 },
    ];

    let sh = new Float32Array(0);
    let last = performance.now(),
      time = 0,
      raf = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;
      tmix += (target.current - tmix) * Math.min(1, dt * 1.9);

      // Anchor the overscan canvas in document space so compositor scrolling stays 1:1 locked
      anchorY = Math.round(window.scrollY - OVERSCAN);
      if (anchorY !== lastAnchorY) {
        lastAnchorY = anchorY;
        canvas.style.transform = `translate3d(0, ${anchorY}px, 0)`;
      }

      const bgTop = mix(PAL.dark.bgTop, PAL.light.bgTop, tmix);
      const bgMid = mix(PAL.dark.bgMid, PAL.light.bgMid, tmix);
      const bgBottom = mix(PAL.dark.bgBottom, PAL.light.bgBottom, tmix);
      const kc = [0, 1, 2].map((i) =>
        mix(PAL.dark.koi[i], PAL.light.koi[i], tmix)
      );
      const eyeColor = mix(PAL.dark.eye, PAL.light.eye, tmix);
      const shadowColor = mix(PAL.dark.shadow, PAL.light.shadow, tmix);
      const glintBright = mix(PAL.dark.glintBright, PAL.light.glintBright, tmix);
      const glintSoft = mix(PAL.dark.glintSoft, PAL.light.glintSoft, tmix);
      const lanternGlowColor = mix(
        PAL.dark.lanternGlow,
        PAL.light.lanternGlow,
        tmix
      );

      if (Math.abs(tmix - lastAtlasMix) > 0.025 || lastAtlasMix < 0) {
        lastAtlasMix = tmix;
        rebuildAtlas({
          rock: mix(PAL.dark.rock, PAL.light.rock, tmix),
          weed: mix(PAL.dark.weed, PAL.light.weed, tmix),
          moss: mix(PAL.dark.moss, PAL.light.moss, tmix),
          grass: mix(PAL.dark.grass, PAL.light.grass, tmix),
          grassTip: mix(PAL.dark.grassTip, PAL.light.grassTip, tmix),
          pad: mix(PAL.dark.pad, PAL.light.pad, tmix),
          padRim: mix(PAL.dark.padRim, PAL.light.padRim, tmix),
          lotus: mix(PAL.dark.lotus, PAL.light.lotus, tmix),
          bamboo: mix(PAL.dark.bamboo, PAL.light.bamboo, tmix),
          bambooNode: mix(PAL.dark.bambooNode, PAL.light.bambooNode, tmix),
          lanternStone: mix(
            PAL.dark.lanternStone,
            PAL.light.lanternStone,
            tmix
          ),
          lanternGlow: lanternGlowColor,
          food: mix(PAL.dark.food, PAL.light.food, tmix),
          waterMid: mix(PAL.dark.waterMid, PAL.light.waterMid, tmix),
          glintSoft,
          glintBright,
        });
      }

      glowCtx.setTransform(
        bloomScale,
        0,
        0,
        bloomScale,
        0,
        -anchorY * bloomScale
      );
      glowCtx.clearRect(0, anchorY, vw, renderH);

      const mProg = Math.min(1, tmix / 0.65);
      const mEase = mProg * mProg * (3 - 2 * mProg);
      const moonX = vw * (0.28 - 0.22 * mEase);
      const moonY = vh * (0.1 + 0.36 * mEase);
      const moonVis = Math.max(0, 1 - Math.pow(tmix / 0.62, 1.8));

      const sRaw = Math.max(0, (tmix - 0.2) / 0.8);
      const sEase = 1 - Math.pow(1 - sRaw, 3);
      const sunX = vw * (0.86 - 0.16 * sEase);
      const sunY = vh * (0.46 - 0.35 * sEase);
      const sunVis = Math.min(1, sRaw * 1.35);

      ctx.save();
      ctx.translate(0, -anchorY);
      ctx.globalAlpha = 1;

      /* Pond Bed Depth Gradient: Luminous Near Top, Gradually Darkening Toward Bottom */
      const pondGrad = ctx.createLinearGradient(0, 0, 0, worldHeight);
      pondGrad.addColorStop(0, bgTop);
      pondGrad.addColorStop(0.45, bgMid);
      pondGrad.addColorStop(1, bgBottom);
      ctx.fillStyle = pondGrad;
      ctx.fillRect(0, anchorY, vw, renderH);

      /* Spreading Upper-Pond Moonlight & Sunlight Atmospheric Glow */
      if (moonVis > 0.01) {
        ctx.globalAlpha = moonVis;
        const mg = ctx.createRadialGradient(
          moonX,
          moonY,
          0,
          moonX,
          moonY + worldHeight * 0.22,
          Math.max(vw * 0.85, worldHeight * 0.72)
        );
        mg.addColorStop(0, "rgba(185, 220, 255, 0.24)");
        mg.addColorStop(0.45, "rgba(84, 134, 194, 0.07)");
        mg.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = mg;
        ctx.fillRect(0, anchorY, vw, renderH);
      }
      if (sunVis > 0.01) {
        const dawn = Math.sin(sEase * Math.PI);
        ctx.globalAlpha = sunVis;
        const sg = ctx.createRadialGradient(
          sunX,
          sunY,
          0,
          sunX,
          sunY + worldHeight * 0.22,
          Math.max(vw * 0.9, worldHeight * 0.75)
        );
        sg.addColorStop(
          0,
          dawn > 0.35
            ? "rgba(255, 232, 175, 0.62)"
            : "rgba(255, 251, 228, 0.56)"
        );
        sg.addColorStop(
          0.45,
          dawn > 0.35
            ? "rgba(255, 215, 150, 0.18)"
            : "rgba(255, 246, 210, 0.14)"
        );
        sg.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = sg;
        ctx.fillRect(0, anchorY, vw, renderH);
      }

      /* Submerged Pond Bed Rocks (Atlas-Stamped) */
      for (const r of rocks) {
        const bx = r.nx * vw,
          by = r.ny * worldHeight;
        if (by + r.ry * 1.3 < anchorY || by - r.ry * 1.3 > anchorY + renderH)
          continue;
        const cx0 = Math.max(0, Math.floor((bx - r.rx * 1.2) / cw)),
          cx1 = Math.min(cols - 1, Math.floor((bx + r.rx * 1.2) / cw));
        const cy0 = Math.max(0, Math.floor((by - anchorY - r.ry * 1.2) / chh)),
          cy1 = Math.min(
            rows - 1,
            Math.floor((by - anchorY + r.ry * 1.2) / chh)
          );
        for (let cy = cy0; cy <= cy1; cy++) {
          let rowStr = "",
            has = false;
          for (let cx = cx0; cx <= cx1; cx++) {
            const dx = ((cx + 0.5) * cw - bx) / r.rx,
              dy = (anchorY + (cy + 0.5) * chh - by) / r.ry;
            const d = Math.hypot(dx, dy),
              an = Math.atan2(dy, dx);
            const edge =
              1 +
              0.14 * Math.sin(3 * an + r.ph) +
              0.09 * Math.sin(5 * an + r.ph * 2);
            if (d < edge) {
              const lit =
                0.5 +
                0.5 *
                  ((dx * 0.45 + dy * 0.75) / Math.max(d, 0.3)) *
                  Math.min(1, d * 1.4) +
                (d / edge) * 0.25;
              rowStr +=
                lit > 0.85 ? "#" : lit > 0.65 ? "=" : lit > 0.45 ? ":" : ".";
              has = true;
            } else rowStr += " ";
          }
          if (has) {
            const wob = Math.sin(time * 1.3 + cy * 0.8 + r.ph) * 2.2;
            ctx.globalAlpha = 0.16;
            stampText(
              ctx,
              rowStr,
              "rock",
              cx0 * cw + wob + 2,
              anchorY + cy * chh + 1
            );
            ctx.globalAlpha = 0.42;
            stampText(ctx, rowStr, "rock", cx0 * cw + wob, anchorY + cy * chh);
          }
        }
      }

      /* Submerged Pond Weeds */
      ctx.globalAlpha = 0.45;
      for (const w of weeds) {
        const bx = w.nx * vw,
          by = w.ny * worldHeight;
        if (by < anchorY - 120 || by > anchorY + renderH + 120) continue;
        for (let b = 0; b < 5; b++) {
          const len = 6 + (b % 3) * 2;
          for (let k = 0; k < len; k++) {
            const sway =
              Math.sin(time * 0.9 + w.ph + b * 0.6 + k * 0.4) * (2 + k * 1.6);
            stampGlyph(
              ctx,
              k === len - 1 ? "^" : k % 2 ? "(" : ")",
              "weed",
              Math.floor((bx + (b - 2) * cw * 1.3 + sway) / cw) * cw,
              Math.floor((by - k * chh) / chh) * chh
            );
          }
        }
      }

      /* Crescent Moon Reflection */
      if (moonVis > 0.03 && moonY - 40 < anchorY + renderH) {
        const mr = 34;
        const x0 = Math.max(0, Math.floor((moonX - mr) / cw)),
          x1 = Math.min(cols - 1, Math.floor((moonX + mr) / cw));
        const y0 = Math.max(0, Math.floor((moonY - anchorY - mr) / chh)),
          y1 = Math.min(rows - 1, Math.floor((moonY - anchorY + mr) / chh));
        ctx.globalAlpha = moonVis * 0.72;
        glowCtx.globalAlpha = moonVis * 0.9;
        for (let cy = y0; cy <= y1; cy++) {
          const wob = Math.sin(time * 2.2 + cy * 0.9) * 3.5;
          for (let cx = x0; cx <= x1; cx++) {
            const dx = ((cx + 0.5) * cw - (moonX + wob)) / mr;
            const dy = (anchorY + (cy + 0.5) * chh - moonY) / (mr * 0.88);
            const d = Math.hypot(dx, dy);
            const cut = Math.hypot(dx - 0.36, dy + 0.14);
            if (d < 1 && cut > 0.78) {
              const ch =
                d > 0.84 ? (dx < 0 ? "(" : ")") : cut < 0.9 ? ":" : "o";
              stampGlyph(ctx, ch, "glintBright", cx * cw, anchorY + cy * chh);
              stampGlyph(
                glowCtx,
                ch,
                "glintBright",
                cx * cw,
                anchorY + cy * chh
              );
            }
          }
        }
      }

      /* Sun Reflection */
      if (sunVis > 0.03 && sunY - 60 < anchorY + renderH) {
        const sr = 42;
        const x0 = Math.max(0, Math.floor((sunX - sr * 1.4) / cw)),
          x1 = Math.min(cols - 1, Math.floor((sunX + sr * 1.4) / cw));
        const y0 = Math.max(0, Math.floor((sunY - anchorY - sr * 1.4) / chh)),
          y1 = Math.min(
            rows - 1,
            Math.floor((sunY - anchorY + sr * 1.4) / chh)
          );
        ctx.globalAlpha = sunVis * 0.85;
        glowCtx.globalAlpha = sunVis * 0.95;
        for (let cy = y0; cy <= y1; cy++) {
          const wob = Math.sin(time * 2.5 + cy * 0.85) * 3.0;
          for (let cx = x0; cx <= x1; cx++) {
            const dx = ((cx + 0.5) * cw - (sunX + wob)) / sr;
            const dy = (anchorY + (cy + 0.5) * chh - sunY) / (sr * 0.86);
            const d = Math.hypot(dx, dy);
            if (d < 0.78) {
              const ch = d < 0.42 ? "@" : d < 0.62 ? "*" : "o";
              stampGlyph(ctx, ch, "glintBright", cx * cw, anchorY + cy * chh);
              stampGlyph(
                glowCtx,
                ch,
                "glintBright",
                cx * cw,
                anchorY + cy * chh
              );
            } else if (d < 1.32) {
              const an = Math.atan2(dy, dx);
              const ray = Math.sin(an * 8 + time * 1.5);
              if (ray > 0.65) {
                const ch = d < 1.05 ? "+" : "~";
                stampGlyph(ctx, ch, "glintBright", cx * cw, anchorY + cy * chh);
                stampGlyph(
                  glowCtx,
                  ch,
                  "glintBright",
                  cx * cw,
                  anchorY + cy * chh
                );
              }
            }
          }
        }
      }

      /* Precompute Column Trig Lookup Tables Once Per Frame (95% Fewer Math Calls) */
      for (let x = 0; x < cols; x++) {
        const px = colPx[x];
        colSin1[x] = Math.sin(px * 0.011 - time * 0.3) * 1.1;
        colU[x] = px * 0.016;
        colBand[x] = px * 0.03;
        colSpA[x] = px * 0.9 + time * 3.1;
        colSpB[x] = px * 0.37 - time * 2.3;
      }

      /* Water Ripples + Spreading Illumination Cone + Stone Shoreline Meniscus */
      const maxPondDepth = Math.max(worldHeight * 0.92, vh * 2.2);
      const visibleStones = stones.filter(
        (s) =>
          s.y + s.shoreRy * 1.25 >= anchorY &&
          s.y - s.shoreRy * 1.25 <= anchorY + renderH
      );
      const nightBaseScale = 0.24 * (1 - tmix);
      const dayBaseScale = 0.64 * tmix;

      for (let y = 0; y < rows; y++) {
        const rowY = anchorY + y * chh;
        const py = rowY + 0.5 * chh;
        const swayY = Math.sin(py * 0.008 + time * 0.6) * 14;
        const moonColX = moonX + swayY;
        const sunColX = sunX + swayY;

        const moonDepth = Math.max(0, py - moonY) / maxPondDepth;
        const invMoonSpread =
          1 / (vw * (0.16 + Math.pow(moonDepth, 0.72) * 0.58));
        const moonAtten = Math.pow(Math.max(0.05, 1 - moonDepth * 0.84), 1.35);
        const belowMoon =
          py >= moonY - 12 ? 1 : Math.max(0, 1 - (moonY - py) / 40);
        const moonRowGain = moonVis * belowMoon * moonAtten;

        const sunDepth = Math.max(0, py - sunY) / maxPondDepth;
        const invSunSpread =
          1 / (vw * (0.18 + Math.pow(sunDepth, 0.72) * 0.58));
        const sunAtten = Math.pow(Math.max(0.06, 1 - sunDepth * 0.82), 1.3);
        const belowSun =
          py >= sunY - 12 ? 1 : Math.max(0, 1 - (sunY - py) / 40);
        const sunRowGain = sunVis * belowSun * sunAtten;

        const ambientDepthFade = Math.max(
          0.08,
          1 - Math.max(0, py) / maxPondDepth
        );
        const nightAmbient = nightBaseScale * ambientDepthFade;
        const dayAmbient = dayBaseScale * ambientDepthFade;

        const rowStones = visibleStones.filter(
          (s) => Math.abs(py - s.y) <= s.shoreRy * 1.15
        );

        const sinPyWave = Math.sin(py * 0.012 + time * 0.35) * 1.1;
        const pyV = py * 0.021;
        const pyBand = py * 0.08 + time * 0.7;
        const sinPyBand = Math.sin(py * 0.1 - time * 0.5);
        const pySpA = py * 0.7;
        const pySpB = -py * 1.3;

        for (let x = 0; x < cols; x++) {
          const px = colPx[x];
          const u = colU[x] + sinPyWave;
          const v = pyV + colSin1[x];
          const a = Math.sin(
            u * 2.1 + time * 0.45 + Math.sin(v * 1.7 - time * 0.3) * 1.3
          );
          const b = Math.sin(
            v * 2.3 - time * 0.38 + Math.sin(u * 1.4 + time * 0.27) * 1.3
          );
          const x1 = 1 - Math.abs(a + b) * 0.5;
          const x2 = x1 * x1;
          const rd = x2 * x2;
          const band = Math.max(0, Math.sin(colBand[x] + pyBand) * sinPyBand);
          const m = Math.max(rd, band * 0.5);

          const dm = (px - moonColX) * invMoonSpread;
          const ds = (px - sunColX) * invSunSpread;
          const gMoon = moonRowGain > 0.002 ? fastGauss(dm * dm) * moonRowGain : 0;
          const gSun = sunRowGain > 0.002 ? fastGauss(ds * ds) * sunRowGain : 0;

          const sp = Math.max(
            0,
            Math.sin(colSpA[x] + pySpA) * Math.sin(colSpB[x] + pySpB)
          );
          const sp3 = sp * sp * sp;

          // Live ASCII shoreline meniscus ripple strictly outside the boulder rim
          let stoneShore = 0;
          for (let si = 0; si < rowStones.length; si++) {
            const st = rowStones[si];
            const nx = Math.abs(px - st.x) / st.shoreRx;
            if (nx > 1.15) continue;
            const ny = Math.abs(py - st.y) / st.shoreRy;
            if (ny > 1.15) continue;
            const nx2 = nx * nx;
            const ny2 = ny * ny;
            const dStone = Math.sqrt(
              nx2 * Math.sqrt(nx2) + ny2 * Math.sqrt(ny2)
            );
            if (dStone >= 1.02 && dStone <= 1.14) {
              const lap =
                0.5 + 0.5 * Math.sin(time * 2.4 - dStone * 34 + px * 0.04);
              const edgeBoost =
                (1 - Math.abs(dStone - 1.07) / 0.07) * (0.38 + 0.34 * lap);
              if (edgeBoost > stoneShore) stoneShore = edgeBoost;
            }
          }

          const I =
            m * (nightAmbient + dayAmbient + 0.92 * gMoon + 0.56 * gSun) +
            sp3 * (gMoon * 0.65 + gSun * 0.35) +
            stoneShore * ambientDepthFade;

          if (stoneShore > 0.42) {
            ctx.globalAlpha = 0.85;
            stampGlyph(ctx, "~", "glintBright", x * cw, rowY);
            glowCtx.globalAlpha = 0.5;
            stampGlyph(glowCtx, "~", "glintBright", x * cw, rowY);
          } else if (I > 0.6) {
            ctx.globalAlpha = 0.85;
            stampGlyph(ctx, "+", "glintBright", x * cw, rowY);
            glowCtx.globalAlpha = 0.5;
            stampGlyph(glowCtx, "+", "glintBright", x * cw, rowY);
          } else if (I > 0.32) {
            ctx.globalAlpha = 0.56;
            stampGlyph(ctx, "-", "glintSoft", x * cw, rowY);
          } else if (I > 0.14) {
            ctx.globalAlpha = 0.42;
            stampGlyph(ctx, ".", "waterMid", x * cw, rowY);
          }
        }
      }

      /* ASCII Lily Pads & Lotus Blossoms */
      for (const pad of lilyPads) {
        const bx = pad.nx * vw,
          by = pad.ny * worldHeight;
        if (by + pad.r * 1.3 < anchorY || by - pad.r * 1.3 > anchorY + renderH)
          continue;
        const bobY = Math.sin(time * 1.1 + pad.notch) * 1.5;
        const x0 = Math.max(0, Math.floor((bx - pad.r * 1.2) / cw)),
          x1 = Math.min(cols - 1, Math.floor((bx + pad.r * 1.2) / cw));
        const y0 = Math.max(0, Math.floor((by - anchorY - pad.r * 1.2) / chh)),
          y1 = Math.min(
            rows - 1,
            Math.floor((by - anchorY + pad.r * 1.2) / chh)
          );
        ctx.globalAlpha = 0.8;
        for (let cy = y0; cy <= y1; cy++) {
          for (let cx = x0; cx <= x1; cx++) {
            const dx = ((cx + 0.5) * cw - bx) / pad.r;
            const dy =
              (anchorY + (cy + 0.5) * chh - (by + bobY)) / (pad.r * 0.76);
            const d = Math.hypot(dx, dy);
            const an = Math.atan2(dy, dx);
            const diff = Math.abs(
              ((an - pad.notch + Math.PI) % 6.283) - Math.PI
            );
            if (d < 1 && diff > 0.24) {
              stampGlyph(
                ctx,
                d > 0.84 ? "o" : ".",
                d > 0.82 ? "padRim" : "pad",
                cx * cw,
                anchorY + cy * chh
              );
            }
          }
        }
        if (pad.flower) {
          const fx = Math.floor(bx / cw) * cw;
          const fy = Math.floor((by + bobY) / chh) * chh;
          ctx.globalAlpha = 0.92;
          stampText(ctx, "{*}", "lotus", fx - cw, fy);
        }
      }

      /* Surface Ripples */
      ctx.strokeStyle = glintSoft;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.t += dt;
        if (r.t > r.life) {
          ripples.splice(i, 1);
          continue;
        }
        const fade = 1 - r.t / r.life,
          rad = r.t * r.speed;
        if (r.y + rad < anchorY || r.y - rad > anchorY + renderH) continue;
        ctx.lineWidth = r.wake ? 1 : 1.4;
        const rings: [number, number][] = r.wake
          ? [
              [1, 0.28],
              [0.6, 0.16],
            ]
          : [
              [1, 0.7],
              [0.7, 0.45],
              [0.42, 0.25],
            ];
        for (const [k, al] of rings) {
          const rr = rad * k;
          if (rr < 2) continue;
          ctx.globalAlpha = fade * al;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, rr, rr * 0.72, 0, 0, 6.283);
          ctx.stroke();
        }
      }

      val.fill(0);
      eyes.length = 0;
      shadowBlobs.length = 0;
      for (const k of kois) {
        step(k, dt);
        drawKoi(k);
      }

      /* Koi Underwater Shadows */
      if (sh.length !== cols * rows) sh = new Float32Array(cols * rows);
      else sh.fill(0);
      const activeLx =
        (moonX * moonVis + sunX * sunVis) / Math.max(0.01, moonVis + sunVis);
      const activeElev = (1 - mEase) * moonVis + sEase * sunVis;
      const lightNormX = (activeLx / Math.max(1, vw) - 0.5) * 2;
      const sox = -lightNormX * 14;
      const soy = 18 - activeElev * 5;

      for (const b of shadowBlobs) {
        const ox = b.x + sox * b.s,
          oy = b.y + soy * b.s,
          r = b.r * 1.15;
        const x0 = Math.max(0, Math.floor((ox - r) / cw)),
          x1 = Math.min(cols - 1, Math.floor((ox + r) / cw));
        const y0 = Math.max(0, Math.floor((oy - anchorY - r) / chh)),
          y1 = Math.min(rows - 1, Math.floor((oy - anchorY + r) / chh));
        for (let cy = y0; cy <= y1; cy++)
          for (let cx = x0; cx <= x1; cx++) {
            const d = Math.hypot(
              (cx + 0.5) * cw - ox,
              anchorY + (cy + 0.5) * chh - oy
            );
            if (d >= r) continue;
            const t = d / r,
              v = (1 - t * t) * 0.85,
              i = cy * cols + cx;
            if (v > sh[i]) sh[i] = v;
          }
      }
      ctx.fillStyle = shadowColor;
      ctx.globalAlpha = 0.5 + tmix * 0.15;
      for (let y = 0; y < rows; y++) {
        let rowStr = "",
          has = false;
        const base = y * cols;
        for (let x = 0; x < cols; x++) {
          const v = sh[base + x];
          if (v > 0.05 && val[base + x] <= 0.08) {
            rowStr += v > 0.55 ? "=" : v > 0.35 ? "-" : v > 0.18 ? ":" : ".";
            has = true;
          } else rowStr += " ";
        }
        if (has) ctx.fillText(rowStr, 0, anchorY + y * chh);
      }

      /* ASCII Koi Bodies */
      ctx.globalAlpha = 1;
      glowCtx.globalAlpha = 0.85;
      for (let y = 0; y < rows; y++) {
        const parts: string[][] = [[], [], []];
        const has = [false, false, false];
        const base = y * cols;
        for (let x = 0; x < cols; x++) {
          const v = val[base + x];
          if (v > 0.08) {
            const boosted = Math.min(1, v + tmix * 0.14);
            const c = col[base + x],
              ch = RAMP[Math.min(9, 2 + Math.floor(boosted * 8))];
            has[c] = true;
            for (let q = 0; q < 3; q++) parts[q].push(q === c ? ch : " ");
          } else for (let q = 0; q < 3; q++) parts[q].push(" ");
        }
        for (let q = 0; q < 3; q++)
          if (has[q]) {
            const str = parts[q].join("");
            ctx.fillStyle = kc[q];
            ctx.fillText(str, 0, anchorY + y * chh);
            glowCtx.fillStyle = kc[q];
            glowCtx.fillText(str, 0, anchorY + y * chh);
          }
      }

      for (const e of eyes) {
        if (e.y < anchorY - 20 || e.y > anchorY + renderH + 20) continue;
        const ex = Math.floor(e.x / cw) * cw,
          ey = anchorY + Math.floor((e.y - anchorY) / chh) * chh;
        ctx.fillStyle = bgTop;
        ctx.fillRect(ex, ey, cw, chh);
        ctx.fillStyle = eyeColor;
        ctx.fillText("o", ex, ey);
      }

      /* ASCII Food Pellets & Sparks */
      for (let i = foods.length - 1; i >= 0; i--) {
        const f = foods[i];
        f.age += dt;
        if (f.dead || f.age > 14) {
          foods.splice(i, 1);
          continue;
        }
        const alpha = f.age > 11 ? (14 - f.age) / 3 : 1;
        const ch = Math.floor(f.age * 4) % 2 ? "*" : "@";
        const fx = Math.floor(f.x / cw) * cw,
          fy = Math.floor(f.y / chh) * chh;
        ctx.globalAlpha = alpha;
        stampGlyph(ctx, ch, "food", fx, fy);
        glowCtx.globalAlpha = alpha;
        stampGlyph(glowCtx, ch, "food", fx, fy);
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= dt;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vx *= 0.94;
        s.vy *= 0.94;
        const alpha = Math.min(1, s.life * 2.5);
        const ch = s.life > 0.4 ? "*" : s.life > 0.2 ? "o" : ".";
        const sx = Math.floor(s.x / cw) * cw,
          sy = Math.floor(s.y / chh) * chh;
        ctx.globalAlpha = alpha;
        stampGlyph(ctx, ch, "food", sx, sy);
        glowCtx.globalAlpha = alpha;
        stampGlyph(glowCtx, ch, "food", sx, sy);
      }

      /* Mossy Shoreline Stones & Pond-Edge Grass (ASCII Atlas-Stamped) */
      for (const b of bankStones) {
        const bx = b.nx * vw,
          by = b.ny * worldHeight;
        if (by + b.ry * 1.3 < anchorY || by - b.ry * 1.3 > anchorY + renderH)
          continue;
        const cx0 = Math.max(0, Math.floor((bx - b.rx * 1.2) / cw)),
          cx1 = Math.min(cols - 1, Math.floor((bx + b.rx * 1.2) / cw));
        const cy0 = Math.max(0, Math.floor((by - anchorY - b.ry * 1.2) / chh)),
          cy1 = Math.min(
            rows - 1,
            Math.floor((by - anchorY + b.ry * 1.2) / chh)
          );
        ctx.globalAlpha = 0.85;
        for (let cy = cy0; cy <= cy1; cy++) {
          for (let cx = cx0; cx <= cx1; cx++) {
            const dx = ((cx + 0.5) * cw - bx) / b.rx,
              dy = (anchorY + (cy + 0.5) * chh - by) / b.ry;
            const d = Math.hypot(dx, dy),
              an = Math.atan2(dy, dx);
            const edge =
              1 +
              0.14 * Math.sin(3 * an + b.ph) +
              0.08 * Math.sin(5 * an + b.ph * 1.7);
            if (d < edge) {
              const isMoss = dy < -0.15 + 0.18 * Math.sin(cx * 0.7 + b.ph);
              const ch = isMoss
                ? d > 0.75
                  ? "."
                  : "m"
                : d > 0.78
                  ? ":"
                  : "#";
              stampGlyph(
                ctx,
                ch,
                isMoss ? "moss" : "rock",
                cx * cw,
                anchorY + cy * chh
              );
            }
          }
        }
      }

      ctx.globalAlpha = 0.88;
      for (const tuft of grassTufts) {
        const bx = tuft.nx * vw,
          by = tuft.ny * worldHeight;
        if (by + 40 < anchorY || by - tuft.h * chh - 40 > anchorY + renderH)
          continue;
        for (let b = 0; b < tuft.blades; b++) {
          const offset = (b - (tuft.blades - 1) / 2) * cw * 1.25;
          const height =
            tuft.h - (Math.abs(b - Math.floor(tuft.blades / 2)) % 3);
          const lean = (b - (tuft.blades - 1) / 2) * 0.28;
          for (let k = 0; k < height; k++) {
            const progress = k / Math.max(1, height - 1);
            const breeze =
              Math.sin(time * 1.35 + tuft.ph + b * 0.45 + k * 0.35) *
              (1.5 + k * 1.8);
            const gx =
              Math.floor((bx + offset + lean * k * cw * 0.7 + breeze) / cw) *
              cw;
            const gy = Math.floor((by - k * chh) / chh) * chh;
            if (gx < 0 || gx >= vw || gy < anchorY || gy >= anchorY + renderH)
              continue;
            const ch =
              k === height - 1
                ? "'"
                : breeze + lean * 4 > 1.2
                  ? "/"
                  : breeze + lean * 4 < -1.2
                    ? "\\"
                    : "|";
            stampGlyph(
              ctx,
              ch,
              progress > 0.65 ? "grassTip" : "grass",
              gx,
              gy
            );
          }
        }
      }

      /* ASCII Bamboo Groves */
      if (vw >= 768 && anchorY < 480) {
        for (const grove of bambooClusters) {
          const baseX = grove.nx * vw;
          const isLeft = grove.nx < 0.5;
          for (let s = 0; s < grove.stalks; s++) {
            const sxBase = baseX + (isLeft ? s * cw * 2.1 : -s * cw * 2.1);
            const rowsLen = grove.lenRows - s * 2;
            for (let r = 0; r < rowsLen; r++) {
              const py = grove.topY + r * chh;
              if (py < anchorY || py > anchorY + renderH) continue;
              const sway =
                Math.sin(time * 0.85 + grove.ph + s * 0.6 + r * 0.08) *
                (r * 0.35);
              const px = Math.floor((sxBase + sway) / cw) * cw;
              const isNode = r > 0 && r % 5 === 0;
              ctx.globalAlpha = 0.78 - s * 0.1;
              stampText(
                ctx,
                isNode ? "=" : "||",
                isNode ? "bambooNode" : "bamboo",
                px,
                py
              );

              if (isNode && s < 2) {
                const leafDir = isLeft ? 1 : -1;
                stampText(
                  ctx,
                  isLeft ? "~`" : "`~",
                  "grassTip",
                  px + leafDir * cw * 2,
                  py + chh * 0.5
                );
              }
            }
          }
        }
      }

      /* Traditional ASCII Stone Tōrō Lanterns & Shimmering Water Reflections */
      if (vw >= 640) {
        const lanternArt = [
          "  /^\\  ",
          " /===\\ ",
          " [###] ",
          " \\===/ ",
          "  | |  ",
          " [===] ",
        ];
        const flicker =
          0.88 + 0.12 * Math.sin(time * 5.2) * Math.cos(time * 3.1);

        for (const lantern of stoneLanterns) {
          const lx = Math.floor((lantern.nx * vw) / cw) * cw - cw * 3;
          const ly =
            "yPx" in lantern && lantern.yPx !== undefined
              ? lantern.yPx
              : lantern.ny! * worldHeight;

          if (ly < anchorY - 120 || ly > anchorY + renderH + 160) continue;

          const fireX = lx + cw * 3.5;
          const fireY = ly + chh * 2.5;
          const aura = ctx.createRadialGradient(
            fireX,
            fireY,
            2,
            fireX,
            fireY,
            68
          );
          aura.addColorStop(
            0,
            `rgba(255, 184, 77, ${(0.22 - tmix * 0.12) * flicker})`
          );
          aura.addColorStop(1, "rgba(255, 184, 77, 0)");
          ctx.globalAlpha = 1;
          ctx.fillStyle = aura;
          ctx.fillRect(fireX - 70, fireY - 70, 140, 140);

          for (let lineIdx = 0; lineIdx < lanternArt.length; lineIdx++) {
            const lineY = ly + lineIdx * chh;
            if (lineIdx === 2) {
              ctx.globalAlpha = 0.85;
              stampText(ctx, " [   ] ", "lanternStone", lx, lineY);

              ctx.globalAlpha = (0.95 - tmix * 0.25) * flicker;
              stampText(ctx, "  ###  ", "lanternGlow", lx, lineY);

              glowCtx.globalAlpha = (0.95 - tmix * 0.45) * flicker;
              stampText(glowCtx, "  ###  ", "lanternGlow", lx, lineY);
            } else {
              ctx.globalAlpha = 0.82;
              stampText(ctx, lanternArt[lineIdx], "lanternStone", lx, lineY);
            }
          }

          for (let refRow = 1; refRow <= 6; refRow++) {
            const ry = ly + (lanternArt.length + refRow) * chh;
            if (ry < anchorY || ry > anchorY + renderH) continue;
            const wob = Math.sin(time * 2.4 + refRow * 1.1) * 3.5;
            const al = (1 - refRow / 7) * (0.48 - tmix * 0.28) * flicker;
            ctx.globalAlpha = Math.max(0, al);
            stampText(
              ctx,
              refRow % 2 ? "  ~*~  " : "   -   ",
              "lanternGlow",
              lx + wob,
              ry
            );
          }
        }
      }

      /* Hardware-Upscaled Phosphor Bloom */
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.globalCompositeOperation = tmix < 0.5 ? "lighter" : "screen";
      ctx.globalAlpha = 0.58 * (1 - tmix * 0.35);
      ctx.drawImage(glowCanvas, 0, anchorY, vw, renderH);
      ctx.globalAlpha = 0.34 * (1 - tmix * 0.42);
      ctx.drawImage(glowCanvas, -4, anchorY - 3, vw + 8, renderH + 6);
      ctx.restore();

      ctx.globalAlpha = 1;
      ctx.restore();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      worldObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute top-0 left-0 block will-change-transform"
      aria-label="Interactive ASCII koi garden pond. Click water to feed the koi."
    />
  );
}
