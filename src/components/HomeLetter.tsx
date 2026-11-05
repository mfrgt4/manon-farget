import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { profile } from "../data";
import "./HomeLetter.css";

// Image de l'enveloppe (dossier public/images/). BASE_URL gère les sous-dossiers de déploiement.
const ENVELOPE_SRC = `${import.meta.env.BASE_URL}images/enveloppe.png`;
const PORTRAIT_SRC = `${import.meta.env.BASE_URL}images/portrait.png`;

// Étincelles autour de l'enveloppe : position, taille, rythme, et direction de l'explosion à l'ouverture
const SPARKS = [
  { x: -3, y: 14, s: 12, dl: 0.0, t: 3.4, bx: -90, by: -70 },
  { x: 8, y: -7, s: 8, dl: -1.1, t: 4.0, bx: -50, by: -110 },
  { x: 27, y: -11, s: 13, dl: -2.2, t: 3.1, bx: -20, by: -130 },
  { x: 52, y: -9, s: 8, dl: -0.6, t: 3.8, bx: 10, by: -125 },
  { x: 74, y: -12, s: 14, dl: -1.7, t: 3.3, bx: 40, by: -120 },
  { x: 93, y: -4, s: 9, dl: -2.8, t: 4.2, bx: 90, by: -90 },
  { x: 103, y: 22, s: 13, dl: -0.9, t: 3.6, bx: 120, by: -40 },
  { x: 101, y: 62, s: 8, dl: -2.4, t: 3.0, bx: 120, by: 30 },
  { x: 96, y: 98, s: 12, dl: -1.4, t: 3.9, bx: 95, by: 85 },
  { x: 66, y: 107, s: 8, dl: -3.1, t: 3.5, bx: 40, by: 120 },
  { x: 34, y: 106, s: 13, dl: -0.3, t: 4.1, bx: -30, by: 120 },
  { x: 4, y: 100, s: 9, dl: -2.0, t: 3.2, bx: -95, by: 80 },
  { x: -5, y: 58, s: 11, dl: -1.0, t: 3.7, bx: -120, by: 20 },
];

const d = (seconds: number) =>
  ({ "--hl-d": `${seconds}s` }) as CSSProperties;

// ---------------------------------------------------------------------------
// Enveloppe de secours (affichée seulement si l'image est introuvable)
// ---------------------------------------------------------------------------
function EnvelopeFallback() {
  return (
    <svg
      className="hl-env-img hl-env-img--fallback"
      viewBox="0 0 520 340"
      role="img"
      aria-label="Enveloppe fermée"
    >
      <rect
        x="6"
        y="6"
        width="508"
        height="328"
        rx="18"
        fill="#fbfaf7"
        stroke="#dcd9d4"
        strokeWidth="2"
      />
      <path
        d="M10 14 L260 196 L510 14"
        fill="none"
        stroke="#dcd9d4"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 330 L200 172 M510 330 L320 172"
        fill="none"
        stroke="#e8e5e0"
        strokeWidth="2"
      />
      <circle cx="260" cy="196" r="34" fill="#d84b7d" />
      <circle cx="260" cy="196" r="27" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.5" />
      <text
        x="260"
        y="210"
        textAnchor="middle"
        fontSize="38"
        fill="#fff"
        fontStyle="italic"
        fontFamily="'Instrument Serif',Georgia,serif"
      >
        {profile.name.charAt(0)}
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Section d'accueil : l'enveloppe, puis la lettre
// ---------------------------------------------------------------------------
export default function HomeLetter() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const envRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const [state, setState] = useState<"closed" | "opening" | "open">("closed");
  const [imgFailed, setImgFailed] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  // Clic sur l'enveloppe : la lettre en sort, l'enveloppe s'éclipse
  const openEnvelope = () => {
    if (state !== "closed") return;

    const section = sectionRef.current;
    const stage = stageRef.current;

    // Calcule d'où la lettre doit partir : le centre réel de l'enveloppe
    const env = envRef.current;
    if (section && stage && env) {
      const cs = getComputedStyle(section);
      const pt = parseFloat(cs.paddingTop) || 0;
      const pb = parseFloat(cs.paddingBottom) || 0;
      const minH = parseFloat(cs.minHeight) || window.innerHeight;
      const h = stage.offsetHeight;
      const finalHeight = Math.max(minH, h + pt + pb);
      const finalTop = pt + (finalHeight - pt - pb - h) / 2;

      const envRect = env.getBoundingClientRect();
      const envCenter = envRect.top + envRect.height / 2;
      const letterCenter = section.getBoundingClientRect().top + finalTop + h / 2;

      section.style.setProperty("--hl-fy", `${(envCenter - letterCenter).toFixed(1)}px`);
    }

    setState("opening");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timerRef.current = window.setTimeout(
      () => setState("open"),
      reduce ? 0 : 3800,
    );
  };

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  // Inclinaison 3D et reflet sur la carte qui suivent la souris
  useEffect(() => {
    const card = cardRef.current;
    const stage = stageRef.current;
    if (!card || !stage) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      raf = 0;

      // On mesure le conteneur (non incliné) pour éviter les tremblements
      const r = stage.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (x - r.left) / r.width));
      const py = Math.min(1, Math.max(0, (y - r.top) / r.height));

      if (!reduce) {
        card.style.setProperty("--rx", ((0.5 - py) * 9).toFixed(2));
        card.style.setProperty("--ry", ((px - 0.5) * 11).toFixed(2));
      }
      card.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
      card.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
      card.style.setProperty("--go", "1");
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      card.style.setProperty("--rx", "0");
      card.style.setProperty("--ry", "0");
      card.style.setProperty("--go", "0");
    };

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Si un espace vide décale la section vers le bas, on la remonte au bord de la page :
  // plus de bande derrière le menu.
  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const flush = () => {
      el.style.marginTop = "0px";
      const top = el.getBoundingClientRect().top + window.scrollY;
      if (top > 0 && top < 240) el.style.marginTop = `${-top}px`;
    };

    flush();
    window.addEventListener("resize", flush);
    return () => window.removeEventListener("resize", flush);
  }, []);

  return (
    <section
      id="accueil"
      className="hl"
      data-state={state}
      ref={sectionRef}
      aria-label="Message d’accueil"
    >
      {/* L'enveloppe : seule visible tant qu'elle n'est pas ouverte */}
      {state !== "open" && (
        <div className="hl-envelope-wrap">
          <div className="hl-envelope-inner" ref={envRef}>
          <button
            type="button"
            className="hl-envelope"
            onClick={openEnvelope}
            aria-label="Ouvrir l’enveloppe pour découvrir le message"
          >
            <span className="hl-env-glow" aria-hidden="true" />

            {imgFailed ? (
              <EnvelopeFallback />
            ) : (
              <img
                className="hl-env-img"
                src={ENVELOPE_SRC}
                alt="Enveloppe fermée"
                draggable={false}
                onError={() => setImgFailed(true)}
              />
            )}

            <span className="hl-env-shine" aria-hidden="true" />

            <span className="hl-env-sparks" aria-hidden="true">
              {SPARKS.map((p, i) => (
                <i
                  key={i}
                  style={
                    {
                      "--x": `${p.x}%`,
                      "--y": `${p.y}%`,
                      "--s": `${p.s}px`,
                      "--dl": `${p.dl}s`,
                      "--t": `${p.t}s`,
                      "--bx": `${p.bx}px`,
                      "--by": `${p.by}px`,
                      "--bd": `${(i % 4) * 0.06}s`,
                    } as CSSProperties
                  }
                />
              ))}
            </span>
          </button>

          <p className="hl-env-hint">
            <span className="hl-env-arrow" aria-hidden="true">
              ↑
            </span>
            Un message vous attend, il doit être ouvert…
            <strong>Appuyez sur l’enveloppe</strong>
          </p>
          </div>
        </div>
      )}

      {/* La lettre */}
      <div className="hl-stage" ref={stageRef}>
        <article className="hl-card" ref={cardRef} aria-labelledby="hl-title">
          <header className="hl-head hl-ink" style={d(0.1)}>
            <div className="hl-id">
              <span className="hl-mono" aria-hidden="true">
                {profile.name.charAt(0)}
              </span>
              <span className="hl-id-text">
                <strong>{profile.name}</strong>
                <small>Étudiante en BUT MMI</small>
              </span>
            </div>

            <span className="hl-pill">
              <i aria-hidden="true" />
              Disponible · stage avril 2027
            </span>
          </header>

          <h1 id="hl-title" className="hl-title hl-ink" style={d(0.35)}>
            Une invitation à découvrir <em>mon portfolio…</em>
          </h1>

          <div className="hl-body">
            {!photoFailed && (
              <figure className="hl-photo hl-ink" style={d(0.5)}>
                <div className="hl-photo-frame">
                  <img
                    src={PORTRAIT_SRC}
                    alt={`Portrait de ${profile.name}`}
                    onError={() => setPhotoFailed(true)}
                  />
                </div>
                <figcaption className="hl-photo-tag" aria-hidden="true">
                  hello !
                </figcaption>
              </figure>
            )}

            <p className="hl-salutation hl-ink" style={d(0.6)}>
              Chère visiteuse, cher visiteur,
            </p>

            <p className="hl-p hl-ink" style={d(0.8)}>
              J’ai le plaisir de vous inviter à découvrir mon univers créatif !
              Je suis <strong className="hl-name">{profile.name}</strong>,
              étudiante en deuxième année de BUT MMI à l’Université Clermont
              Auvergne, au Puy-en-Velay.
            </p>

            <p className="hl-p hl-ink" style={d(1.0)}>
              Entre design graphique, communication visuelle, UI/UX design et
              création numérique, j’aime imaginer et donner vie à des projets
              qui racontent une histoire.
            </p>

            <p className="hl-p hl-ink" style={d(1.2)}>
              Je vous invite à parcourir mes créations et à découvrir les
              différentes facettes de mon univers.
            </p>

            <div className="hl-actions hl-ink" style={d(1.45)}>
              <a className="btn p" href="#projets">
                Découvrir mes projets →
              </a>
              <a className="btn" href="#contact">
                Me contacter
              </a>
            </div>
          </div>

          <div className="hl-sign">
            <p className="hl-closing hl-ink" style={d(1.7)}>
              Au plaisir de vous accueillir,
            </p>

            <p className="hl-signature hl-ink" style={d(1.9)}>
              {profile.name}
            </p>

            <svg
              className="hl-flourish"
              viewBox="0 0 260 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                pathLength="1"
                d="M4 16 C 38 2, 82 26, 132 11 S 214 18, 256 6"
              />
            </svg>
          </div>

          <div className="hl-foot hl-ink" style={d(2.2)} aria-hidden="true">
            <span />
            PORTFOLIO · 2026
            <span />
          </div>
        </article>
      </div>
    </section>
  );
}
