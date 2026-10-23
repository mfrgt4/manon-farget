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
  vx: number;
  vy: number;
  star: boolean;
};

export default function Particles({
  colors = ["#ec65a7", "#ffffff", "#d77aa8", "#f5b4d1"],
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
    let lastTime = 0;

    const init = () => {
      const rect = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      w = rect.width;
      h = rect.height;

      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(
        hero ? 65 : 100,
        Math.max(12, Math.floor((w * h) / (hero ? 11000 : 8500))),
      );

      sparkles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 1 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.025 + Math.random() * 0.045,
        opacity: 0.25 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        star: Math.random() > 0.58,
      }));
    };

    init();

    const ro = new ResizeObserver(init);
    ro.observe(cv);

    const drawStar = (
      x: number,
      y: number,
      size: number,
      alpha: number,
      color: string,
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 5;
      ctx.fillStyle = color;

      ctx.beginPath();
      ctx.moveTo(0, -size * 1.8);
      ctx.quadraticCurveTo(size * 0.18, -size * 0.18, size * 1.8, 0);
      ctx.quadraticCurveTo(size * 0.18, size * 0.18, 0, size * 1.8);
      ctx.quadraticCurveTo(-size * 0.18, size * 0.18, -size * 1.8, 0);
      ctx.quadraticCurveTo(-size * 0.18, -size * 0.18, 0, -size * 1.8);
      ctx.fill();

      ctx.restore();
    };

    const draw = (time: number) => {
      const dt = lastTime
        ? Math.min((time - lastTime) / 16.67, 2)
        : 1;

      lastTime = time;

      ctx.clearRect(0, 0, w, h);

      for (const s of sparkles) {
        if (!reduce) {
          s.phase += s.speed * dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;

          if (s.x < -10) s.x = w + 10;
          if (s.x > w + 10) s.x = -10;
          if (s.y < -10) s.y = h + 10;
          if (s.y > h + 10) s.y = -10;
        }

        const twinkle = (Math.sin(s.phase) + 1) / 2;
        const alpha = s.opacity * (0.18 + twinkle * 0.82);
        const size = s.size * (0.7 + twinkle * 0.7);

        // Halo lumineux pour rester visible sur les fonds clairs.
        ctx.save();
        ctx.globalAlpha = alpha * 0.48;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = size * 7;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (s.star) {
          drawStar(s.x, s.y, size, alpha, s.color);
        } else {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      if (!reduce) {
        raf = requestAnimationFrame(draw);
      }
    };

    draw(0);

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