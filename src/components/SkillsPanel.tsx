
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import "./SkillsPanel.css";

type Domain = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  number: string;
  icon: string;
  tools: string[];
};

const DOMAINS: Domain[] = [
  {
    id: "design",
    title: "Design graphique",
    subtitle: "Créer un univers visuel",
    color: "#e761aa",
    number: "01",
    icon: "/icons/palette_pink.png",
    tools: ["Photoshop", "Illustrator", "InDesign", "Affinity"],
  },
  {
    id: "uiux",
    title: "UI/UX design",
    subtitle: "Imaginer des interfaces",
    color: "#9ab88b",
    number: "02",
    icon: "/icons/mobile_pink.png",
    tools: [
      "Figma",
      "UX Design",
      "Maquettes",
      "Ergonomie",
      "Responsive",
      "Accessibilité",
    ],
  },
  {
    id: "web",
    title: "Développement web",
    subtitle: "Donner vie aux idées",
    color: "#829cf4",
    number: "03",
    icon: "/icons/code_pink.png",
    tools: [
      "WordPress",
      "HTML5",
      "CSS3",
      "JavaScript",
      "TypeScript",
      "React",
      "three.js",
      "Vite",
      "Node.js",
      "PHP",
      "SQL",
      "SEO",
    ],
  },
  {
    id: "video",
    title: "Audiovisuel",
    subtitle: "Raconter en images",
    color: "#efaa82",
    number: "04",
    icon: "/icons/clap_pink.png",
    tools: ["Premiere Pro", "After Effects"],
  },
];

const MAX_X = 8;
const MAX_Y = 11;

type CardMotion = {
  rx: number;
  ry: number;
  p: number;
  tx: number;
  ty: number;
  tp: number;
};

export default function SkillsPanel() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const grid = el.querySelector<HTMLElement>(".skills-domains");
    const cards = Array.from(
      el.querySelectorAll<HTMLElement>(".skills-domain")
    );

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const fine = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    const timers: number[] = [];
    const cleanups: Array<() => void> = [];
    let disposed = false;

    cards.forEach((card, index) => {
      card.style.setProperty("--i", String(index));
    });

    /* Entrée progressive des cartes à leur arrivée à l'écran */
    if (reduce || typeof IntersectionObserver === "undefined") {
      cards.forEach((card) => {
        card.classList.add("is-in");
      });
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const card = entry.target as HTMLElement;

            card.classList.add("is-in");
            observer.unobserve(card);

            const timer = window.setTimeout(() => {
              if (!disposed) {
                card.classList.add("is-settled");
              }
            }, 1200);

            timers.push(timer);
          });
        },
        {
          threshold: 0.15,
        }
      );

      cards.forEach((card) => observer.observe(card));

      cleanups.push(() => observer.disconnect());
    }

    if (reduce) {
      return () => {
        disposed = true;
        cleanups.forEach((cleanup) => cleanup());
        timers.forEach((timer) => window.clearTimeout(timer));
      };
    }

    /* Inclinaison légère sur écran tactile */
    if (!fine) {
      let ticking = false;

      const updateTilt = () => {
        ticking = false;

        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const distance = (center - window.innerHeight / 2) /
            window.innerHeight;

          const rx = Math.max(-4, Math.min(4, -distance * 7));

          card.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
        });
      };

      const onScroll = () => {
        if (ticking) return;

        ticking = true;
        requestAnimationFrame(updateTilt);
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);

      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      });

      return () => {
        disposed = true;
        cleanups.forEach((cleanup) => cleanup());
        timers.forEach((timer) => window.clearTimeout(timer));
      };
    }

    /* Inclinaison 3D à la souris */
    const motions = new Map<HTMLElement, CardMotion>();

    let raf = 0;
    let lastTime = 0;
    let currentCard: HTMLElement | null = null;

    const animate = (time: number) => {
      if (disposed) return;

      const dt = Math.min(0.05, (time - (lastTime || time)) / 1000);
      lastTime = time;

      let active = false;

      motions.forEach((motion, card) => {
        const hovering = motion.tp > 0;

        const rotationSpeed =
          1 - Math.exp(-dt / (hovering ? 0.09 : 0.3));

        const depthSpeed =
          1 - Math.exp(-dt / (hovering ? 0.2 : 0.35));

        motion.rx += (motion.tx - motion.rx) * rotationSpeed;
        motion.ry += (motion.ty - motion.ry) * rotationSpeed;
        motion.p += (motion.tp - motion.p) * depthSpeed;

        if (
          !hovering &&
          Math.abs(motion.rx) < 0.01 &&
          Math.abs(motion.ry) < 0.01 &&
          motion.p < 0.001
        ) {
          card.style.setProperty("--rx", "0deg");
          card.style.setProperty("--ry", "0deg");
          card.style.setProperty("--p", "0");
          card.style.setProperty("--tx", "0");
          card.style.setProperty("--ty", "0");

          motions.delete(card);
          return;
        }

        card.style.setProperty("--rx", `${motion.rx.toFixed(3)}deg`);
        card.style.setProperty("--ry", `${motion.ry.toFixed(3)}deg`);
        card.style.setProperty("--p", motion.p.toFixed(4));
        card.style.setProperty("--tx", (motion.ry / MAX_Y).toFixed(3));
        card.style.setProperty("--ty", (motion.rx / MAX_X).toFixed(3));

        active = true;
      });

      if (active) {
        raf = requestAnimationFrame(animate);
      } else {
        raf = 0;
        lastTime = 0;
      }
    };

    const startAnimation = () => {
      if (!raf) {
        raf = requestAnimationFrame(animate);
      }
    };

    const releaseCard = (card: HTMLElement) => {
      const motion = motions.get(card);

      if (motion) {
        motion.tx = 0;
        motion.ty = 0;
        motion.tp = 0;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const card = target.closest<HTMLElement>(".skills-domain");

      if (currentCard && currentCard !== card) {
        releaseCard(currentCard);
        startAnimation();
      }

      currentCard = card;

      if (grid) {
        const rect = grid.getBoundingClientRect();

        if (rect.width > 0 && rect.height > 0) {
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;

          grid.style.setProperty(
            "--sx",
            `${(-((y - 0.5) * 3)).toFixed(2)}deg`
          );

          grid.style.setProperty(
            "--sy",
            `${((x - 0.5) * 4).toFixed(2)}deg`
          );
        }
      }

      if (!card) return;

      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      let motion = motions.get(card);

      if (!motion) {
        motion = {
          rx: 0,
          ry: 0,
          p: 0,
          tx: 0,
          ty: 0,
          tp: 0,
        };

        motions.set(card, motion);
      }

      motion.ty = (x - 0.5) * 2 * MAX_Y;
      motion.tx = -(y - 0.5) * 2 * MAX_X;
      motion.tp = 1;

      card.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);

      startAnimation();
    };

    const onPointerLeave = () => {
      if (currentCard) {
        releaseCard(currentCard);
        currentCard = null;
        startAnimation();
      }

      if (grid) {
        grid.style.setProperty("--sx", "0deg");
        grid.style.setProperty("--sy", "0deg");
      }
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);

    cleanups.push(() => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(raf);
    });

    return () => {
      disposed = true;
      cleanups.forEach((cleanup) => cleanup());
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="skills-panel" ref={root}>
      <span className="skills-orb skills-orb--a" aria-hidden="true" />
      <span className="skills-orb skills-orb--b" aria-hidden="true" />

      <div className="skills-panel-heading">
        <div>
          <span className="skills-panel-kicker mono">
            // MES DOMAINES
          </span>
        </div>

        <span className="skills-panel-count mono">04 DOMAINES</span>
      </div>

      <div className="skills-domains skills-anim-ready">
        {DOMAINS.map((domain) => (
          <article
            className="skills-domain"
            key={domain.id}
            style={{ "--skill-color": domain.color } as CSSProperties}
          >
            <span className="skills-domain-depth" aria-hidden="true" />

            <span className="skills-domain-bignum" aria-hidden="true">
              {domain.number}
            </span>

            <div className="skills-domain-header">
              <span className="skills-domain-number mono">
                {domain.number}
              </span>

              <div className="skills-domain-icon">
                <img src={domain.icon} alt="" aria-hidden="true" />
              </div>

              <div className="skills-domain-title">
                <h4>{domain.title}</h4>
                <p>{domain.subtitle}</p>
              </div>

              <span className="skills-domain-arrow" aria-hidden="true">
                ↗
              </span>
            </div>

            <div
              className="skills-tags"
              aria-label={`Compétences : ${domain.title}`}
            >
              {domain.tools.map((tool, index) => (
                <span
                  className="skills-tag"
                  key={tool}
                  style={{ "--tag-index": index } as CSSProperties}
                >
                  <span className="skills-tag-dot" aria-hidden="true" />
                  {tool}
                </span>
              ))}
            </div>

            <span className="skills-domain-glare" aria-hidden="true" />
          </article>
        ))}
      </div>

      <p className="skills-panel-footer mono">
        IMAGINATION · CRÉATIVITÉ · CONCEPTION
      </p>
    </div>
  );
}
