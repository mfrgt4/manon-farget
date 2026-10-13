
import {
  useRef,
  useState,
  type PointerEvent,
} from "react";
import "./CDCase.css";

export interface Domain {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  number: string;
  icon: string;
  months: string[];
  tools: string[];
}

const DOMAINS: Domain[] = [
  {
    id: "design",
    title: "Design graphique",
    subtitle: "Créer un univers visuel",
    color: "#e761aa",
    number: "01",
    icon: "/icons/palette_pink.png",
    months: [],
    tools: ["Photoshop", "Illustrator", "InDesign", "Affinity"],
  },
  {
    id: "uiux",
    title: "UI/UX design",
    subtitle: "Imaginer des interfaces",
    color: "#9ab88b",
    number: "02",
    icon: "/icons/mobile_pink.png",
    months: [],
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
    months: [],
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
    months: [],
    tools: ["Premiere Pro", "After Effects"],
  },
];

interface CDCaseProps {
  domains?: Domain[];
  initialDomain?: string;
}

export default function CDCase({
  domains = DOMAINS,
  initialDomain = "design",
}: CDCaseProps) {
  const initialIndex = Math.max(
    0,
    domains.findIndex((domain) => domain.id === initialDomain)
  );

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [opened, setOpened] = useState(false);
  const [rotation, setRotation] = useState({ x: -5, y: -12 });

  const stageRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const rotationStart = useRef({ x: -5, y: -12 });
  const dragging = useRef(false);
  const moved = useRef(false);

  const domain = domains[selectedIndex];

  if (!domain) return null;

  const selectDomain = (index: number) => {
    if (index === selectedIndex) {
      setOpened((current) => !current);
      return;
    }

    setSelectedIndex(index);
    setOpened(true);
    setRotation({ x: -5, y: -12 });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    // Ne pas démarrer le déplacement sur un bouton interactif.
    if ((event.target as HTMLElement).closest("button")) return;

    dragging.current = true;
    moved.current = false;

    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
    };

    rotationStart.current = { ...rotation };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;

    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;

    if (Math.abs(dx) + Math.abs(dy) > 5) {
      moved.current = true;
    }

    if (!moved.current) return;

    setRotation({
      x: Math.max(
        -28,
        Math.min(28, rotationStart.current.x - dy * 0.35)
      ),
      y: rotationStart.current.y + dx * 0.45,
    });
  };

  const handlePointerUp = () => {
    dragging.current = false;
  };

  const handleCaseClick = () => {
    if (moved.current) {
      moved.current = false;
      return;
    }

    setOpened((current) => !current);
  };

  return (
    <section
      className="cd-experience"
      style={{ "--cd-accent": domain.color } as React.CSSProperties}
      aria-label="Boîte à outils interactive"
    >
      <p className="cd-instruction">
        {opened
          ? "Glisse pour explorer · Clique pour refermer"
          : "Clique sur le boîtier pour l’ouvrir · Glisse pour le tourner"}
      </p>

      <div className="cd-stage" ref={stageRef}>
        <div
          className={`cd-model ${opened ? "is-open" : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleCaseClick}
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          }}
        >
          {/* Intérieur du boîtier */}
          <div className="cd-interior">
            {/* Livret d'informations */}
            <div className="cd-booklet">
              <div className="cd-booklet-top">
                <span className="cd-number">{domain.number}</span>
                <span className="cd-edition">MANON FARGET · PORTFOLIO</span>
              </div>

              <div className="cd-booklet-content">
                <img
                  className="cd-domain-icon"
                  src={domain.icon}
                  alt=""
                  draggable={false}
                />

                <p className="cd-eyebrow">MON UNIVERS</p>

                <h2>{domain.title}</h2>

                <p className="cd-subtitle">{domain.subtitle}</p>

                <div className="cd-booklet-rule" />

                <p className="cd-tools-label">OUTILS & COMPÉTENCES</p>

                <div className="cd-tools">
                  {domain.tools.map((tool) => (
                    <span className="cd-tool" key={tool}>
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="cd-booklet-footer">
                <span>CRÉATIVITÉ · TECHNIQUE · IDÉES</span>
                <span>{domain.number} / 04</span>
              </div>
            </div>

            {/* Partie contenant le disque */}
            <div className="cd-disc-panel">
              <div className="cd-plastic-rim" />

              <div className="cd-disc">
                <div className="cd-disc-art">
                  <span className="cd-disc-small">MANON FARGET</span>
                  <span className="cd-disc-title">{domain.title}</span>
                  <span className="cd-disc-number">{domain.number}</span>
                </div>

                <div className="cd-disc-hole">
                  <span />
                </div>
              </div>

              <span className="cd-disc-caption">
                COLLECTION CRÉATIVE
              </span>
            </div>
          </div>

          {/* Face avant qui pivote pour révéler l'intérieur */}
          <button
            type="button"
            className="cd-cover"
            aria-label={
              opened
                ? "Refermer le boîtier"
                : `Ouvrir le CD ${domain.title}`
            }
            aria-expanded={opened}
            onClick={(event) => {
              event.stopPropagation();
              setOpened((current) => !current);
            }}
            style={{ "--cover-accent": domain.color } as React.CSSProperties}
          >
            <span className="cd-cover-gloss" />

            <span className="cd-cover-content">
              <span className="cd-cover-top">
                <span>MF.</span>
                <span>CREATIVE COLLECTION</span>
              </span>

              <span className="cd-cover-art">
                <img
                  src={domain.icon}
                  alt=""
                  draggable={false}
                />
                <span className="cd-cover-orbit" />
              </span>

              <span className="cd-cover-bottom">
                <span className="cd-cover-number">{domain.number}</span>
                <span className="cd-cover-title">{domain.title}</span>
                <span className="cd-cover-subtitle">
                  {domain.subtitle}
                </span>
              </span>
            </span>

            <span className="cd-cover-reflection" />
          </button>
        </div>
      </div>

      {/* Barre de sélection conservée */}
      <div className="cd-selector-wrap">
        <div className="cd-selector">
          <div className="cd-thumbnails" role="group" aria-label="Choisir un domaine">
            {domains.map((item, index) => (
              <button
                type="button"
                className={`cd-thumbnail ${
                  index === selectedIndex ? "is-selected" : ""
                }`}
                key={item.id}
                onClick={() => selectDomain(index)}
                aria-label={`Afficher ${item.title}`}
                aria-pressed={index === selectedIndex}
                style={{ "--thumb-accent": item.color } as React.CSSProperties}
              >
                <span className="cd-thumbnail-disc">
                  <img src={item.icon} alt="" draggable={false} />
                </span>
              </button>
            ))}
          </div>

          <span className="cd-selector-divider" />

          <div className="cd-controls">
            <button
              type="button"
              className={`cd-control cd-control-main ${
                opened ? "is-active" : ""
              }`}
              onClick={() => setOpened((current) => !current)}
              aria-label={opened ? "Fermer le boîtier" : "Ouvrir le boîtier"}
              title={opened ? "Fermer" : "Ouvrir"}
            >
              <span className="cd-control-disc">
                <span />
              </span>
            </button>

            <button
              type="button"
              className="cd-control"
              onClick={() =>
                setRotation((current) => ({
                  x: current.x,
                  y: current.y + 180,
                }))
              }
              aria-label="Retourner le boîtier"
              title="Retourner"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="5" width="16" height="14" rx="2" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 9v6" />
              </svg>
            </button>

            <button
              type="button"
              className="cd-control"
              onClick={() => {
                setSelectedIndex((current) => (current + 1) % domains.length);
                setOpened(true);
                setRotation({ x: -5, y: -12 });
              }}
              aria-label="Domaine suivant"
              title="Domaine suivant"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 5 10 7-10 7z" fill="currentColor" stroke="none" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <p className="cd-current-domain">
        <span className="cd-current-dot" />
        {domain.number} — {domain.title}
      </p>
    </section>
  );
}
