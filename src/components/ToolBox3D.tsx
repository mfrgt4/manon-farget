import { useState } from "react";
import "./ToolBox3D.css";

type Domain = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  tools: string[];
  number: string;
};

const DOMAINS: Domain[] = [
  {
    id: "design",
    title: "Design graphique",
    subtitle: "Créer un univers visuel",
    color: "#e761aa",
    number: "01",
    tools: ["Photoshop", "Illustrator", "InDesign", "Affinity"],
  },
  {
    id: "uiux",
    title: "UI/UX design",
    subtitle: "Imaginer des interfaces",
    color: "#9ab88b",
    number: "02",
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
    tools: ["Premiere Pro", "After Effects"],
  },
];

function DomainIcon({ id }: { id: string }) {
  const common = {
    width: 42,
    height: 42,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (id) {
    case "design":
      return (
        <svg {...common}>
          <path d="M9 34 31 12a5 5 0 0 1 7 7L16 41l-9 2 2-9Z" />
          <path d="m27 16 7 7M9 34l7 7M6 43h36" />
          <path d="m14 29 5 5" />
        </svg>
      );

    case "uiux":
      return (
        <svg {...common}>
          <rect x="8" y="6" width="32" height="36" rx="5" />
          <path d="M8 15h32M14 11h.01M18 11h.01M22 11h.01" />
          <rect x="14" y="21" width="9" height="8" rx="2" />
          <path d="M27 22h7M27 26h7M14 34h20" />
        </svg>
      );

    case "web":
      return (
        <svg {...common}>
          <rect x="5" y="8" width="38" height="31" rx="5" />
          <path d="M5 17h38M12 12.5h.01M16 12.5h.01M20 12.5h.01" />
          <path d="m17 24-5 4 5 4M31 24l5 4-5 4M27 22l-6 12" />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <rect x="5" y="11" width="38" height="26" rx="6" />
          <path d="m20 18 11 6-11 6V18Z" />
          <path d="M12 6h24M12 42h24" />
        </svg>
      );
  }
}

export default function ToolBox3D() {
  const [activeId, setActiveId] = useState("design");

  const active =
    DOMAINS.find((domain) => domain.id === activeId) ?? DOMAINS[0];

  return (
    <section className="toolbox3d">
      <div className="toolbox3d-heading">
        <span className="toolbox3d-eyebrow">// 03 — MON UNIVERS</span>
        <h2>Ma boîte à outils.</h2>
        <span className="toolbox3d-heading-line" />
        <p>Survole les icônes pour explorer mes domaines créatifs.</p>
      </div>

      <div className="toolbox3d-layout">
        <div className="toolbox3d-stage">
          <div className="toolbox3d-grain" />
          <div className="toolbox3d-glow toolbox3d-glow--pink" />
          <div className="toolbox3d-glow toolbox3d-glow--blue" />
          <div className="toolbox3d-orbit toolbox3d-orbit--one" />
          <div className="toolbox3d-orbit toolbox3d-orbit--two" />

          <div className="toolbox3d-center" aria-live="polite">
            <span className="toolbox3d-center-kicker">CRÉER · IMAGINER · RACONTER</span>
            <h3>
              Y'a quoi dans
              <br />
              <span>Ma boîte à outils</span>
            </h3>
            <p>Un peu de technique, beaucoup de créativité.</p>
            <div className="toolbox3d-center-mark">
              <span />
              <span />
              <span />
            </div>
          </div>

          {DOMAINS.map((domain) => (
            <button
              key={domain.id}
              type="button"
              className={`toolbox3d-icon toolbox3d-icon--${domain.id} ${
                activeId === domain.id ? "is-active" : ""
              }`}
              style={{ "--tool-color": domain.color } as React.CSSProperties}
              aria-label={`Explorer ${domain.title}`}
              aria-pressed={activeId === domain.id}
              onMouseEnter={() => setActiveId(domain.id)}
              onFocus={() => setActiveId(domain.id)}
              onClick={() => setActiveId(domain.id)}
            >
              <span className="toolbox3d-icon-number">{domain.number}</span>
              <span className="toolbox3d-icon-drawing">
                <DomainIcon id={domain.id} />
              </span>
              <span className="toolbox3d-icon-title">{domain.title}</span>
              <span className="toolbox3d-icon-sparkle">✳</span>
            </button>
          ))}

          <span className="toolbox3d-hint">
            <span className="toolbox3d-hint-dot" />
            SURVOLE UNE ICÔNE POUR EXPLORER
          </span>
        </div>

        <aside
          className="toolbox3d-panel"
          key={active.id}
          style={{ "--active-color": active.color } as React.CSSProperties}
          aria-live="polite"
        >
          <div className="toolbox3d-panel-top">
            <span className="toolbox3d-number">
              DOMAINE / {active.number}
            </span>
            <span className="toolbox3d-panel-symbol">
              <DomainIcon id={active.id} />
            </span>
          </div>

          <span className="toolbox3d-panel-overline">MON SAVOIR-FAIRE</span>
          <h3>{active.title}</h3>
          <p className="toolbox3d-panel-subtitle">{active.subtitle}</p>

          <div className="toolbox3d-panel-divider" />

          <span className="toolbox3d-tools-label">OUTILS & COMPÉTENCES</span>
          <div className="toolbox3d-tags">
            {active.tools.map((tool, index) => (
              <span
                key={tool}
                style={{ animationDelay: `${index * 45}ms` }}
              >
                {tool}
              </span>
            ))}
          </div>

          <div className="toolbox3d-panel-footer">
            <span className="toolbox3d-footer-dot" />
            <span>TOUJOURS EN EXPLORATION</span>
            <span className="toolbox3d-footer-number">{active.number} / 04</span>
          </div>
        </aside>
      </div>
    </section>
  );
}