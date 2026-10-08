import { CSSProperties, useEffect, useRef, useState } from "react";
import { projectUrl } from "./data";
import type { Media, Project } from "./data";

type Slide = Media | {
  type: "placeholder";
  src: "";
  alt: string;
};

const LABEL = {
  universitaire: "Projet universitaire",
  perso: "Projet personnel",
} as const;

function View({
  s,
  p,
}: {
  s: Slide;
  p: Project;
}) {
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
        autoPlay
        ref={(el) => {
          if (el) el.volume = 0.3;
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
  const slideX = useRef(0);

  const [sdir, setSdir] = useState(1);

  const go = (d: number) => {
    setDir(d);
    setM(0);
    onIndex((index + d + n) % n);
  };

  useEffect(() => {
    const prev =
      document.activeElement as HTMLElement | null;

    const ov = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeBtn.current?.focus();

    return () => {
      document.body.style.overflow = ov;
      prev?.focus();
    };
  }, []);

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

    addEventListener("keydown", key);

    return () => {
      removeEventListener("keydown", key);
    };
  });

  const details = [
    p.type,
    p.kind,
  ].filter(
    (x): x is string =>
      !!x &&
      x !== "Projet perso" &&
      x !== "Projet universitaire"
  );

  const slides: Slide[] = p.media?.length
    ? p.media
    : [1, 2, 3].map((i) => ({
        type: "placeholder" as const,
        src: "" as const,
        alt: `Visuel ${i}`,
      }));

  const cur =
    slides[Math.min(m, slides.length - 1)];

  const goSlide = (d: number) => {
    setSdir(d);
    setM(
      (m + d + slides.length) %
        slides.length
    );
  };

  return (
    <div
      className="pm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pm-title"
      onClick={(e) =>
        e.target === e.currentTarget &&
        onClose()
      }
      onTouchStart={(e) => {
        touchX.current =
          e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const dx =
          e.changedTouches[0].clientX -
          touchX.current;

        if (Math.abs(dx) > 70) {
          go(dx < 0 ? 1 : -1);
        }
      }}
    >
      <button
        ref={closeBtn}
        className="pm-btn pm-x"
        onClick={onClose}
        aria-label="Fermer"
      >
        ✕
      </button>

      {/* Navigation projet desktop */}
      <button
        className="pm-btn pm-arrow l"
        onClick={() => go(-1)}
        aria-label="Projet précédent"
      >
        ←
      </button>

      <button
        className="pm-btn pm-arrow r"
        onClick={() => go(1)}
        aria-label="Projet suivant"
      >
        →
      </button>

      <div
        className="pm-wrap"
        style={
          {
            "--dx": `${dir * 40}px`,
          } as CSSProperties
        }
      >
        <div
          className="pm-slide"
          key={p.title + "m"}
        >
          <div
            className="pm-view"
            style={
              {
                "--sdx": `${sdir * 50}px`,
              } as CSSProperties
            }
            onTouchStart={(e) => {
              e.stopPropagation();

              slideX.current =
                e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();

              const dx =
                e.changedTouches[0].clientX -
                slideX.current;

              if (
                Math.abs(dx) > 50 &&
                slides.length > 1
              ) {
                goSlide(
                  dx < 0 ? 1 : -1
                );
              }
            }}
          >
            <View
              key={m}
              s={cur}
              p={p}
            />

            {slides.length > 1 && (
              <>
                <button
                  className="pm-sarrow l"
                  onClick={() =>
                    goSlide(-1)
                  }
                  aria-label="Image précédente"
                >
                  ‹
                </button>

                <button
                  className="pm-sarrow r"
                  onClick={() =>
                    goSlide(1)
                  }
                  aria-label="Image suivante"
                >
                  ›
                </button>

                <span className="pm-scount mono">
                  {Math.min(
                    m,
                    slides.length - 1
                  ) + 1}{" "}
                  / {slides.length}
                </span>
              </>
            )}
          </div>

          <div className="pm-thumbs">
            {slides.map((s, i) => (
              <button
                key={i}
                className={
                  i === m ? "on" : ""
                }
                onClick={() => {
                  setSdir(
                    i > m ? 1 : -1
                  );
                  setM(i);
                }}
                aria-label={`Voir le visuel ${
                  i + 1
                }`}
              >
                {s.type === "image" ? (
                  <img
                    src={s.src}
                    alt=""
                  />
                ) : s.type === "video" ? (
                  s.poster ? (
                    <img
                      src={s.poster}
                      alt=""
                    />
                  ) : (
                    "▶"
                  )
                ) : (
                  p.icon
                )}
              </button>
            ))}
          </div>
        </div>

        <div
          className="pm-info pm-slide"
          key={p.title + "i"}
        >
          <div className="pm-cat">
            <span className="mono pm-k">
              {LABEL[p.category]}
            </span>

            {details.length > 0 && (
              <span>
                {details.join(" · ")}
              </span>
            )}
          </div>

          <h2 id="pm-title">
            {p.title}
          </h2>

          <p className="pm-pitch">
            {p.pitch ?? p.text}
          </p>

          <h3 className="mono pm-h">
            Outils utilisés
          </h3>

          <div className="chips">
            {p.stack.map((c) => (
              <i
                key={c}
                className="mono"
              >
                {c}
              </i>
            ))}
          </div>

          <div className="pm-links">
            {projectUrl(p) && (
              <a
                className="btn p"
                href={projectUrl(p)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {p.linkLabel ??
                  "Voir le site"}{" "}
                ↗
              </a>
            )}

            {p.link2 && (
              <a
                className="btn p"
                href={p.link2}
                target="_blank"
                rel="noopener noreferrer"
              >
                {p.linkLabel2 ??
                  "Voir mon TikTok"}{" "}
                ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navigation mobile */}
      <div className="pm-bar">
        <button
          className="pm-mobile-project"
          onClick={() => go(-1)}
          aria-label="Projet précédent"
        >
          ←
        </button>

        <div
          className="pm-dots"
          role="tablist"
        >
          {list.map((q, i) => (
            <button
              key={q.title}
              className={
                i === index ? "on" : ""
              }
              aria-label={q.title}
              aria-selected={
                i === index
              }
              onClick={() => {
                setDir(
                  i > index ? 1 : -1
                );
                setM(0);
                onIndex(i);
              }}
            />
          ))}
        </div>

        <span className="mono pm-count">
          {String(index + 1).padStart(
            2,
            "0"
          )}{" "}
          /{" "}
          {String(n).padStart(2, "0")}
        </span>

        <button
          className="pm-mobile-project"
          onClick={() => go(1)}
          aria-label="Projet suivant"
        >
          →
        </button>
      </div>
    </div>
  );
}
