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
        playsInline
        muted
        loop
        autoPlay
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

  // Changement de projet avec son
  const go = (d: number) => {
    if (n <= 1) return;

    playProjectClick();
    setDir(d);
    setM(0);
    onIndex((index + d + n) % n);
  };

  // Ouverture : bloque le scroll et gère le focus
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

  // Clavier : Échap ferme, flèches changent de projet
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        go(1);
      } else if (e.key === "ArrowLeft") {
        go(-1);
      }
    };

    window.addEventListener("keydown", key);

    return () => window.removeEventListener("keydown", key);
  });

  const slides: Slide[] = p.media?.length
    ? p.media
    : [1, 2, 3].map((i) => ({
        type: "placeholder" as const,
        src: "" as const,
        alt: `Visuel ${i}`,
      }));

  const cur = slides[Math.min(m, slides.length - 1)];

  // Diaporama : visuel précédent / suivant
  const goSlide = (d: number) => {
    if (slides.length <= 1) return;

    playProjectClick();
    setDir(d);
    setM((current) => (current + d + slides.length) % slides.length);
  };

  // Réinitialise le visuel sélectionné quand on change de projet
  useEffect(() => {
    setM(0);
  }, [index]);

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
      {/* Bouton fermer */}
      <button
        ref={closeBtn}
        className="pm-btn pm-x"
        onClick={onClose}
        aria-label="Fermer"
      >
        ✕
      </button>

      {/* Projet précédent */}
      <button
        className="pm-btn pm-arrow l"
        onClick={() => go(-1)}
        aria-label="Projet précédent"
      >
        ←
      </button>

      {/* Projet suivant */}
      <button
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

            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  className="pm-media-arrow pm-media-prev"
                  onClick={() => goSlide(-1)}
                  aria-label="Visuel précédent"
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="pm-media-arrow pm-media-next"
                  onClick={() => goSlide(1)}
                  aria-label="Visuel suivant"
                >
                  ›
                </button>

                <span className="pm-media-count mono">
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
                  key={i}
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

            <span>
              {[p.type, p.kind].filter(Boolean).join(" · ")}
            </span>
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

      {/* Barre de navigation entre les projets */}
      <div className="pm-bar">
        <button
          className="pm-btn"
          onClick={() => go(-1)}
          aria-label="Projet précédent"
        >
          ←
        </button>

        <div className="pm-dots" role="tablist">
          {list.map((q, i) => (
            <button
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