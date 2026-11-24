import { useEffect, useRef } from "react";

const CHANNEL_WIDTH = 68;
const GROOVES = 7;

export default function ZenSandScrollbar({ hidden }: { hidden: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rakeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const rake = rakeRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !rake || !context) return;

    let frame = 0;
    let previousY = window.scrollY;
    let previousTime = performance.now();
    let velocity = 0;
    let easedY = 0;

    const draw = (now = performance.now()) => {
      const viewportHeight = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = CHANNEL_WIDTH;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
      const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      const targetY = 24 + progress * Math.max(0, viewportHeight - 72);
      const ease = 1 - Math.exp(-Math.max(1, now - previousTime) / 55);
      easedY += (targetY - easedY) * ease;
      velocity *= 0.88;
      previousTime = now;
      rake.style.transform = `translate3d(${Math.max(-3, Math.min(3, velocity * 0.025))}px, ${easedY}px, 0)`;

      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(viewportHeight * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        canvas.style.height = `${viewportHeight}px`;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const light = document.documentElement.dataset.theme === "light";
      const base = light ? "#dfd9ce" : "#1a1c1e";
      const ridge = light ? "#f5f1e8" : "#2d3136";
      const trough = light ? "#a9a399" : "#090b0d";
      context.fillStyle = base;
      context.fillRect(0, 0, width, viewportHeight);

      let seed = 217;
      const random = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      for (let i = 0; i < 560; i += 1) {
        const x = 11 + random() * (width - 11);
        const y = random() * viewportHeight;
        const radius = 0.25 + random() * 0.65;
        context.fillStyle = light
          ? `rgba(82, 73, 62, ${0.05 + random() * 0.12})`
          : `rgba(225, 228, 232, ${0.035 + random() * 0.09})`;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }

      for (let tine = 0; tine < GROOVES; tine += 1) {
        const xBase = 15 + tine * 7.25;
        context.beginPath();
        for (let y = 0; y <= viewportHeight + 4; y += 2) {
          const offset = Math.sin(y * 0.019 + tine * 0.68 + window.scrollY * 0.003) * 2.15
            + Math.sin(y * 0.007 + tine * 1.2) * 1.15
            + Math.sin(y * 0.004 + tine * 0.44) * Math.min(2.4, Math.abs(velocity) * 0.018);
          const x = xBase + offset;
          if (y === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = trough;
        context.lineWidth = 3.5;
        context.globalAlpha = light ? 0.22 : 0.65;
        context.stroke();
        context.translate(-0.8, 0);
        context.strokeStyle = ridge;
        context.lineWidth = 1.5;
        context.globalAlpha = light ? 0.65 : 0.48;
        context.stroke();
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      context.globalAlpha = 1;
      context.fillStyle = light ? "rgba(72, 66, 57, .08)" : "rgba(255,255,255,.045)";
      context.fillRect(0, 0, 10, viewportHeight);
      context.strokeStyle = light ? "rgba(78,72,63,.45)" : "rgba(0,0,0,.8)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(10, 0);
      context.lineTo(10, viewportHeight);
      context.stroke();
      if (Math.abs(targetY - easedY) > 0.5) frame = requestAnimationFrame(draw);
    };

    const schedule = () => {
      const now = performance.now();
      const currentY = window.scrollY;
      const elapsed = Math.max(1, now - previousTime);
      velocity = (currentY - previousY) / elapsed * 16;
      previousY = currentY;
      previousTime = now;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };
    const themeObserver = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      themeObserver.disconnect();
    };
  }, []);

  const scrollToPointer = (clientY: number) => {
    const progress = Math.max(0, Math.min(1, (clientY - 24) / Math.max(1, window.innerHeight - 48)));
    window.scrollTo({ top: progress * (document.documentElement.scrollHeight - window.innerHeight), behavior: "auto" });
  };

  return (
    <aside
      aria-label="Interactive zen sand scroll control"
      className={`zen-sand-bed ${hidden ? "is-hidden" : ""}`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        scrollToPointer(event.clientY);
      }}
      onPointerMove={(event) => {
        if (event.buttons === 1) scrollToPointer(event.clientY);
      }}
      onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <div ref={rakeRef} className="zen-rake" aria-hidden="true">
        <svg viewBox="0 0 58 48" className="rake-illustration">
          <defs>
            <linearGradient id="rakeWood" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="var(--rake-light)" />
              <stop offset=".48" stopColor="var(--rake)" />
              <stop offset="1" stopColor="var(--rake-shadow)" />
            </linearGradient>
          </defs>
          <path d="M31 24 54 1" className="rake-handle-shadow" />
          <path d="M31 24 54 1" className="rake-handle" />
          <path d="M8 26h42" className="rake-bar-shadow" />
          <path d="M8 24h42" className="rake-bar" />
          {Array.from({ length: GROOVES }, (_, index) => {
            const x = 11 + index * 6;
            return <path key={x} d={`M${x} 25v13`} className="rake-tine" />;
          })}
          <path d="M9 22h40" className="rake-edge-highlight" />
        </svg>
      </div>
      <span className="moss-stone moss-top" aria-hidden="true" />
      <span className="moss-stone moss-middle" aria-hidden="true" />
      <span className="moss-stone moss-bottom" aria-hidden="true" />
      <span className="sr-only">Drag or click to scroll</span>
    </aside>
  );
}
