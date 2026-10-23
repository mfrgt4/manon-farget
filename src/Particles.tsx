import { useEffect, useRef } from "react";

type ParticlesProps = {
  className?: string;
  isHero?: boolean;
};

type Star = {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  phase: number;
  speed: number;
  driftX: number;
  driftY: number;
  vx: number;
  vy: number;
  color: string;
};

const COLORS = ["#ec65a7", "#ffffff", "#d77aa8", "#f5b4d1"];

export default function Particles({
  className = "",
  isHero = false,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let stars: Star[] = [];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const STAR_COUNT = isHero ? 55 : 40;
    const MOUSE_RADIUS = 150;
    const MOUSE_FORCE = 0.045;

    const mouse = {
      x: -1000,
      y: -1000,
      active: false,
    };

    const createStar = (): Star => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.8,
      baseOpacity: Math.random() * 0.25 + 0.18,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.025 + 0.008,
      driftX: (Math.random() - 0.5) * 0.2,
      driftY: (Math.random() - 0.5) * 0.2,
      vx: 0,
      vy: 0,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      stars = Array.from({ length: STAR_COUNT }, createStar);
    };

    // La souris est suivie même si le canvas utilise pointer-events: none.
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();

      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;

      mouse.active =
        mouse.x >= 0 &&
        mouse.x <= rect.width &&
        mouse.y >= 0 &&
        mouse.y <= rect.height;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const drawStar = (star: Star, time: number, mouseInfluence: number) => {
      const twinkle = (Math.sin(time * star.speed + star.phase) + 1) / 2;

      const opacity = Math.min(
        star.baseOpacity + twinkle * 0.16 + mouseInfluence * 0.12,
        0.65
      );

      ctx.globalAlpha = opacity;
      ctx.fillStyle = star.color;

      // Étoile scintillante à quatre branches.
      ctx.beginPath();
      ctx.moveTo(star.x, star.y - star.size * 2);
      ctx.lineTo(star.x + star.size * 0.45, star.y);
      ctx.lineTo(star.x, star.y + star.size * 2);
      ctx.lineTo(star.x - star.size * 0.45, star.y);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(star.x - star.size * 2, star.y);
      ctx.lineTo(star.x, star.y + star.size * 0.45);
      ctx.lineTo(star.x + star.size * 2, star.y);
      ctx.lineTo(star.x, star.y - star.size * 0.45);
      ctx.closePath();
      ctx.fill();

      // Petit centre lumineux, sans halo trop intense.
      ctx.globalAlpha = opacity * 0.45;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        let mouseInfluence = 0;

        if (mouse.active) {
          const dx = star.x - mouse.x;
          const dy = star.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0 && distance < MOUSE_RADIUS) {
            mouseInfluence = 1 - distance / MOUSE_RADIUS;

            // Répulsion douce des étoiles autour du curseur.
            star.vx +=
              (dx / distance) * mouseInfluence * MOUSE_FORCE;

            star.vy +=
              (dy / distance) * mouseInfluence * MOUSE_FORCE;
          }
        }

        // Mouvement naturel et retour progressif au calme.
        star.x += star.driftX + star.vx;
        star.y += star.driftY + star.vy;

        star.vx *= 0.94;
        star.vy *= 0.94;

        // Réapparition de l'autre côté du canvas.
        if (star.x < -5) star.x = width + 5;
        if (star.x > width + 5) star.x = -5;
        if (star.y < -5) star.y = height + 5;
        if (star.y > height + 5) star.y = -5;

        drawStar(star, time, mouseInfluence);
      }

      ctx.globalAlpha = 1;
      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("blur", handleMouseLeave);
    window.addEventListener("resize", resize);

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("blur", handleMouseLeave);
      window.removeEventListener("resize", resize);
    };
  }, [isHero]);

  return (
    <canvas
      ref={canvasRef}
      className={`particles-canvas ${className}`}
      aria-hidden="true"
    />
  );
}