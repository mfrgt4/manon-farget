import { CSSProperties, useEffect, useRef, useState } from "react";
import type { Media, Project } from "./data";

type Slide = Media | { type: "placeholder"; src: ""; alt: string };

const LABEL = {
  universitaire: "Projet universitaire",
  perso: "Projet personnel",
} as const;

// Son lors du changement de projet ou de visuel
const projectSound = new Audio("/sounds/Click-buttons.mp3");
projectSound.volume = 0.08;

function playProjectClick() {
  projectSound.currentTime = 0;
  projectSound.play().catch(() => {});
}

function View({ s, p }: { s: Slide; p: Project }) {
  const [broken, setBroken] = useState(false);

  if (s.type === "image" && !broken) {
    return (
      <img
        src={s.src}
        alt={s.alt}
        onError={() => setBroken(true)}
      />
    );
  }

if (s.type === "video") {
  return (
    <video
      src={s.src}
      poster={s.poster}
      controls
      autoPlay
      ref={(video) => {
        if (video) video.volume = 0.15;
      }}
    />
  );
}

  const label =
    s.type === "image"
      ? `Image introuvable : ${s.src}`
      : `${s.alt} · à remplacer`;

  return (
    <div
      className="ph"
      style={{ "--c": p.color } as CSSProperties}
    >
      <span>{p.icon}</span>
      <small className="mono">{label}</small>
    </div>
  );
}

type Props = {
  list: Project[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
};

export default function ProjectModal({
  list,
  index,
  onIndex,
  onClose,
}: Props) {
  const p = list[index];
  const n = list.length;

  const [m, setM] = useState(0);
  const [dir, setDir] = useState(1);

  const closeBtn = useRef<HTMLButtonElement>(null);
  const touchX = useRef(0);
  const slideTouchX = useRef(0);

  // Changement de projet
  const go = (d: number) => {
    if (n <= 1) return;

    playProjectClick();
    setDir(d);
    setM(0);
    onIndex((index + d + n) % n);
  };

  // Bloque le scroll lorsque la fenêtre est ouverte
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      prev?.focus();
    };
  }, []);

  // Navigation au clavier
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      // Ne pas intercepter les flèches pendant la saisie dans un champ
      const target = e.target as HTMLElement | null;
      const isEditing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (e.key === "Escape") {
        onClose();
      } else if (!isEditing && e.key === "ArrowRight") {
        go(1);
      } else if (!isEditing && e.key === "ArrowLeft") {
        go(-1);
      }
    };

    window.addEventListener("keydown", key);

    return () => window.removeEventListener("keydown", key);
  });

  // Visuels du projet
  const slides: Slide[] = p.media?.length
    ? p.media
    : [1, 2, 3].map((i) => ({
        type: "placeholder" as const,
        src: "" as const,
        alt: `Visuel ${i}`,
      }));

  const cur = slides[Math.min(m, slides.length - 1)];

  // Changement d'image ou de vidéo
  const goSlide = (d: number) => {
    if (slides.length <= 1) return;

    playProjectClick();
    setDir(d);
    setM((current) => (current + d + slides.length) % slides.length);
  };

  // Remet le diaporama au début lors d'un changement de projet
  useEffect(() => {
    setM(0);
  }, [index]);

  if (!p) return null;

  return (
    <div
      className="pm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pm-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchX.current;

        if (Math.abs(dx) > 70) {
          go(dx < 0 ? 1 : -1);
        }
      }}
    >
      {/* Fermer la fenêtre */}
      <button
        ref={closeBtn}
        type="button"
        className="pm-btn pm-x"
        onClick={onClose}
        aria-label="Fermer"
      >
        ✕
      </button>

      {/* Projet précédent */}
      <button
        type="button"
        className="pm-btn pm-arrow l"
        onClick={() => go(-1)}
        aria-label="Projet précédent"
      >
        ←
      </button>

      {/* Projet suivant */}
      <button
        type="button"
        className="pm-btn pm-arrow r"
        onClick={() => go(1)}
        aria-label="Projet suivant"
      >
        →
      </button>

      <div
        className="pm-wrap"
        style={{ "--dx": `${dir * 40}px` } as CSSProperties}
      >
        {/* Visuels du projet */}
        <div className="pm-slide" key={p.title + "-media"}>
          <div
            className="pm-view"
            onTouchStart={(e) => {
              slideTouchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const dx =
                e.changedTouches[0].clientX - slideTouchX.current;

              if (Math.abs(dx) > 50) {
                goSlide(dx < 0 ? 1 : -1);
              }
            }}
          >
            <View key={`${p.title}-${m}`} s={cur} p={p} />

            {/* Flèches du diaporama */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  className="pm-sarrow l"
                  onClick={() => goSlide(-1)}
                  aria-label="Visuel précédent"
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="pm-sarrow r"
                  onClick={() => goSlide(1)}
                  aria-label="Visuel suivant"
                >
                  ›
                </button>

                {/* Compteur des visuels */}
                <span className="pm-scount mono">
                  {String(m + 1).padStart(2, "0")} /{" "}
                  {String(slides.length).padStart(2, "0")}
                </span>
              </>
            )}
          </div>

          {/* Miniatures */}
          {slides.length > 1 && (
            <div className="pm-thumbs">
              {slides.map((s, i) => (
                <button
                  type="button"
                  key={`${p.title}-thumb-${i}`}
                  className={i === m ? "on" : ""}
                  onClick={() => {
                    if (i !== m) {
                      playProjectClick();
                      setDir(i > m ? 1 : -1);
                      setM(i);
                    }
                  }}
                  aria-label={`Voir le visuel ${i + 1}`}
                  aria-pressed={i === m}
                >
                  {s.type === "image" ? (
                    <img src={s.src} alt="" />
                  ) : s.type === "video" ? (
                    s.poster ? (
                      <img src={s.poster} alt="" />
                    ) : (
                      <span aria-hidden="true">▶</span>
                    )
                  ) : (
                    <span>{p.icon}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informations du projet */}
        <div className="pm-info pm-slide" key={p.title + "-info"}>
            <div className="pm-cat">
              <span className="mono pm-k">{LABEL[p.category]}</span>
            </div>

          <h2 id="pm-title">{p.title}</h2>

          <p className="pm-pitch">{p.pitch ?? p.text}</p>

          <h3 className="mono pm-h">Outils utilisés</h3>

          <div className="chips">
            {p.stack.map((c) => (
              <i key={c} className="mono">
                {c}
              </i>
            ))}
          </div>

          {p.href !== "#" && (
            <a
              className="btn p"
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              Voir le projet ↗
            </a>
          )}
        </div>
      </div>

      {/* Navigation entre les projets */}
      <div className="pm-bar">
        <button
          type="button"
          className="pm-btn"
          onClick={() => go(-1)}
          aria-label="Projet précédent"
        >
          ←
        </button>

        <div className="pm-dots" role="tablist" aria-label="Choisir un projet">
          {list.map((q, i) => (
            <button
              type="button"
              key={q.title}
              className={i === index ? "on" : ""}
              aria-label={q.title}
              aria-selected={i === index}
              role="tab"
              onClick={() => {
                if (i !== index) {
                  playProjectClick();
                  setDir(i > index ? 1 : -1);
                  setM(0);
                  onIndex(i);
                }
              }}
            />
          ))}
        </div>

        <span className="mono pm-count">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(n).padStart(2, "0")}
        </span>

        <button
          type="button"
          className="pm-btn"
          onClick={() => go(1)}
          aria-label="Projet suivant"
        >
          →
        </button>
      </div>
    </div>
  );
}