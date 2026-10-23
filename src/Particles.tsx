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

    const mouse = {
      x: -1000,
      y: -1000,
      active: false,
    };

    const MOUSE_RADIUS = 140;
    const MOUSE_FORCE = 0.12;

    const init = () => {
      const rect = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      w = rect.width;
      h = rect.height;

      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(
        hero ? 48 : 65,
        Math.max(12, Math.floor((w * h) / (hero ? 16000 : 13000))),
      );

      sparkles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 0.7 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        speed: 0.025 + Math.random() * 0.035,
        opacity: 0.12 + Math.random() * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        star: Math.random() > 0.72,
      }));
    };

    const updateMouse = (clientX: number, clientY: number) => {
      const rect = cv.getBoundingClientRect();

      mouse.x = clientX - rect.left;
      mouse.y = clientY - rect.top;

      mouse.active =
        mouse.x >= 0 &&
        mouse.x <= rect.width &&
        mouse.y >= 0 &&
        mouse.y <= rect.height;
    };

    const handleMouseMove = (event: MouseEvent) => {
      updateMouse(event.clientX, event.clientY);
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

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
      ctx.fillStyle = color;

      ctx.beginPath();
      ctx.moveTo(0, -size * 1.8);
      ctx.quadraticCurveTo(
        size * 0.18,
        -size * 0.18,
        size * 1.8,
        0,
      );
      ctx.quadraticCurveTo(
        size * 0.18,
        size * 0.18,
        0,
        size * 1.8,
      );
      ctx.quadraticCurveTo(
        -size * 0.18,
        size * 0.18,
        -size * 1.8,
        0,
      );
      ctx.quadraticCurveTo(
        -size * 0.18,
        -size * 0.18,
        0,
        -size * 1.8,
      );
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

          // Déplacement naturel.
          s.x += s.vx * dt;
          s.y += s.vy * dt;

          // Les étoiles proches de la souris sont repoussées.
          if (mouse.active) {
            const dx = s.x - mouse.x;
            const dy = s.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0 && distance < MOUSE_RADIUS) {
              const influence = 1 - distance / MOUSE_RADIUS;

              s.vx +=
                (dx / distance) * influence * MOUSE_FORCE * dt;

              s.vy +=
                (dy / distance) * influence * MOUSE_FORCE * dt;
            }
          }

          // Retour progressif à un mouvement discret.
          s.vx *= Math.pow(0.94, dt);
          s.vy *= Math.pow(0.94, dt);

          if (s.x < -5) s.x = w + 5;
          if (s.x > w + 5) s.x = -5;
          if (s.y < -5) s.y = h + 5;
          if (s.y > h + 5) s.y = -5;
        }

        const twinkle = (Math.sin(s.phase) + 1) / 2;

        // Opacité faible pour préserver la lisibilité du texte.
        let alpha = s.opacity * (0.45 + twinkle * 0.45);
        let size = s.size * (0.85 + twinkle * 0.25);

        if (mouse.active) {
          const dx = s.x - mouse.x;
          const dy = s.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < MOUSE_RADIUS) {
            const influence = 1 - distance / MOUSE_RADIUS;

            // Scintillement légèrement renforcé près du curseur.
            alpha = Math.min(alpha + influence * 0.12, 0.42);
            size *= 1 + influence * 0.25;
          }
        }

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

      ctx.globalAlpha = 1;

      if (!reduce) {
        raf = requestAnimationFrame(draw);
      }
    };

    init();

    const ro = new ResizeObserver(init);
    ro.observe(cv);

    // window permet de suivre la souris même si le canvas
    // utilise pointer-events: none.
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("blur", handleMouseLeave);

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("blur", handleMouseLeave);
    };
  }, [colors, hero]);

  return (
    <canvas
      className={hero ? "p-hero" : undefined}
      id={hero ? undefined : "particles"}
      ref={ref}
      aria-hidden="true"
      style={{
        pointerEvents: "none",
      }}
    />
  );
}