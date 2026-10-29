
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
const DEFAULT_COLORS = ["#D13670", "#f296bb", "#e761aa", "#ffffff"];

export default function Particles({
  colors = DEFAULT_COLORS,
  line: _line,
  hero = false,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  // Garde les dernières options sans redémarrer l'animation.
  const optionsRef = useRef({ colors, hero });

  useEffect(() => {
    optionsRef.current = { colors, hero };
  }, [colors, hero]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let lastTime = 0;
    let spawnTime = 0;
    let mouseX = -1000;
    let mouseY = -1000;
    let previousMouseX = -1000;
    let previousMouseY = -1000;
    let initialized = false;

    const stars: Star[] = [];
    const sparkles: Sparkle[] = [];

    const random = (min: number, max: number) =>
      min + Math.random() * (max - min);

    const createStar = (startAtRandomHeight = false): Star => ({
      x: random(0, Math.max(width, 1)),
      y: startAtRandomHeight ? random(0, height) : random(-50, -10),
      size: random(8, 20),
      speed: random(25, 75),
      drift: random(-12, 12),
      rotation: random(0, Math.PI * 2),
      rotationSpeed: random(-0.7, 0.7),
      opacity: random(0.35, 0.9),
      symbol:
        STAR_SYMBOLS[
          Math.floor(Math.random() * STAR_SYMBOLS.length)
        ],
      phase: random(0, Math.PI * 2),
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const newWidth = rect.width || window.innerWidth;
      const newHeight = rect.height || window.innerHeight;

      // Ne réinitialise pas les étoiles si les dimensions n'ont pas changé.
      const dimensionsChanged =
        newWidth !== width || newHeight !== height;

      if (!dimensionsChanged && initialized) return;

      width = newWidth;
      height = newHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!initialized) {
        const count = Math.min(
          42,
          Math.max(12, Math.floor((width * height) / 30000)),
        );

        for (let i = 0; i < count; i++) {
          stars.push(createStar(true));
        }

        initialized = true;
      } else {
        // Conserve les étoiles existantes et ajuste seulement celles
        // qui sortent des limites lors d'un véritable redimensionnement.
        for (const star of stars) {
          star.x = Math.min(star.x, width);
          star.y = Math.min(star.y, height + 35);
        }
      }
    };

    const addSparkle = (x: number, y: number) => {
      if (sparkles.length > 35) return;

      sparkles.push({
        x: x + random(-7, 7),
        y: y + random(-7, 7),
        size: random(7, 13),
        life: 0,
        maxLife: random(450, 850),
        symbol:
          STAR_SYMBOLS[
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

      const palette = optionsRef.current.colors.length
        ? optionsRef.current.colors
        : DEFAULT_COLORS;

      if (!reduceMotion) {
        spawnTime += delta * 1000;

        while (spawnTime >= 300) {
          spawnTime -= 300;
          stars.push(createStar());
        }

        if (
          mouseX >= 0 &&
          mouseY >= 0 &&
          Math.random() < 0.025
        ) {
          addSparkle(mouseX, mouseY);
        }
      }

      // Les étoiles tombent et sont retirées uniquement lorsqu'elles
      // ont réellement quitté l'écran.
      for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];

        if (!reduceMotion) {
          star.y += star.speed * delta;
          star.x += star.drift * delta;
          star.rotation += star.rotationSpeed * delta;
          star.phase += delta * 2;
        }

        if (star.y >= height + 35) {
          stars.splice(i, 1);
          continue;
        }

        const twinkle = reduceMotion
          ? 1
          : 0.82 + Math.sin(star.phase) * 0.18;

        const colorIndex =
          Math.abs(Math.floor(star.phase + star.size)) %
          palette.length;

        drawSymbol(
          star.symbol,
          star.x,
          star.y,
          star.size,
          palette[colorIndex] || "#f296bb",
          star.opacity * twinkle,
          star.rotation,
        );
      }

      for (let i = sparkles.length - 1; i >= 0; i--) {
        const sparkle = sparkles[i];

        if (!reduceMotion) {
          sparkle.life += delta * 1000;
          sparkle.y -= 15 * delta;
        }

        const progress = sparkle.life / sparkle.maxLife;

        if (progress >= 1) {
          sparkles.splice(i, 1);
          continue;
        }

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

      if (!reduceMotion) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);

    if (reduceMotion) {
      draw(0);
    } else {
      animationFrame = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className={hero ? "p-hero" : undefined}
      id={hero ? undefined : "particles"}
      aria-hidden="true"
    />
  );
}
