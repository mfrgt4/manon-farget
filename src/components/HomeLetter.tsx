import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { profile } from "../data";
import "./HomeLetter.css";

const ENVELOPE_SRC = `${import.meta.env.BASE_URL}images/enveloppe.png`;

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

const d = (seconds: number) => ({ "--hl-d": `${seconds}s` }) as CSSProperties;

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

      <circle cx="260" cy="196" r="34" fill="#b72d60" />

      <circle
        cx="260"
        cy="196"
        r="27"
        fill="none"
        stroke="rgba(255,255,255,.55)"
        strokeWidth="1.5"
      />

      <text
        x="260"
        y="210"
        textAnchor="middle"
        fontSize="38"
        fill="#fff"
        fontStyle="italic"
        fontFamily="'Cormorant Garamond',Georgia,serif"
      >
        {profile.name.charAt(0)}
      </text>
    </svg>
  );
}

export default function HomeLetter() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const [state, setState] = useState<"closed" | "opening" | "open">("closed");

  const [imgFailed, setImgFailed] = useState(false);

  const initials = profile.name
    .split(" ")
    .map((word) => word[0])
    .join("");

  const openEnvelope = () => {
    if (state !== "closed") return;

    const section = sectionRef.current;
    const stage = stageRef.current;

    if (section && stage) {
      const cs = getComputedStyle(section);

      const pt = parseFloat(cs.paddingTop) || 0;
      const pb = parseFloat(cs.paddingBottom) || 0;
      const h = stage.offsetHeight;

      const finalHeight = Math.max(window.innerHeight, h + pt + pb);

      const finalTop = pt + (finalHeight - pt - pb - h) / 2;

      const fy = window.innerHeight / 2 - (finalTop + h / 2);

      section.style.setProperty("--hl-fy", `${fy.toFixed(1)}px`);
    }

    setState("opening");

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    timerRef.current = window.setTimeout(
      () => setState("open"),
      reduce ? 0 : 3800,
    );
  };

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  const handleCardMouseMove = (event: MouseEvent<HTMLElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - y) * 16;
    const rotateY = (x - 0.5) * 20;

    card.style.setProperty("--card-rotate-x", `${rotateX}deg`);
    card.style.setProperty("--card-rotate-y", `${rotateY}deg`);
  };

  const handleCardMouseLeave = (event: MouseEvent<HTMLElement>) => {
    const card = event.currentTarget;

    card.style.setProperty("--card-rotate-x", "0deg");
    card.style.setProperty("--card-rotate-y", "0deg");
  };

  return (
    <section
      id="accueil"
      className="hl"
      data-state={state}
      ref={sectionRef}
      aria-label="Présentation de Manon"
    >
      {/* Décor d'arrière-plan */}
      <div className="hl-backdrop" aria-hidden="true">
        <div className="hl-orb hl-orb--a" />
        <div className="hl-orb hl-orb--b" />
      </div>

      {/* Enveloppe */}
      {state !== "open" && (
        <div className="hl-envelope-wrap">
          <button
            type="button"
            className="hl-envelope"
            onClick={openEnvelope}
            aria-label="Ouvrir l'enveloppe pour découvrir ma carte d'identité"
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

            {/* Étincelles */}
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
            Découvrer ma carte…
            <strong>Appuyez sur l'enveloppe</strong>
          </p>
        </div>
      )}

      {/* =================================================
          CARTE D'IDENTITÉ
      ================================================= */}

      <div className="hl-stage" ref={stageRef}>
        <article
          className="hl-card hl-idcard"
          aria-labelledby="hl-title"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          {/* Décoration des coins */}
          <span className="hl-idcard-corner hl-idcard-corner--tl" />
          <span className="hl-idcard-corner hl-idcard-corner--tr" />
          <span className="hl-idcard-corner hl-idcard-corner--bl" />
          <span className="hl-idcard-corner hl-idcard-corner--br" />

          {/* En-tête */}
          <header className="hl-idcard-header" style={d(0.1)}>
            <div className="hl-idcard-school">
            </div>

            <div className="hl-idcard-number">
              <span>IDENTIFIANT</span>
              <strong>MF · 2026</strong>
            </div>
          </header>

          {/* Informations principales */}
          <div className="hl-idcard-content">
            {/* Portrait */}
            <div className="hl-idcard-photo-column" style={d(0.25)}>
              <div className="hl-idcard-photo-frame">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={`Portrait de ${profile.name}`}
                  />
                ) : (
                  <div className="hl-idcard-placeholder">{initials}</div>
                )}
              </div>

              <span className="hl-idcard-photo-caption">PORTRAIT</span>
            </div>

            {/* Identité et présentation */}
            <div className="hl-idcard-info">
              <span className="hl-idcard-label" style={d(0.3)}>
                IDENTITÉ
              </span>

              <h1 id="hl-title" style={d(0.4)}>
                {profile.name}
              </h1>

              <div className="hl-idcard-field" style={d(0.5)}>
                <span>FORMATION</span>
                <strong>BUT MMI · 2e année</strong>
              </div>

              <div className="hl-idcard-field" style={d(0.6)}>
                <span>PARCOURS</span>
                <strong>Création Numérique</strong>
              </div>

              <div className="hl-idcard-field" style={d(0.7)}>
                <span>DOMAINES</span>
                <strong>Design graphique · UI/UX · Audiovisuel</strong>
              </div>

              <p className="hl-idcard-description" style={d(0.8)}>
                J'aime explorer les univers visuels, imaginer des interfaces et
                donner vie à mes idées. Je réalise également des projets
                personnels en design graphique et montage vidéo pour développer
                ma créativité.
              </p>
            </div>
          </div>

          {/* Pied de carte */}
          <footer className="hl-idcard-footer" style={d(0.95)}>
            <div className="hl-idcard-availability">
              <span className="hl-idcard-status" />
              <span>LYON</span>
              <span className="hl-idcard-separator">·</span>
              <span>BUT MMI</span>
              <span className="hl-idcard-separator">·</span>
              <strong>STAGE AVRIL 2027</strong>
            </div>

            <div className="hl-idcard-actions">
              <a href="#projets">Mes projets ↗</a>

              <a href="#contact">Contact ↗</a>
            </div>
          </footer>
        </article>
      </div>
    </section>
  );
}
