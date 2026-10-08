import { useEffect, useRef } from "react";

// Particules en fond de page : elles dérivent, réagissent à la souris (parallaxe + répulsion) et se relient entre elles
type Props = { colors?: string[]; line?: string; hero?: boolean };

// colors : couleurs des points · line : "r,g,b" des traits · hero : version dans la bannière (taille du parent)
export default function Particles({ colors = ["#d84b7d", "#e9a3bc", "#a9bcae"], line = "216,75,125", hero = false }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    type D = { x: number; y: number; vx: number; vy: number; r: number; z: number; c: string };
    const COL = colors;
    let ds: D[] = [], w = 0, h = 0, ox = 0, oy = 0, raf = 0, mx = 0, my = 0, tx = 0, ty = 0, px = -999, py = -999;
    const init = () => {
      const d = Math.min(devicePixelRatio, 2);
      const r = cv.getBoundingClientRect(); w = r.width; h = r.height; cv.width = w * d; cv.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      ds = Array.from({ length: Math.min(70, Math.floor((w * h) / 16000)) }, () => ({
        x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: 0.8 + Math.random() * 1.4, z: 0.2 + Math.random() * 0.8, c: COL[(Math.random() * COL.length) | 0],
      }));
    };
    init();
    const ro = new ResizeObserver(init); ro.observe(cv);
    const move = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; tx = px / w - 0.5; ty = py / h - 0.5; };
    addEventListener("pointermove", move);
    const draw = () => {
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      ctx.clearRect(0, 0, w, h);
      const pts = ds.map((p) => {
        if (!reduce) { p.x += p.vx; p.y += p.vy; }
        if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; else if (p.y > h + 20) p.y = -20;
        let x = p.x - mx * 70 * p.z, y = p.y - my * 70 * p.z;
        const dx = x - px, dy = y - py, d = Math.hypot(dx, dy);
        if (d > 0 && d < 130) { const f = (130 - d) / 130; x += (dx / d) * f * 45; y += (dy / d) * f * 45; }
        return { x, y, p };
      });
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        if (d2 < 12100) { ctx.strokeStyle = `rgba(${line},${(1 - Math.sqrt(d2) / 110) * 0.12})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      for (const { x, y, p } of pts) {
        ctx.globalAlpha = 0.18 + 0.3 * p.z; ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(x, y, p.r * (0.6 + p.z * 0.6), 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener("pointermove", move); };
  }, []);
  return <canvas className={hero ? "p-hero" : undefined} id={hero ? undefined : "particles"} ref={ref} aria-hidden="true" />;
}