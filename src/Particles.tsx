import { useEffect, useRef } from "react";

type Props = {
  colors?: string[];
  line?: string;
  hero?: boolean;
};

type Sparkle = {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
  opacity: number;
  color: string;
};

export default function Particles({
  colors = ["#f296bb", "#ffffff", "#c9d9cf", "#e9a3bc"],
  hero = false,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");

    if (!cv || !ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let sparkles: Sparkle[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;

    const init = () => {
      const rect = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      w = rect.width;
      h = rect.height;

      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(
        hero ? 18 : 28,
        Math.max(5, Math.floor((w * h) / (hero ? 45000 : 35000))),
      );

      sparkles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 0.6 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.012,
        opacity: 0.15 + Math.random() * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    };

    init();

    const ro = new ResizeObserver(init);
    ro.observe(cv);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const s of sparkles) {
        if (!reduce) {
          s.phase += s.speed;
        }

        const pulse = reduce
          ? 0.7
          : 0.35 + (Math.sin(s.phase) + 1) * 0.25;

        const alpha = s.opacity + pulse * 0.2;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Petit point lumineux, sans contour ni forme de bulle.
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Halo très léger autour du point.
        const glow = ctx.createRadialGradient(
          s.x,
          s.y,
          0,
          s.x,
          s.y,
          s.size * 4,
        );

        glow.addColorStop(0, s.color);
        glow.addColorStop(1, "rgba(255,255,255,0)");

        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      if (!reduce) {
        raf = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [colors, hero]);

  return (
    <canvas
      className={hero ? "p-hero" : undefined}
      id={hero ? undefined : "particles"}
      ref={ref}
      aria-hidden="true"
    />
  );
}