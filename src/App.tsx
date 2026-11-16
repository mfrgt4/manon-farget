import {
  CSSProperties,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import WordSphere from "./WordSphere";
import ProjectModal from "./ProjectModal";
import {
  about,
  facts,
  nav,
  profile,
  projects,
  projectGenres,
  skills,
  studies,
  tools,
} from "./data";
import type { Genre, Project } from "./data";

// ================= SONS =================
const buttonSound = new Audio("/sounds/Click-buttons.mp3");
const projectSound = new Audio("/sounds/Click-projets.mp3");
const introSound = new Audio("/sounds/Intro-welcome.mp3");

buttonSound.volume = 0.08;
projectSound.volume = 0.12;
introSound.volume = 0.08;

function playButtonClick() {
  buttonSound.currentTime = 0;
  buttonSound.play().catch(() => {});
}

function playProjectClick() {
  projectSound.currentTime = 0;
  projectSound.play().catch(() => {});
}

// ================= MUSIQUE D'INTRO =================
function useIntroSound() {
  useEffect(() => {
    const events = ["pointerdown", "keydown", "touchstart", "wheel", "scroll"];

    const removeListeners = () =>
      events.forEach((e) => window.removeEventListener(e, startOnInteraction));

    function startOnInteraction() {
      introSound
        .play()
        .then(removeListeners)
        .catch(() => {});
    }

    introSound.play().catch(() => {
      events.forEach((e) =>
        window.addEventListener(e, startOnInteraction, { passive: true }),
      );
    });

    return () => {
      removeListeners();
      introSound.pause();
      introSound.currentTime = 0;
    };
  }, []);
}

// ================= TEXTE ANIMÉ =================
function useTyped(words: string[]) {
  const [txt, setTxt] = useState(words[0] ?? "");

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTxt(words[0] ?? "");
      return;
    }

    let wi = 0;
    let ci = words[0]?.length ?? 0;
    let del = true;
    let id = window.setTimeout(() => tick(), 1800);

    const tick = () => {
      const w = words[wi];
      setTxt(w.slice(0, ci));

      let wait = del ? 38 : 78;

      if (!del && ci === w.length) {
        del = true;
        wait = 1600;
      } else if (del && ci === 0) {
        del = false;
        wi = (wi + 1) % words.length;
        wait = 240;
      } else {
        ci += del ? -1 : 1;
      }

      id = window.setTimeout(tick, wait);
    };

    return () => clearTimeout(id);
  }, [words]);

  return txt;
}

// ================= EFFETS GLOBAUX & CURSEUR DISCRET =================
function useEffects() {
  useEffect(() => {
    const rv = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            rv.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );

    document.querySelectorAll(".rv").forEach((el) => rv.observe(el));

    const glow = document.getElementById("glow");
    const cursorDot = document.getElementById("cursor-dot");
    const cursorRing = document.getElementById("cursor-ring");
    const progress = document.getElementById("progress");

    const finePointer = matchMedia("(pointer: fine)").matches;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;

    const renderCursor = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (cursorRing) {
        cursorRing.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(renderCursor);
    };

    if (finePointer && !reduced) {
      raf = requestAnimationFrame(renderCursor);
    }

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;

      if (glow) {
        glow.style.left = mx + "px";
        glow.style.top = my + "px";
      }

      if (cursorDot && finePointer && !reduced) {
        cursorDot.style.opacity = "1";
        cursorDot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }

      if (cursorRing && finePointer && !reduced) {
        cursorRing.style.opacity = "1";
        const interactive = (e.target as HTMLElement).closest(
          "a, button, input, textarea, [role='button'], #cloudbox",
        );
        cursorRing.classList.toggle("is-hover", Boolean(interactive));
      }

      const target = e.target as HTMLElement;
      const c = target.closest<HTMLElement>(".cell");
      if (!c) return;

      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", e.clientX - r.left + "px");
      c.style.setProperty("--my", e.clientY - r.top + "px");
    };

    const onLeave = () => {
      if (cursorDot) cursorDot.style.opacity = "0";
      if (cursorRing) cursorRing.style.opacity = "0";
    };

    const onScroll = () => {
      if (!progress) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      progress.style.transform = `scaleX(${ratio})`;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      rv.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
}

// ================= NAVIGATION ACTIVE =================
function useActive(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const updateActive = () => {
      if (window.scrollY <= 40) {
        setActive(null);
        return;
      }

      const referenceY = window.innerHeight * 0.45;
      const sections = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);

      const currentSection = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= referenceY && rect.bottom > referenceY;
      });

      if (currentSection) {
        setActive(currentSection.id);
      }
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [ids]);

  return active;
}

// ================= PARALLAXE HERO =================
function useHeroParallax() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hero = document.getElementById("hero");
    if (!hero) return;

    const m = (e: PointerEvent) => {
      hero.style.setProperty("--px", String(e.clientX / innerWidth - 0.5));
      hero.style.setProperty("--py", String(e.clientY / innerHeight - 0.5));
    };

    addEventListener("pointermove", m, { passive: true });
    return () => removeEventListener("pointermove", m);
  }, []);
}

// ================= TIMELINE =================
function useTimeline() {
  useEffect(() => {
    const tl = document.querySelector<HTMLElement>(".tl");
    if (!tl) return;

    const items = [...tl.querySelectorAll<HTMLElement>(".it")];
    let tick = false;

    const update = () => {
      tick = false;
      const y = innerHeight * 0.64;
      const r = tl.getBoundingClientRect();

      tl.style.setProperty(
        "--tl",
        String(Math.min(1, Math.max(0, (y - r.top) / r.height))),
      );

      items.forEach((it) =>
        it.classList.toggle("reached", it.getBoundingClientRect().top + 30 < y),
      );
    };

    const onScroll = () => {
      if (!tick) {
        tick = true;
        requestAnimationFrame(update);
      }
    };

    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    update();

    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);
}

// ================= INCLINAISON 3D =================
function useTilt() {
  useEffect(() => {
    if (
      !matchMedia("(hover:hover)").matches ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    type S = {
      rx: number;
      ry: number;
      p: number;
      tx: number;
      ty: number;
      tp: number;
      max: number;
      persp: string;
    };

    const map = new Map<HTMLElement, S>();
    let raf = 0;
    let last = 0;
    let cur: HTMLElement | null = null;

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - (last || t)) / 1000);
      last = t;
      let busy = false;

      map.forEach((s, el) => {
        const on = s.tp > 0;
        const kt = 1 - Math.exp(-dt / (on ? 0.09 : 0.28));
        const kp = 1 - Math.exp(-dt / (on ? 0.18 : 0.32));

        s.rx += (s.tx - s.rx) * kt;
        s.ry += (s.ty - s.ry) * kt;
        s.p += (s.tp - s.p) * kp;

        if (
          !on &&
          Math.abs(s.rx) < 0.01 &&
          Math.abs(s.ry) < 0.01 &&
          s.p < 0.001
        ) {
          el.style.transform = "";
          el.style.removeProperty("--p");
          map.delete(el);
          return;
        }

        el.style.transform = `${s.persp}rotateX(${s.rx.toFixed(3)}deg) rotateY(${s.ry.toFixed(3)}deg) translateY(${(-5 * s.p).toFixed(3)}px) scale(${(1 + 0.012 * s.p).toFixed(4)})`;
        el.style.setProperty("--p", s.p.toFixed(4));
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

    const release = (el: HTMLElement) => {
      const s = map.get(el);
      if (s) {
        s.tx = 0;
        s.ty = 0;
        s.tp = 0;
      }
    };

    const move = (e: PointerEvent) => {
      const el =
        (e.target as HTMLElement).closest<HTMLElement>("[data-tilt]") ?? null;

      if (cur && cur !== el) {
        release(cur);
        kick();
      }

      cur = el;
      if (!el) return;

      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;

      let s = map.get(el);
      if (!s) {
        s = {
          rx: 0,
          ry: 0,
          p: 0,
          tx: 0,
          ty: 0,
          tp: 0,
          max: Number(el.dataset.tilt) || 7,
          persp: el.dataset.persp === "none" ? "" : "perspective(950px) ",
        };
        map.set(el, s);
      }

      s.ty = x * s.max * 2;
      s.tx = -y * s.max * 2;
      s.tp = 1;

      el.style.setProperty("--gx", (x + 0.5) * 100 + "%");
      el.style.setProperty("--gy", (y + 0.5) * 100 + "%");

      kick();
    };

    const out = (e: PointerEvent) => {
      if (!e.relatedTarget && cur) {
        release(cur);
        cur = null;
        kick();
      }
    };

    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", out);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", out);
    };
  }, []);
}

// ================= APPARITION AU SCROLL =================
function useAes(dep: string) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.14, rootMargin: "0px 0px -4% 0px" },
    );

    document.querySelectorAll(".aes:not(.in)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}

// ================= NAVIGATION ANCRES =================
function useAnchorCenter() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey
      ) {
        return;
      }

      const a = (e.target as HTMLElement).closest?.<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      const id = a?.getAttribute("href")?.slice(1);
      const sec = id ? document.getElementById(id) : null;

      if (!sec) return;

      e.preventDefault();
      playButtonClick();

      const top = scrollY + sec.getBoundingClientRect().top;
      const h = sec.offsetHeight;

      scrollTo({
        top: Math.max(
          0,
          h <= innerHeight ? top - (innerHeight - h) / 2 : top - 24,
        ),
        behavior: "smooth",
      });

      history.replaceState(null, "", "#" + id);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

// ================= HELPERS =================
const cover = (p: Project) =>
  p.thumbnail ?? p.media?.find((m) => m.type === "image")?.src;

const getProjectGenre = (p: Project): Genre | undefined => {
  if (p.genre) return p.genre;
  const type = p.type?.toLocaleLowerCase("fr") ?? "";
  const title = p.title.toLocaleLowerCase("fr");

  if (
    type.includes("développement web") ||
    type.includes("developpement web")
  ) {
    return "developpement";
  }
  if (
    type.includes("audiovisuel") ||
    type.includes("vidéo") ||
    type.includes("video")
  ) {
    return "audiovisuel";
  }
  if (title.includes("d'jam") || title.includes("the pit")) {
    return "branding";
  }
  if (type.includes("communication") || type.includes("marketing")) {
    return "communication";
  }
  return undefined;
};

const TOOL_CLUSTERS = [
  {
    id: "all",
    label: "Tous les outils",
    code: "00",
    description: "Vue d'ensemble de l'écosystème créatif et technique.",
    items: tools,
  },
  {
    id: "design",
    label: "Design & UI/UX",
    code: "01",
    description:
      "Identité visuelle, mise en page éditoriale, maquettage et ergonomie.",
    items: tools.filter((t) =>
      [
        "Figma",
        "InDesign",
        "Photoshop",
        "Illustrator",
        "Affinity",
        "UX Design",
        "Maquettes",
        "Ergonomie",
        "Responsive",
        "Accessibilité",
      ].includes(t),
    ),
  },
  {
    id: "dev",
    label: "Développement Web",
    code: "02",
    description:
      "Intégration front-end, interfaces interactives, 3D et back-end.",
    items: tools.filter((t) =>
      [
        "React",
        "TypeScript",
        "three.js",
        "Vite",
        "Vercel",
        "HTML5",
        "CSS3",
        "JavaScript",
        "PHP",
        "SQL",
        "WordPress",
        "SEO",
      ].includes(t),
    ),
  },
  {
    id: "motion",
    label: "Audiovisuel & Workflow",
    code: "03",
    description:
      "Montage vidéo, motion design, versioning et gestion de projet.",
    items: tools.filter((t) =>
      ["After Effects", "Premiere Pro", "Git", "GitHub", "Notion"].includes(t),
    ),
  },
] as const;

const BAND = [
  "Communication",
  "Design graphique",
  "UI/UX Design",
  "Développement web",
  "Audiovisuel",
];

const ids = ["accueil", ...nav.map(([id]) => id)];
const delay = (d: number) => ({ "--d": d + "s" }) as CSSProperties;

// ================= COMPOSANT PRINCIPAL =================
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Thème sombre cinématographique par défaut
  useEffect(() => {
    document.documentElement.dataset.theme = "dark";
    try {
      localStorage.setItem("theme", "dark");
    } catch {
      // Ignore si localStorage est indisponible
    }
  }, []);

  const typedRole = useTyped(profile.roles);
  const active = useActive(ids);

  const [open, setOpen] = useState<number | null>(null);
  const [modalProjects, setModalProjects] = useState<Project[]>([]);
  const [projectScope, setProjectScope] = useState<
    "all" | "perso" | "universitaire"
  >("all");
  const [selectedGenre, setSelectedGenre] = useState<Genre | "all">("all");
  const [selSkill, setSelSkill] = useState(0);
  const [activeCluster, setActiveCluster] = useState<string>("all");
  const [focusedTool, setFocusedTool] = useState<string | null>(null);

  const personalProjects = useMemo(
    () => projects.filter((p) => p.category === "perso"),
    [],
  );

  const universityProjects = useMemo(
    () => projects.filter((p) => p.category === "universitaire"),
    [],
  );

  const universityProjectsByGenre = useMemo(
    () =>
      projectGenres.map(([genre, label]) => ({
        genre,
        label,
        projects: universityProjects.filter(
          (p) => getProjectGenre(p) === genre,
        ),
      })),
    [universityProjects],
  );

  const visibleGroups = useMemo(() => {
    const allGroups: [string, string, "perso" | "universitaire", Project[]][] =
      [
        [
          "Projets personnels",
          "Explorations libres autour du motion design, de l'identité visuelle et de la création web.",
          "perso",
          personalProjects,
        ],
        [
          "Projets universitaires",
          "Réalisations menées en BUT MMI mêlant direction artistique, conception interactive et stratégie.",
          "universitaire",
          universityProjects,
        ],
      ];

    if (projectScope === "all") return allGroups;
    return allGroups.filter(([, , cat]) => cat === projectScope);
  }, [personalProjects, universityProjects, projectScope]);

  const currentCluster =
    TOOL_CLUSTERS.find((c) => c.id === activeCluster) ?? TOOL_CLUSTERS[0];

  useEffects();
  useHeroParallax();
  useTimeline();
  useTilt();
  useAes(`projects-${projectScope}-${selectedGenre}`);
  useAnchorCenter();
  useIntroSound();

  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    playButtonClick();

    const f = new FormData(e.currentTarget);
    const subject = encodeURIComponent("Contact portfolio — " + f.get("name"));
    const body = encodeURIComponent(f.get("message") + "\n\n" + f.get("email"));

    location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <div id="progress" aria-hidden="true" />
      <div id="glow" aria-hidden="true" />
      <div id="cursor-dot" aria-hidden="true" />
      <div id="cursor-ring" aria-hidden="true" />

      <div className="orb o1" aria-hidden="true" />
      <div className="orb o2" aria-hidden="true" />

      {/* ================= NAVIGATION ================= */}
      <nav aria-label="Navigation principale">
        <div className="nav-shell">
          <a
            href="#accueil"
            className="nav-brand"
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-brand-dot" aria-hidden="true" />
            <span>{profile.name}</span>
          </a>

          <div className={`in ${menuOpen ? "mobile-open" : ""}`}>
            {nav.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className={active === id ? "on" : ""}
                onClick={() => {
                  playButtonClick();
                  setMenuOpen(false);
                }}
              >
                {label}
              </a>
            ))}
          </div>

          <button
            type="button"
            className="mobile-menu-btn"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            onClick={() => {
              playButtonClick();
              setMenuOpen((v) => !v);
            }}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* ================= 01. ACCUEIL ================= */}
      <section id="accueil">
        <div id="hero">
          <div className="h-word" aria-hidden="true">
            PORTFOLIO
          </div>

          <div className="h-text">
            <div className="h-eyebrow rv">
              <span className="badge mono">
                <span className="dot" />
                Recherche de stage · Avril 2027
              </span>
            </div>

            <h1 className="rv" style={delay(0.1)}>
              Salut ! Moi c'est
              <br />
              <span className="instrument">{profile.name}</span>
            </h1>

            <p className="h-signature rv" style={delay(0.18)}>
              <span className="mono h-role">
                {typedRole}
                <span className="cur" aria-hidden="true" />
              </span>
            </p>

            <p className="lead rv" style={delay(0.26)}>
              Étudiante en 2<sup>e</sup> année de BUT MMI à l'Université
              Clermont Auvergne au Puy-en-Velay. Je mêle créativité
              et nouvelles technologies pour donner vie à des expériences
              visuelles soignées.
            </p>

            <div className="btns rv" style={delay(0.34)}>
              <a className="btn p" href="#projets">
                Explorer mes projets ↗
              </a>
              <a className="btn" href="#contact">
                Discuter d'un stage · Avril 2027
              </a>
            </div>
          </div>

          <div className="h-visual rv" style={delay(0.2)}>
            <div className="arch-frame" data-tilt="6">
              <div className="arch">
                <img src={profile.photo} alt={`Portrait de ${profile.name}`} />
                <div className="arch-vignette" aria-hidden="true" />
              </div>

              <div className="h-badge" aria-hidden="true">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="60" fill="#EB8FAB" />
                  <circle
                    cx="60"
                    cy="60"
                    r="56"
                    fill="none"
                    stroke="rgba(235, 143, 171, 0.35)"
                    strokeWidth="1"
                  />
                  <defs>
                    <path
                      id="hb"
                      d="M60,60 m-41,0 a41,41 0 1,1 82,0 a41,41 0 1,1 -82,0"
                    />
                  </defs>
                  <text
                    fontSize="10"
                    fontWeight="700"
                    fill="#F5F3EF"
                    letterSpacing="1.2"
                  >
                    <textPath
                      href="#hb"
                      textLength="252"
                      lengthAdjust="spacing"
                    >
                      UI/UX DESIGN • CRÉATION • MOTION • WEB •
                    </textPath>
                  </text>
                  <text
                    x="60"
                    y="67"
                    textAnchor="middle"
                    fontSize="20"
                    fill="#EB8FAB"
                  >
                    ✦
                  </text>
                </svg>
              </div>

              <span className="h-chip c1">
                <i />
                Créative
              </span>
              <span className="h-chip c2 soft">
                <i />
                Autonome
              </span>
              <span className="h-chip c3">
                <i />
                Rigoureuse
              </span>
              <span className="h-chip c4 soft">
                <i />
                Polyvalente
              </span>
            </div>
          </div>
        </div>

        <div className="h-band" aria-hidden="true">
          <div className="h-band-t">
            {[...BAND, ...BAND, ...BAND, ...BAND].map((t, i) => (
              <span key={i}>
                {t}
                <b>✦</b>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 02. À PROPOS ================= */}
      <section id="a-propos">
        <div className="about">
          <div className="about-copy rv rv-l" style={delay(0.1)}>
            <p className="tag mono">01 // À propos</p>
            <h2>
              Entre direction artistique,
              <br />
              <span className="instrument">design &amp; mouvement.</span>
            </h2>

            <p className="about-p">
              Hello ! Moi, c’est Manon, étudiante en BUT MMI, parcours Création
              Numérique. Je m’intéresse particulièrement au design graphique, à
              l’UI/UX design et à l’audiovisuel. J’aime explorer les univers
              visuels, imaginer des interfaces et donner vie à mes idées à
              travers des projets créatifs.
            </p>

            <p className="about-p">
              En dehors des cours, je réalise des projets personnels en design
              graphique et montage vidéo pour explorer ma créativité et
              continuer à apprendre.
            </p>

            <p className="about-p">{about[2]}</p>

            <div className="about-meta">
              {facts.map((fact) => (
                <span key={fact} className="fact-pill mono">
                  {fact}
                </span>
              ))}
            </div>
          </div>

          <div className="photo rv rv-r" style={delay(0.2)}>
            <div className="p-tilt" data-tilt="9" data-persp="none">
              <span className="p-outline" aria-hidden="true" />
              <div className="p-frame">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={`Portrait de ${profile.name}`}
                  />
                ) : (
                  <div className="photo-ph mono">
                    <span>
                      {profile.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </span>
                    <small>portrait</small>
                  </div>
                )}
                <span className="p-glare" aria-hidden="true" />
              </div>
              <span className="p-tag" aria-hidden="true">
                hello !
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 03. COMPÉTENCES ================= */}
      <section id="competences">
        <div className="sk">
          <div className="sk-side">
            <p className="tag mono rv">02 // Savoir-faire</p>
            <h2 className="rv">
              Mes <span className="instrument">compétences.</span>
            </h2>
            <p className="sk-note rv">
              Survolez ou cliquez sur un domaine pour explorer mon approche
              créative et technique.
            </p>

            <div className="sk-preview-card rv" style={delay(0.12)}>
              <div className="sk-count mono">
                <b key={selSkill}>{String(selSkill + 1).padStart(2, "0")}</b>
                <span>/ {String(skills.length).padStart(2, "0")}</span>
              </div>
            </div>
          </div>

          <ul className="sk-list">
            {skills.map((s, i) => {
              const isOpen = selSkill === i;
              return (
                <li
                  key={s.title}
                  className="sk-row rv"
                  data-open={isOpen}
                  style={delay(i * 0.06)}
                  onMouseEnter={() => setSelSkill(i)}
                >
                  <button
                    type="button"
                    className="sk-head"
                    aria-label={s.title}
                    aria-expanded={isOpen}
                    onClick={() => {
                      playButtonClick();
                      setSelSkill(i);
                    }}
                    onFocus={() => setSelSkill(i)}
                  >
                    <span className="sk-n mono">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="sk-plus" aria-hidden="true">
                      +
                    </span>
                  </button>

                </li>
              );
            })}
          </ul>
        </div>

        <div className="cell sk-goal rv" data-tilt="3" style={delay(0.2)}>
          <div className="sk-goal-left">
            <span className="mono sk-goal-tag">&gt; objectif.txt</span>
            <p className="sk-goal-main">
              Stage en montage vidéo, design graphique ou UI/UX design ·{" "}
              <strong>Avril 2027</strong>
            </p>
          </div>
          <a href="#contact" className="btn">
            Proposer une opportunité ↗
          </a>
        </div>
      </section>

      {/* ================= 04. BOÎTE À OUTILS ================= */}
      <section id="boite-a-outils">
        <div className="section-head">
          <div>
            <p className="tag mono rv">03 // Environnement</p>
            <h2 className="rv">
              Ma boîte à <span className="instrument">outils.</span>
            </h2>
          </div>
          <p className="tools-inspiration rv">
            Inspirée de{" "}
            <a
              href="https://heaven-ghobrial.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Heaven Ghobrial
            </a>{" "}
            · {tools.length} outils &amp; technologies
          </p>
        </div>

        <div className="toolbox-layout">
          <div className="toolbox-explorer rv" style={delay(0.08)}>
            <div
              className="toolbox-filters"
              role="tablist"
              aria-label="Filtrer les outils par domaine"
            >
              {TOOL_CLUSTERS.map((cluster) => {
                const isActive = activeCluster === cluster.id;
                return (
                  <button
                    key={cluster.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`cluster-tab ${isActive ? "is-active" : ""}`}
                    onClick={() => {
                      playButtonClick();
                      setActiveCluster(cluster.id);
                      setFocusedTool(null);
                    }}
                  >
                    <span className="mono">{cluster.code}</span>
                    <span>{cluster.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="cell toolbox-card" data-tilt="4">
              <div className="toolbox-card-head">
                <span className="mono toolbox-code">
                  DOMAINE // {currentCluster.code}
                </span>
                <h3>{currentCluster.label}</h3>
                <p>{currentCluster.description}</p>
              </div>

              <div className="toolbox-pills">
                {currentCluster.items.map((tool) => {
                  const isFocused = focusedTool === tool;
                  return (
                    <button
                      key={tool}
                      type="button"
                      className={`tool-pill mono ${isFocused ? "is-focused" : ""}`}
                      onMouseEnter={() => setFocusedTool(tool)}
                      onClick={() => {
                        playButtonClick();
                        setFocusedTool(tool);
                      }}
                    >
                      <span className="tool-dot" aria-hidden="true" />
                      {tool}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="toolbox-sphere-wrap rv" style={delay(0.16)}>
            <WordSphere
              words={tools}
              highlightedWords={
                activeCluster === "all" ? [] : currentCluster.items
              }
              focusedWord={focusedTool}
            />
          </div>
        </div>
      </section>

      {/* ================= 05. PROJETS ================= */}
      <section id="projets" className="showing-projects">
        <div className="projects-top">
          <div>
            <p className="tag mono rv">04 // Réalisations</p>
            <h2 className="rv">
              Mes <span className="instrument">projets.</span>
            </h2>
          </div>

          <div
            className="scope-switch"
            role="group"
            aria-label="Filtrer par type de projet"
          >
            <button
              type="button"
              className={projectScope === "all" ? "is-active" : ""}
              onClick={() => {
                playButtonClick();
                setProjectScope("all");
              }}
            >
              Tous <span className="mono">{projects.length}</span>
            </button>
            <button
              type="button"
              className={projectScope === "perso" ? "is-active" : ""}
              onClick={() => {
                playButtonClick();
                setProjectScope("perso");
              }}
            >
              Personnels <span className="mono">{personalProjects.length}</span>
            </button>
            <button
              type="button"
              className={projectScope === "universitaire" ? "is-active" : ""}
              onClick={() => {
                playButtonClick();
                setProjectScope("universitaire");
              }}
            >
              Universitaires{" "}
              <span className="mono">{universityProjects.length}</span>
            </button>
          </div>
        </div>

        <div className="folder-list">
          {visibleGroups.map(([name, description, category, list], idx) => {
            const isUni = category === "universitaire";
            const displayedList =
              isUni && selectedGenre !== "all"
                ? list.filter((p) => getProjectGenre(p) === selectedGenre)
                : list;

            return (
              <div
                className={`grp project-group project-group--${idx + 1}`}
                key={name}
              >
                <div className="project-section-heading rv">
                  <span
                    className="project-section-number mono"
                    aria-hidden="true"
                  >
                    {category === "perso" ? "01" : "02"}
                  </span>
                  <div className="project-section-copy">
                    <span className="project-section-kicker mono">
                      {category === "perso"
                        ? "EXPLORATIONS CRÉATIVES"
                        : "CURSUS BUT MMI"}
                    </span>
                    <h3>{name}</h3>
                    <p className="project-section-description">{description}</p>
                  </div>
                  <span className="mono project-section-count">
                    {String(displayedList.length).padStart(2, "0")} réalisations
                  </span>
                </div>

                {isUni && (
                  <div
                    className="genre-filters"
                    role="group"
                    aria-label="Filtrer les projets universitaires par discipline"
                  >
                    <button
                      type="button"
                      className={`genre-filter ${selectedGenre === "all" ? "active" : ""}`}
                      aria-pressed={selectedGenre === "all"}
                      onClick={() => {
                        playButtonClick();
                        setSelectedGenre("all");
                      }}
                    >
                      Tout{" "}
                      <sup className="mono">{universityProjects.length}</sup>
                    </button>

                    {universityProjectsByGenre.map(
                      ({ genre, label, projects: genreProjects }) => {
                        const isActive = selectedGenre === genre;
                        return (
                          <button
                            key={genre}
                            type="button"
                            className={`genre-filter ${isActive ? "active" : ""}`}
                            aria-pressed={isActive}
                            onClick={() => {
                              playButtonClick();
                              setSelectedGenre(genre);
                            }}
                          >
                            {label}{" "}
                            <sup className="mono">{genreProjects.length}</sup>
                          </button>
                        );
                      },
                    )}
                  </div>
                )}

                <div className="projects-editorial-grid">
                  {displayedList.map((p, i) => {
                    // Rythme éditorial asymétrique
                    const mod = i % 5;
                    const layoutClass =
                      mod === 0
                        ? "proj-wide"
                        : mod === 3
                          ? "proj-tall"
                          : "proj-std";

                    return (
                      <article
                        key={p.title}
                        className={`cell proj aes ${layoutClass}`}
                        data-tilt="6"
                        style={delay((i % 3) * 0.08)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Ouvrir le projet ${p.title}`}
                        onClick={() => {
                          playProjectClick();
                          setModalProjects(displayedList);
                          setOpen(i);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            playProjectClick();
                            setModalProjects(displayedList);
                            setOpen(i);
                          }
                        }}
                      >
                        <div
                          className="thumb"
                          style={{ "--c": p.color } as CSSProperties}
                        >
                          {cover(p) ? (
                            <img src={cover(p)} alt={p.title} loading="lazy" />
                          ) : (
                            <span className="thumb-icon">{p.icon}</span>
                          )}
                          <span className="thumb-overlay" aria-hidden="true" />
                          <span className="arrow" aria-hidden="true">
                            ↗
                          </span>
                        </div>

                        <div className="proj-body">
                          <div className="proj-meta">
                            <span className="when mono">
                              {p.collaboration ?? p.kind}
                            </span>
                            {p.type && (
                              <span className="proj-type mono">{p.type}</span>
                            )}
                          </div>

                          <h3>{p.title}</h3>
                          <p>{p.text}</p>

                          <div className="chips">
                            {p.stack.map((c) => (
                              <i key={c} className="mono">
                                {c}
                              </i>
                            ))}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= 06. PARCOURS ================= */}
      <section id="parcours">
        <p className="tag mono rv">05 // Formation</p>
        <h2 className="rv">
          Mon <span className="instrument">parcours.</span>
        </h2>

        <div className="tl">
          <span className="tl-head" aria-hidden="true" />

          {studies.map((s, i) => (
            <div
              key={s.title}
              className={`cell it rv rv-r ${s.accent ? "is-current" : ""}`}
              style={delay(i * 0.08)}
            >
              <span className="when mono">{s.when}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 07. CONTACT ================= */}
      <section id="contact">
        <p className="tag mono rv">06 // Échanger</p>
        <h2 className="rv">
          Prêt·e à <span className="instrument">collaborer ?</span>
        </h2>

        <div className="contact-grid">
          <div className="cell contact-form-card rv">
            <p className="contact-lead">
              Un projet créatif, une opportunité de{" "}
              <strong>stage en avril 2027</strong> ou simplement envie
              d'échanger ? Écrivez-moi directement.
            </p>
            <form onSubmit={send}>
              <div className="form-row">
                <input name="name" placeholder="Votre nom" required />
                <input
                  name="email"
                  type="email"
                  placeholder="Votre adresse e-mail"
                  required
                />
              </div>
              <textarea
                name="message"
                rows={4}
                placeholder="Votre message..."
                required
              />

              <button className="btn p" type="submit">
                Envoyer le message ↗
              </button>
            </form>
          </div>

          <div className="contact-side rv" style={delay(0.1)}>
            <div className="cell availability-card" data-tilt="4">
              <span className="badge mono">
                <span className="dot" />
                Disponibilité · Avril 2027
              </span>
              <h3>Recherche de stage</h3>
              <p>
                À la recherche d'un stage à partir d'<strong>avril 2027</strong>{" "}
                en UI/UX design, design graphique, développement web créatif ou
                audiovisuel.
              </p>
            </div>

            <div className="links">
              <a href={"mailto:" + profile.email}>
                <div>
                  <span className="link-label">Adresse e-mail</span>
                  <span className="mono link-val">{profile.email}</span>
                </div>
                <span className="link-arrow">↗</span>
              </a>

              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div>
                  <span className="link-label">LinkedIn</span>
                  <span className="mono link-val">in/manon-farget</span>
                </div>
                <span className="link-arrow">↗</span>
              </a>

              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div>
                  <span className="link-label">GitHub</span>
                  <span className="mono link-val">@mfrgt4</span>
                </div>
                <span className="link-arrow">↗</span>
              </a>

              <a href={profile.cv} target="_blank" rel="noopener noreferrer">
                <div>
                  <span className="link-label">Curriculum Vitae</span>
                  <span className="mono link-val">Télécharger le PDF</span>
                </div>
                <span className="link-arrow">↓</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {open !== null && (
        <ProjectModal
          list={modalProjects}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}

      <footer className="mono">
        <span>
          © 2026 {profile.name} · Imaginé avec créativité, conçu avec passion
        </span>
        <a href="#accueil">↑ Haut de page</a>
      </footer>
    </>
  );
}
