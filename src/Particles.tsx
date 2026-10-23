import { useEffect, useRef } from "react";

type Props = {
  colors?: string[];
  line?: string;
  hero?: boolean;
};

type Bubble = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  z: number;
  c: string;
  phase: number;
  sparkle: boolean;
};

export default function Particles({
  colors = ["#f296bb", "#ffffff", "#c9d9cf", "#e9a3bc"],
  line = "216,75,125",
  hero = false,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");

    if (!cv || !ctx) return;

    const reduce = matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const palette = colors;
    const lineColor = line;

    let bubbles: Bubble[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;

    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;

    let px = -999;
    let py = -999;

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
        hero ? 35 : 65,
        Math.floor((w * h) / (hero ? 22000 : 18000)),
      );

      bubbles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 3 + Math.random() * 8,
        z: 0.3 + Math.random() * 0.7,
        c: palette[Math.floor(Math.random() * palette.length)],
        phase: Math.random() * Math.PI * 2,
        sparkle: Math.random() > 0.72,
      }));
    };

    init();

    const ro = new ResizeObserver(init);
    ro.observe(cv);

    const move = (e: PointerEvent) => {
      const rect = cv.getBoundingClientRect();

      px = e.clientX - rect.left;
      py = e.clientY - rect.top;

      tx = px / Math.max(w, 1) - 0.5;
      ty = py / Math.max(h, 1) - 0.5;
    };

    const leave = () => {
      px = -999;
      py = -999;
    };

    window.addEventListener("pointermove", move);
    cv.addEventListener("pointerleave", leave);

    // Dessine une bulle nacrée.
    const drawBubble = (
      x: number,
      y: number,
      radius: number,
      color: string,
      alpha: number,
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;

      const gradient = ctx.createRadialGradient(
        x - radius * 0.35,
        y - radius * 0.4,
        radius * 0.05,
        x,
        y,
        radius,
      );

      gradient.addColorStop(0, "rgba(255,255,255,0.95)");
      gradient.addColorStop(0.35, color);
      gradient.addColorStop(0.7, "rgba(255,255,255,0.28)");
      gradient.addColorStop(1, "rgba(255,255,255,0.06)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Contour lumineux.
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Petit reflet sur la partie supérieure.
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth = Math.max(0.6, radius * 0.12);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(
        x - radius * 0.08,
        y - radius * 0.08,
        radius * 0.65,
        Math.PI * 1.05,
        Math.PI * 1.48,
      );
      ctx.stroke();

      ctx.restore();
    };

    // Dessine une petite étoile à quatre branches.
    const drawSparkle = (
      x: number,
      y: number,
      size: number,
      alpha: number,
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);

      const gradient = ctx.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        size,
      );

      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(0.55, "#f296bb");
      gradient.addColorStop(1, "rgba(242,150,187,0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(size * 0.12, -size * 0.12, size, 0);
      ctx.quadraticCurveTo(size * 0.12, size * 0.12, 0, size);
      ctx.quadraticCurveTo(-size * 0.12, size * 0.12, -size, 0);
      ctx.quadraticCurveTo(-size * 0.12, -size * 0.12, 0, -size);
      ctx.fill();

      ctx.restore();
    };

    const draw = (time: number) => {
      const dt = lastTime
        ? Math.min((time - lastTime) / 16.67, 2)
        : 1;

      lastTime = time;

      if (!reduce) {
        mx += (tx - mx) * 0.045 * dt;
        my += (ty - my) * 0.045 * dt;
      }

      ctx.clearRect(0, 0, w, h);

      const pts = bubbles.map((b) => {
        if (!reduce) {
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.phase += 0.012 * dt;
        }

        if (b.x < -20) b.x = w + 20;
        if (b.x > w + 20) b.x = -20;
        if (b.y < -20) b.y = h + 20;
        if (b.y > h + 20) b.y = -20;

        let x = b.x - mx * 55 * b.z;
        let y = b.y - my * 55 * b.z;

        const dx = x - px;
        const dy = y - py;
        const distance = Math.hypot(dx, dy);

        // Les bulles s'écartent doucement du curseur.
        if (distance > 0 && distance < 110) {
          const force = ((110 - distance) / 110) * 22;
          x += (dx / distance) * force;
          y += (dy / distance) * force;
        }

        return { x, y, b };
      });

      // Connexions très fines et discrètes.
      ctx.lineWidth = 0.65;

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i];
          const b = pts[j];

          const distance = Math.hypot(
            a.x - b.x,
            a.y - b.y,
          );

          if (distance < 95) {
            const alpha = (1 - distance / 95) * 0.13;

            ctx.strokeStyle = `rgba(${lineColor},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Bulles et scintillements.
      for (const { x, y, b } of pts) {
        const pulse = reduce
          ? 1
          : 0.9 + Math.sin(b.phase) * 0.1;

        const radius = b.r * pulse;

        drawBubble(
          x,
          y,
          radius,
          b.c,
          0.45 + b.z * 0.4,
        );

        if (b.sparkle) {
          const sparkleAlpha = reduce
            ? 0.45
            : 0.25 + (Math.sin(b.phase * 1.7) + 1) * 0.3;

          drawSparkle(
            x + radius * 0.65,
            y - radius * 0.65,
            2 + b.z * 2.5,
            sparkleAlpha,
          );
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
      window.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerleave", leave);
    };
  }, [colors, line, hero]);

  return (
    <canvas
      className={hero ? "p-hero" : undefined}
      id={hero ? undefined : "particles"}
      ref={ref}
      aria-hidden="true"
    />
  );
}