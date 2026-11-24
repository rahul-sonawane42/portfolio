import { useEffect, useRef } from "react";

export default function ZenSandScrollbar({ hidden }: { hidden: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rakeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const rake = rakeRef.current;
    if (!canvas || !rake) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    const draw = () => {
      const height = window.innerHeight;
      const ratio = Math.max(0, Math.min(1, window.scrollY / Math.max(1, document.documentElement.scrollHeight - height)));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = 52 * dpr;
      canvas.height = height * dpr;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, 52, height);
      const rakeY = 38 + ratio * (height - 76);
      rake.style.transform = `translateY(${rakeY}px)`;
      const spacing = Math.max(15, height / 26);
      for (let y = rakeY % spacing - spacing; y < height; y += spacing) {
        if (Math.abs(y - rakeY) < spacing * 1.3) continue;
        const distance = Math.abs(y - rakeY);
        context.beginPath();
        for (let x = 1; x <= 51; x += 1) {
          const wave = Math.sin(x * 0.22 + y * 0.025) * 2.2 + Math.sin(x * 0.08 + y * 0.011) * 1.3;
          const yy = y + wave + Math.sin(distance * 0.003) * 2;
          if (x === 1) context.moveTo(x, yy); else context.lineTo(x, yy);
        }
        context.strokeStyle = document.documentElement.dataset.theme === "light" ? "rgba(122,110,92,.37)" : "rgba(213,201,179,.25)";
        context.lineWidth = 1;
        context.stroke();
      }
    };
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); };
    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const observer = new MutationObserver(onScroll);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); observer.disconnect(); };
  }, []);

  const goTo = (clientY: number) => {
    const progress = Math.max(0, Math.min(1, (clientY - 34) / Math.max(1, window.innerHeight - 68)));
    window.scrollTo({ top: progress * (document.documentElement.scrollHeight - window.innerHeight), behavior: "smooth" });
  };

  return (
    <aside aria-label="Interactive zen sand scroll control" className={`zen-sand-bed ${hidden ? "is-hidden" : ""}`} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); goTo(event.clientY); }} onPointerMove={(event) => { if (event.buttons === 1) goTo(event.clientY); }}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="moss-stone moss-top" aria-hidden="true" />
      <span className="moss-stone moss-bottom" aria-hidden="true" />
      <div ref={rakeRef} className="zen-rake" aria-hidden="true"><span className="rake-handle" /><span className="rake-head" /></div>
      <span className="sr-only">Drag or click to scroll</span>
    </aside>
  );
}
