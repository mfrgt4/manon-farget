import { useEffect, useRef } from "react";

type ParticlesProps = {
  className?: string;
  isHero?: boolean;
};

type Star = {
  x: number;
  y: number;
  size: number;
  opacity: number;
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

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const mouse = {
      x: -1000,
      y: -1000,
      active: false,
    };

    const STAR_COUNT = isHero ? 38 : 28;
    const MOUSE_RADIUS = 130;
    const MOUSE_FORCE = 0.035;

    const createStar = (): Star => {
      const size = Math.random() * 1.5 + 0.6;
      const opacity = Math.random() * 0.18 + 0.08;

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        opacity,
        baseOpacity: opacity,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.025 + 0.008,
        driftX: (Math.random() - 0.5) * 0.25,
        driftY: (Math.random() - 0.5) * 0.25,
        vx: 0,
        vy: 0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      stars = Array.from({ length: STAR_COUNT }, createStar);
    };

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

    const drawStar = (star: Star, time: number) => {
      const twinkle = (Math.sin(time * star.speed + star.phase) + 1) / 2;

      // Les étoiles restent discrètes au repos.
      const targetOpacity = star.baseOpacity + twinkle * 0.12;
      star.opacity += (targetOpacity - star.opacity) * 0.08;

      ctx.globalAlpha = star.opacity;
      ctx.fillStyle = star.color;

      // Petite étoile à quatre branches.
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
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        star.x += star.driftX + star.vx;
        star.y += star.driftY + star.vy;

        // Retour progressif à un mouvement calme.
        star.vx *= 0.94;
        star.vy *= 0.94;

        if (mouse.active) {
          const dx = star.x - mouse.x;
          const dy = star.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0 && distance < MOUSE_RADIUS) {
            const influence = 1 - distance / MOUSE_RADIUS;

            // Les étoiles sont légèrement repoussées par le curseur.
            star.vx += (dx / distance) * influence * MOUSE_FORCE;
            star.vy += (dy / distance) * influence * MOUSE_FORCE;

            // Elles scintillent un peu plus près du curseur.
            const glow = influence * 0.12;
            ctx.globalAlpha = Math.min(star.baseOpacity + glow, 0.45);
          }
        }

        // Réapparition de l'autre côté lorsqu'une étoile sort du canvas.
        if (star.x < -5) star.x = width + 5;
        if (star.x > width + 5) star.x = -5;
        if (star.y < -5) star.y = height + 5;
        if (star.y > height + 5) star.y = -5;

        drawStar(star, time);
      }

      ctx.globalAlpha = 1;
      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    window.addEventListener("resize", resize);

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
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