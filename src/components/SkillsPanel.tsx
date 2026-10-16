import "./SkillsPanel.css";

type Domain = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  number: string;
  icon: string;
  tools: string[];
};

const DOMAINS: Domain[] = [
  {
    id: "design",
    title: "Design graphique",
    subtitle: "Créer un univers visuel",
    color: "#e761aa",
    number: "01",
    icon: "/icons/palette_pink.png",
    tools: ["Photoshop", "Illustrator", "InDesign", "Affinity"],
  },
  {
    id: "uiux",
    title: "UI/UX design",
    subtitle: "Imaginer des interfaces",
    color: "#9ab88b",
    number: "02",
    icon: "/icons/mobile_pink.png",
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
    tools: ["Premiere Pro", "After Effects"],
  },
];

export default function SkillsPanel() {
  return (
    <div className="skills-panel">
      <div className="skills-panel-heading">
        <div>
          <span className="skills-panel-kicker mono">
            // MES DOMAINES
          </span>
        </div>

        <span className="skills-panel-count mono">
          04 DOMAINES
        </span>
      </div>

      <div className="skills-domains">
        {DOMAINS.map((domain) => (
          <article
            className="skills-domain"
            key={domain.id}
            style={{ "--skill-color": domain.color } as React.CSSProperties}
          >
            <div className="skills-domain-header">
              <span className="skills-domain-number mono">
                {domain.number}
              </span>

              <div className="skills-domain-icon">
                <img src={domain.icon} alt="" aria-hidden="true" />
              </div>

              <div className="skills-domain-title">
                <h4>{domain.title}</h4>
                <p>{domain.subtitle}</p>
              </div>

              <span className="skills-domain-arrow" aria-hidden="true">
                ↗
              </span>
            </div>

            <div className="skills-tags" aria-label={`Compétences : ${domain.title}`}>
              {domain.tools.map((tool, index) => (
                <span
                  className="skills-tag"
                  key={tool}
                  style={{ "--tag-index": index } as React.CSSProperties}
                >
                  <span className="skills-tag-dot" aria-hidden="true" />
                  {tool}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <p className="skills-panel-footer mono">
        <span className="skills-footer-dot" />
        CRÉATIVITÉ · CONCEPTION · TECHNIQUE
      </p>
    </div>
  );
}