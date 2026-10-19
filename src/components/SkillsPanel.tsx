
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
  targetRx: number;
  targetRy: number;
  targetP: number;
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

    /*
     * 1. INITIALISATION STABLE
     *
     * Les cartes sont visibles immédiatement.
     * Aucun état invisible ou décalé pendant le chargement.
     */

    cards.forEach((card, index) => {
      card.style.setProperty("--i", String(index));
      card.classList.add("is-in");
    });

    /*
     * Le CSS utilise cette classe pour distinguer
     * l'initialisation du fonctionnement normal.
     */

    grid?.classList.add("skills-anim-ready");

    /*
     * 2. FLOTTEMENT PROGRESSIF
     *
     * On conserve l'IntersectionObserver uniquement pour
     * déclencher le flottement, jamais pour afficher les cartes.
     *
     * Le délai négatif d'animation est supprimé côté CSS
     * pour éviter une position aléatoire au rafraîchissement.
     */

    if (!reduce && typeof IntersectionObserver !== "undefined") {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || disposed) return;

            const card = entry.target as HTMLElement;

            if (!card.classList.contains("is-settled")) {
              const timer = window.setTimeout(() => {
                if (!disposed) {
                  card.classList.add("is-settled");
                }
              }, 500);

              timers.push(timer);
            }

            io.unobserve(card);
          });
        },
        {
          threshold: 0.2,
        }
      );

      cards.forEach((card) => io.observe(card));

      cleanups.push(() => io.disconnect());
    } else if (reduce) {
      cards.forEach((card) => {
        card.classList.remove("is-settled");
      });
    }

    if (reduce) {
      return () => {
        disposed = true;
        cleanups.forEach((cleanup) => cleanup());
        timers.forEach((timer) => window.clearTimeout(timer));
        grid?.classList.remove("skills-anim-ready");
      };
    }

    /*
     * 3. ÉCRANS TACTILES
     *
     * Inclinaison discrète selon la position de la carte.
     * Aucun calcul de position n'est appliqué au montage :
     * les cartes restent stables au premier affichage.
     */

    if (!fine) {
      let scrollRaf = 0;

      const updateTilt = () => {
        scrollRaf = 0;

        if (disposed) return;

        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();

          const center =
            rect.top + rect.height / 2;

          const distance =
            (center - window.innerHeight / 2) /
            window.innerHeight;

          const rx = Math.max(
            -4,
            Math.min(4, -distance * 5)
          );

          card.style.setProperty(
            "--rx",
            `${rx.toFixed(2)}deg`
          );
        });
      };

      const onScroll = () => {
        if (scrollRaf) return;

        scrollRaf = window.requestAnimationFrame(updateTilt);
      };

      window.addEventListener("scroll", onScroll, {
        passive: true,
      });

      window.addEventListener("resize", onScroll);

      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);

        if (scrollRaf) {
          window.cancelAnimationFrame(scrollRaf);
        }
      });

      return () => {
        disposed = true;
        cleanups.forEach((cleanup) => cleanup());
        timers.forEach((timer) => window.clearTimeout(timer));
        grid?.classList.remove("skills-anim-ready");
      };
    }

    /*
     * 4. SOURIS — ANIMATION 3D FLUIDE
     *
     * Les valeurs sont interpolées progressivement.
     * On évite de supprimer les variables CSS pendant
     * le retour à la position neutre.
     */

    const motion = new Map<HTMLElement, CardMotion>();

    let raf = 0;
    let lastTime = 0;
    let currentCard: HTMLElement | null = null;

    const ensureMotion = (
      card: HTMLElement
    ): CardMotion => {
      let state = motion.get(card);

      if (!state) {
        state = {
          rx: 0,
          ry: 0,
          p: 0,
          targetRx: 0,
          targetRy: 0,
          targetP: 0,
        };

        motion.set(card, state);
      }

      return state;
    };

    const renderMotion = (
      timestamp: number
    ) => {
      const dt = Math.min(
        0.05,
        (timestamp - (lastTime || timestamp)) / 1000
      );

      lastTime = timestamp;

      let active = false;

      motion.forEach((state, card) => {
        const hovering = state.targetP > 0;

        const rotationSpeed = 1 - Math.exp(
          -dt / (hovering ? 0.09 : 0.24)
        );

        const depthSpeed = 1 - Math.exp(
          -dt / (hovering ? 0.12 : 0.24)
        );

        state.rx +=
          (state.targetRx - state.rx) * rotationSpeed;

        state.ry +=
          (state.targetRy - state.ry) * rotationSpeed;

        state.p +=
          (state.targetP - state.p) * depthSpeed;

        const settled =
          !hovering &&
          Math.abs(state.rx) < 0.015 &&
          Math.abs(state.ry) < 0.015 &&
          state.p < 0.001;

        if (settled) {
          state.rx = 0;
          state.ry = 0;
          state.p = 0;

          card.style.setProperty("--rx", "0deg");
          card.style.setProperty("--ry", "0deg");
          card.style.setProperty("--p", "0");
          card.style.setProperty("--tx", "0");
          card.style.setProperty("--ty", "0");

          motion.delete(card);
          return;
        }

        card.style.setProperty(
          "--rx",
          `${state.rx.toFixed(3)}deg`
        );

        card.style.setProperty(
          "--ry",
          `${state.ry.toFixed(3)}deg`
        );

        card.style.setProperty(
          "--p",
          state.p.toFixed(4)
        );

        card.style.setProperty(
          "--tx",
          (state.ry / MAX_Y).toFixed(3)
        );

        card.style.setProperty(
          "--ty",
          (state.rx / MAX_X).toFixed(3)
        );

        active = true;
      });

      if (active) {
        raf = window.requestAnimationFrame(renderMotion);
      } else {
        raf = 0;
        lastTime = 0;
      }
    };

    const startAnimation = () => {
      if (!raf) {
        raf = window.requestAnimationFrame(renderMotion);
      }
    };

    const releaseCard = (card: HTMLElement) => {
      const state = motion.get(card);

      if (!state) return;

      state.targetRx = 0;
      state.targetRy = 0;
      state.targetP = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const card = target.closest<HTMLElement>(
        ".skills-domain"
      );

      if (currentCard && currentCard !== card) {
        releaseCard(currentCard);
        startAnimation();
      }

      currentCard = card;

      /*
       * La scène suit la souris sans modifier
       * la position réelle des cartes dans la grille.
       */

      if (grid) {
        const rect = grid.getBoundingClientRect();

        if (rect.width > 0 && rect.height > 0) {
          const x =
            (event.clientX - rect.left) / rect.width;

          const y =
            (event.clientY - rect.top) / rect.height;

          grid.style.setProperty(
            "--sx",
            `${(-(y - 0.5) * 3).toFixed(2)}deg`
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

      const x = Math.max(
        0,
        Math.min(1, (event.clientX - rect.left) / rect.width)
      );

      const y = Math.max(
        0,
        Math.min(1, (event.clientY - rect.top) / rect.height)
      );

      const state = ensureMotion(card);

      state.targetRx = -(y - 0.5) * 2 * MAX_X;
      state.targetRy = (x - 0.5) * 2 * MAX_Y;
      state.targetP = 1;

      card.style.setProperty(
        "--gx",
        `${(x * 100).toFixed(1)}%`
      );

      card.style.setProperty(
        "--gy",
        `${(y * 100).toFixed(1)}%`
      );

      startAnimation();
    };

    const resetGrid = () => {
      if (!grid) return;

      grid.style.setProperty("--sx", "0deg");
      grid.style.setProperty("--sy", "0deg");
    };

    const onPointerLeave = () => {
      if (currentCard) {
        releaseCard(currentCard);
        currentCard = null;
        startAnimation();
      }

      resetGrid();
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);

    cleanups.push(() => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);

      if (raf) {
        window.cancelAnimationFrame(raf);
      }

      motion.clear();
      resetGrid();
    });

    return () => {
      disposed = true;

      cleanups.forEach((cleanup) => cleanup());

      timers.forEach((timer) => {
        window.clearTimeout(timer);
      });

      grid?.classList.remove("skills-anim-ready");
    };
  }, []);

  return (
    <div className="skills-panel" ref={root}>
      <span
        className="skills-orb skills-orb--a"
        aria-hidden="true"
      />

      <span
        className="skills-orb skills-orb--b"
        aria-hidden="true"
      />

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
            style={
              {
                "--skill-color": domain.color,
              } as CSSProperties
            }
          >
            <span
              className="skills-domain-depth"
              aria-hidden="true"
            />

            <span
              className="skills-domain-bignum"
              aria-hidden="true"
            >
              {domain.number}
            </span>

            <div className="skills-domain-header">
              <span className="skills-domain-number mono">
                {domain.number}
              </span>

              <div className="skills-domain-icon">
                <img
                  src={domain.icon}
                  alt=""
                  aria-hidden="true"
                />
              </div>

              <div className="skills-domain-title">
                <h4>{domain.title}</h4>
                <p>{domain.subtitle}</p>
              </div>

              <span
                className="skills-domain-arrow"
                aria-hidden="true"
              >
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
                  style={
                    {
                      "--tag-index": index,
                    } as CSSProperties
                  }
                >
                  <span
                    className="skills-tag-dot"
                    aria-hidden="true"
                  />

                  {tool}
                </span>
              ))}
            </div>

            <span
              className="skills-domain-glare"
              aria-hidden="true"
            />
          </article>
        ))}
      </div>

      <p className="skills-panel-footer mono">
        IMAGINATION · CRÉATIVITÉ · CONCEPTION
      </p>
    </div>
  );
}
