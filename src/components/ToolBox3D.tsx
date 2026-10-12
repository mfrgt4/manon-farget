import { useState } from "react";
import "./ToolBox3D.css";

type Domain = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  tools: string[];
  number: string;
  icon: string;
  months: string[];
  positionClass: string;
};

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
    positionClass: "item-design",
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
    positionClass: "item-uiux",
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
    positionClass: "item-web",
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
    positionClass: "item-video",
  },
];

export default function ToolBox3D() {
  const [activeId, setActiveId] = useState("design");

  const active =
    DOMAINS.find((domain) => domain.id === activeId) ?? DOMAINS[0];

  return (
    <section id="boite-a-outils" className="toolbox3d desk-container">
      {/* En-tête style "What's on My Desk" */}
      <div className="desk-header">
        <h2 className="desk-title">What's on My Desk</h2>
        <div className="desk-badge">graphic designer edition</div>
      </div>

      {/* Zone principale avec les éléments dispersés */}
      <div className="toolbox3d-stage desk-stage">
        <div className="toolbox3d-grain" />
        <div className="toolbox3d-glow toolbox3d-glow--pink" />
        <div className="toolbox3d-glow toolbox3d-glow--blue" />
        
        {DOMAINS.map((domain) => (
          <button
            key={domain.id}
            type="button"
            className={`toolbox3d-icon desk-object ${domain.positionClass} ${
              activeId === domain.id ? "is-active" : ""
            }`}
            style={{ "--tool-color": domain.color } as React.CSSProperties}
            aria-label={`Explorer ${domain.title}`}
            aria-pressed={activeId === domain.id}
            onMouseEnter={() => setActiveId(domain.id)}
            onFocus={() => setActiveId(domain.id)}
            onClick={() => setActiveId(domain.id)}
          >
            <span className="toolbox3d-icon-number">({domain.number})</span>

            <span className="toolbox3d-icon-drawing">
              <img src={domain.icon} alt="" aria-hidden="true" />
            </span>

            <span className="toolbox3d-icon-title">{domain.title}</span>
          </button>
        ))}

        <span className="toolbox3d-hint">
          <span className="toolbox3d-hint-dot" />
          SURVOLE UNE ICÔNE POUR EXPLORER
        </span>
      </div>

      {/* Panneau récapitulatif en bas */}
      <aside
        className="toolbox3d-panel desk-panel"
        key={active.id}
        style={{ "--active-color": active.color } as React.CSSProperties}
        aria-live="polite"
      >
        <div className="toolbox3d-panel-top desk-panel-info">
          <span className="toolbox3d-number desk-panel-number">
            DOMAINE / {active.number}
          </span>
          <h3>{active.title}</h3>
          <p className="toolbox3d-panel-subtitle">{active.subtitle}</p>
        </div>

        <div className="desk-panel-tools">
          <span className="toolbox3d-tools-label desk-tools-title">OUTILS & COMPÉTENCES</span>
          <div className="toolbox3d-tags desk-tags">
            {active.tools.map((tool, index) => (
              <span
                key={tool}
                className="desk-tag"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        <div className="toolbox3d-panel-footer" style={{ display: "none" }}>
          <span className="toolbox3d-footer-dot" />
          <span>TOUJOURS EN EXPLORATION</span>
          <span className="toolbox3d-footer-number">
            {active.number} / 04
          </span>
        </div>
      </aside>
    </section>
  );
}