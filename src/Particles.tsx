
import { useEffect, useRef } from "react";

type Props = {
  colors?: string[];
  line?: string;
  hero?: boolean;
};

type Star = {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  symbol: string;
  phase: number;
};

type Sparkle = {
  x: number;
  y: number;
  size: number;
  life: number;
  maxLife: number;
  symbol: string;
  rotation: number;
};

const STAR_SYMBOLS = ["✦", "✧", "⋆", "✧", "✦"];

export default function Particles({
  colors = ["#D13670", "#f296bb", "#e761aa", "#ffffff"],
  line: _line,
  hero = false,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const palette = colors.length
      ? colors
      : ["#D13670", "#f296bb"];

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let lastTime = 0;
    let spawnTime = 0;
    let mouseX = -1000;
    let mouseY = -1000;
    let previousMouseX = -1000;
    let previousMouseY = -1000;

    let stars: Star[] = [];
    let sparkles: Sparkle[] = [];

    const random = (min: number, max: number) =>
      min + Math.random() * (max - min);

    const createStar = (startAtRandomHeight = false): Star => ({
      x: random(0, width),
      y: startAtRandomHeight ? random(0, height) : random(-50, -10),
      size: random(8, hero ? 17 : 20),
      speed: random(25, 75),
      drift: random(-12, 12),
      rotation: random(0, Math.PI * 2),
      rotationSpeed: random(-0.7, 0.7),
      opacity: random(0.35, 0.9),
      symbol:
        STAR_SYMBOLS[Math.floor(Math.random() * STAR_SYMBOLS.length)],
      phase: random(0, Math.PI * 2),
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(
        hero ? 24 : 42,
        Math.max(12, Math.floor((width * height) / 30000)),
      );

      stars = Array.from({ length: count }, () => createStar(true));
    };

    const addSparkle = (x: number, y: number) => {
      if (sparkles.length > 35) return;

      sparkles.push({
        x: x + random(-7, 7),
        y: y + random(-7, 7),
        size: random(7, 13),
        life: 0,
        maxLife: random(450, 850),
        symbol: STAR_SYMBOLS[
          Math.floor(Math.random() * STAR_SYMBOLS.length)
        ],
        rotation: random(0, Math.PI),
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();

      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;

      const distance = Math.hypot(
        mouseX - previousMouseX,
        mouseY - previousMouseY,
      );

      if (distance > 16 && Math.random() < 0.65) {
        addSparkle(mouseX, mouseY);
        previousMouseX = mouseX;
        previousMouseY = mouseY;
      }
    };

    const handlePointerLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
      previousMouseX = -1000;
      previousMouseY = -1000;
    };

    const drawSymbol = (
      symbol: string,
      x: number,
      y: number,
      size: number,
      color: string,
      opacity: number,
      rotation: number,
    ) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = color;
      ctx.font = `${size}px "Segoe UI Symbol", "Noto Sans Symbols", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(symbol, 0, 0);
      ctx.restore();
    };

    const draw = (time: number) => {
      const delta = lastTime
        ? Math.min((time - lastTime) / 1000, 0.04)
        : 0;

      lastTime = time;
      ctx.clearRect(0, 0, width, height);

      if (!reduceMotion) {
        spawnTime += delta * 1000;

        // Une nouvelle étoile apparaît régulièrement.
        while (spawnTime >= (hero ? 450 : 300)) {
          spawnTime -= hero ? 450 : 300;
          stars.push(createStar());
        }

        // Quelques étoiles suivent délicatement le curseur.
        if (
          mouseX >= 0 &&
          mouseY >= 0 &&
          Math.random() < 0.025
        ) {
          addSparkle(mouseX, mouseY);
        }
      }

      stars = stars.filter((star) => star.y < height + 35);

      for (const star of stars) {
        if (!reduceMotion) {
          star.y += star.speed * delta;
          star.x += star.drift * delta;
          star.rotation += star.rotationSpeed * delta;
          star.phase += delta * 2;
        }

        const twinkle = reduceMotion
          ? 1
          : 0.82 + Math.sin(star.phase) * 0.18;

        const color =
          palette[Math.floor(
            (star.phase + star.size) % palette.length,
          )] || "#f296bb";

        drawSymbol(
          star.symbol,
          star.x,
          star.y,
          star.size,
          color,
          star.opacity * twinkle,
          star.rotation,
        );
      }

      for (const sparkle of sparkles) {
        if (!reduceMotion) {
          sparkle.life += delta * 1000;
          sparkle.y -= 15 * delta;
        }

        const progress = sparkle.life / sparkle.maxLife;

        drawSymbol(
          sparkle.symbol,
          sparkle.x,
          sparkle.y,
          sparkle.size * (1 - progress * 0.35),
          "#D13670",
          1 - progress,
          sparkle.rotation + progress,
        );
      }

      sparkles = sparkles.filter(
        (sparkle) => sparkle.life < sparkle.maxLife,
      );

      if (!reduceMotion) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    window.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);

    draw(0);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
    };
  }, [colors, hero]);

  return (
    <canvas
      ref={ref}
      className={hero ? "p-hero" : undefined}
      id={hero ? undefined : "particles"}
      aria-hidden="true"
    />
  );
}
