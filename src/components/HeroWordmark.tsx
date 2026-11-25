import { useEffect, useRef, useState } from "react";

const ASCII_GLYPHS = ["@", "#", "%", "*", "+", "=", ":", ".", "/", "\\", "|", "~"];

const CHAR_BITMAPS: Record<string, string[]> = {
  A: ["..#..", ".#.#.", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".###."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  J: ["..###", "...#.", "...#.", "...#.", "#..#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#...#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", ".#.#.", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  X: ["#...#", ".#.#.", "..#..", "..#..", "..#..", ".#.#.", "#...#"],
  Y: ["#...#", ".#.#.", "..#..", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
};

function buildAsciiMatrixString(ch: string, tick: number): string {
  const map = CHAR_BITMAPS[ch.toUpperCase()] ?? CHAR_BITMAPS.H;
  const rows: string[] = [];

  for (let r = 0; r < map.length; r++) {
    let line = "";
    const rowPattern = map[r];
    for (let c = 0; c < rowPattern.length; c++) {
      if (rowPattern[c] === "#") {
        const idx = (r * 7 + c * 3 + tick + ((r + tick) % 3)) % 7;
        line += ASCII_GLYPHS[idx];
      } else {
        const noise = (r * 11 + c * 5 + tick * 2) % 19;
        line += noise === 0 ? "." : " ";
      }
    }
    rows.push(line);
  }
  return rows.join("\n");
}

function GlitchChar({ char }: { char: string }) {
  const cellRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);
  const tickRef = useRef(0);
  const [active, setActive] = useState(false);
  const [matrix, setMatrix] = useState("");
  const [jitter, setJitter] = useState({ x: 0, y: 0 });
  const [lockedSize, setLockedSize] = useState<{ w: number; h: number } | null>(null);

  const stopGlitch = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setActive(false);
    setJitter({ x: 0, y: 0 });
    setLockedSize(null);
  };

  const startGlitch = () => {
    if (timerRef.current !== null) return;
    if (cellRef.current) {
      // Use untransformed layout dimensions so parent scaleY() never double-scales on hover
      setLockedSize({
        w: cellRef.current.offsetWidth,
        h: cellRef.current.offsetHeight,
      });
    }
    setActive(true);

    const step = () => {
      tickRef.current += 1;
      const t = tickRef.current;
      setMatrix(buildAsciiMatrixString(char, t));
      setJitter({
        x: ((t % 3) - 1) * 1.2,
        y: (((t + 1) % 3) - 1) * 0.8,
      });
    };

    step();
    timerRef.current = window.setInterval(step, 36);
  };

  useEffect(() => stopGlitch, []);

  return (
    <span
      ref={cellRef}
      aria-hidden="true"
      onPointerEnter={startGlitch}
      onPointerLeave={stopGlitch}
      onTouchStart={() => {
        startGlitch();
        window.setTimeout(stopGlitch, 900);
      }}
      style={
        lockedSize
          ? { width: `${lockedSize.w}px`, height: `${lockedSize.h}px` }
          : undefined
      }
      className={`hero-char-cell ${active ? "is-glitching" : ""}`}
    >
      <span className="hero-char-solid">{char}</span>
      <span
        className="hero-char-ascii-overlay"
        style={
          active
            ? { transform: `translate(${jitter.x}px, ${jitter.y}px)` }
            : undefined
        }
      >
        {matrix}
      </span>
    </span>
  );
}

export default function HeroWordmark({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);

  return (
    <h1
      aria-label={text}
      className="hero-wordmark pointer-events-auto flex w-full flex-wrap items-center justify-center gap-x-[0.22em] gap-y-2 text-center"
    >
      {words.map((word, wIdx) => (
        <span
          key={`${word}-${wIdx}`}
          className="inline-flex items-center whitespace-nowrap"
        >
          {Array.from(word).map((ch, cIdx) => (
            <GlitchChar key={`${wIdx}-${cIdx}-${ch}`} char={ch} />
          ))}
        </span>
      ))}
    </h1>
  );
}
