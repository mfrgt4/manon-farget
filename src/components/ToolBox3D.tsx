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

export default function ToolBox3D() {
  const [activeId, setActiveId] = useState("design");

  const active =
    DOMAINS.find((domain) => domain.id === activeId) ?? DOMAINS[0];

  return (
    <section id="boite-a-outils" className="toolbox3d">
      <div className="toolbox3d-heading">
        <span className="toolbox3d-eyebrow">// 03 — MON UNIVERS</span>
        <h2>Y'a quoi dans mes poches ?</h2>
        <span className="toolbox3d-heading-line" />
        <p>Survole les éléments pour découvrir leur contenu.</p>
      </div>

      <div className="toolbox3d-layout">
        {/* À GAUCHE : La page d'infos fixe */}
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
              <img src={active.icon} alt="" aria-hidden="true" />
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
            <span className="toolbox3d-footer-number">
              {active.number} / 04
            </span>
          </div>
        </aside>

        {/* À DROITE : Les 4 icônes et leur nom */}
        <div className="toolbox3d-stage">
          <div className="toolbox3d-grain" />
          <div className="toolbox3d-glow toolbox3d-glow--pink" />
          <div className="toolbox3d-glow toolbox3d-glow--blue" />

          <div className="toolbox3d-pockets-grid">
            {DOMAINS.map((domain) => (
              <button
                key={domain.id}
                type="button"
                className={`toolbox3d-icon ${
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
                  <img src={domain.icon} alt="" aria-hidden="true" />
                </span>

                <span className="toolbox3d-icon-title">{domain.title}</span>
                <span className="toolbox3d-icon-sparkle">✳</span>
              </button>
            ))}
          </div>

          <span className="toolbox3d-hint">
            <span className="toolbox3d-hint-dot" />
            SURVOLE UNE ICÔNE POUR EXPLORER
          </span>
        </div>
      </div>
    </section>
  );
}