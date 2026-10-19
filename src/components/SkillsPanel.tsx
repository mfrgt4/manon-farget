
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

    cards.forEach((card, index) => {
      card.style.setProperty("--i", String(index));
    });

    // Apparition progressive lorsque les cartes entrent dans l'écran
    if (reduce || typeof IntersectionObserver === "undefined") {
      cards.forEach((card) => {
        card.classList.add("is-in", "is-settled");
      });
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const card = entry.target as HTMLElement;

            card.classList.add("is-in");
            observer.unobserve(card);

            timers.push(
              window.setTimeout(() => {
                card.classList.add("is-settled");
              }, 1500)
            );
          });
        },
        { threshold: 0.2 }
      );

      cards.forEach((card) => observer.observe(card));
      cleanups.push(() => observer.disconnect());
    }

    if (reduce) {
      return () => {
        cleanups.forEach((cleanup) => cleanup());
        timers.forEach((timer) => window.clearTimeout(timer));
      };
    }

    // Mobile : inclinaison des cartes selon leur position au défilement
    if (!fine) {
      let ticking = false;

      const update = () => {
        ticking = false;

        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const position =
            (rect.top + rect.height / 2 - window.innerHeight / 2) /
            window.innerHeight;

          const rotationX = Math.max(
            -7,
            Math.min(7, -position * 12)
          );

          card.style.setProperty(
            "--rx",
            `${rotationX.toFixed(2)}deg`
          );
          card.style.setProperty("--ry", "0deg");
        });
      };

      const onScroll = () => {
        if (ticking) return;

        ticking = true;
        requestAnimationFrame(update);
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);

      update();

      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      });

      return () => {
        cleanups.forEach((cleanup) => cleanup());
        timers.forEach((timer) => window.clearTimeout(timer));
      };
    }

    // Ordinateur : inclinaison 3D fluide à la souris
    const motion = new Map<HTMLElement, CardMotion>();

    let raf = 0;
    let last = 0;
    let currentCard: HTMLElement | null = null;

    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - (last || time)) / 1000);
      last = time;

      let busy = false;

      motion.forEach((state, card) => {
        const active = state.tp > 0;

        const kt = 1 - Math.exp(-dt / (active ? 0.09 : 0.3));
        const kp = 1 - Math.exp(-dt / (active ? 0.2 : 0.35));

        state.rx += (state.tx - state.rx) * kt;
        state.ry += (state.ty - state.ry) * kt;
        state.p += (state.tp - state.p) * kp;

        if (
          !active &&
          Math.abs(state.rx) < 0.01 &&
          Math.abs(state.ry) < 0.01 &&
          state.p < 0.001
        ) {
          ["--rx", "--ry", "--p", "--tx", "--ty"].forEach((property) => {
            card.style.removeProperty(property);
          });

          motion.delete(card);
          return;
        }

        card.style.setProperty("--rx", `${state.rx.toFixed(3)}deg`);
        card.style.setProperty("--ry", `${state.ry.toFixed(3)}deg`);
        card.style.setProperty("--p", state.p.toFixed(4));
        card.style.setProperty("--tx", (state.ry / MAX_Y).toFixed(3));
        card.style.setProperty("--ty", (state.rx / MAX_X).toFixed(3));

        busy = true;
      });

      if (busy) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
        last = 0;
      }
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const release = (card: HTMLElement) => {
      const state = motion.get(card);

      if (state) {
        state.tx = 0;
        state.ty = 0;
        state.tp = 0;
      }
    };

    const onMove = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) return;

      const card = target.closest<HTMLElement>(".skills-domain");

      if (currentCard && currentCard !== card) {
        release(currentCard);
        kick();
      }

      currentCard = card;

      if (grid) {
        const rect = grid.getBoundingClientRect();

        if (rect.width > 0 && rect.height > 0) {
          const sx =
            -((event.clientY - rect.top) / rect.height - 0.5) * 3;

          const sy =
            ((event.clientX - rect.left) / rect.width - 0.5) * 4;

          grid.style.setProperty("--sx", `${sx.toFixed(2)}deg`);
          grid.style.setProperty("--sy", `${sy.toFixed(2)}deg`);
        }
      }

      if (!card) return;

      const rect = card.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      let state = motion.get(card);

      if (!state) {
        state = {
          rx: 0,
          ry: 0,
          p: 0,
          tx: 0,
          ty: 0,
          tp: 0,
        };

        motion.set(card, state);
      }

      state.ty = (x - 0.5) * 2 * MAX_Y;
      state.tx = -(y - 0.5) * 2 * MAX_X;
      state.tp = 1;

      card.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);

      kick();
    };

    const onLeave = () => {
      if (currentCard) {
        release(currentCard);
        currentCard = null;
        kick();
      }

      if (grid) {
        grid.style.setProperty("--sx", "0deg");
        grid.style.setProperty("--sy", "0deg");
      }
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    cleanups.push(() => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="skills-panel" ref={root}>
      <div className="skills-panel-heading">
        <div>
          <span className="skills-panel-kicker mono">
            // MES DOMAINES
          </span>
        </div>

        <span className="skills-panel-count mono">
          04 DOMAINES
        </span>
      </div>

      <div className="skills-domains">
        {DOMAINS.map((domain) => (
          <article
            className="skills-domain"
            key={domain.id}
            style={{ "--skill-color": domain.color } as CSSProperties}
          >
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
          </article>
        ))}
      </div>

      <p className="skills-panel-footer mono">
        IMAGINATION · CRÉATIVITÉ · CONCEPTION
      </p>
    </div>
  );
}
