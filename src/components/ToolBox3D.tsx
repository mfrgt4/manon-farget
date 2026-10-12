import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Html, OrbitControls } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import "./ToolBox3D.css";

type Domain = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  tools: string[];
};

const DOMAINS: Domain[] = [
  {
    id: "design",
    title: "Design graphique",
    subtitle: "Créer un univers visuel",
    color: "#e761aa",
    tools: ["Photoshop", "Illustrator", "InDesign"],
  },
  {
    id: "uiux",
    title: "UI/UX design",
    subtitle: "Imaginer des interfaces",
    color: "#b7d6a4",
    tools: ["Maquettes", "Prototypes", "Ergonomie"],
  },
  {
    id: "web",
    title: "Développement web",
    subtitle: "Donner vie aux idées",
    color: "#b9c9ff",
    tools: ["WordPress", "HTML", "CSS", "JavaScript"],
  },
  {
    id: "video",
    title: "Audiovisuel",
    subtitle: "Raconter en images",
    color: "#ffc69b",
    tools: ["Premiere Pro", "After Effects", "Montage vidéo"],
  },
  {
    id: "ai",
    title: "IA & création",
    subtitle: "Explorer de nouvelles possibilités",
    color: "#d7b5ff",
    tools: ["Création assistée par IA", "Expérimentation"],
  },
];

type ShapeProps = ThreeElements["mesh"] & {
  domain: Domain;
  active: boolean;
  onSelect: () => void;
  shape: "sphere" | "box" | "torus" | "octahedron" | "icosahedron";
};

function SkillObject({
  domain,
  active,
  onSelect,
  shape,
  ...props
}: ShapeProps) {
  return (
    <Float
      speed={active ? 2 : 1.2}
      rotationIntensity={0.35}
      floatIntensity={active ? 1 : 0.65}
    >
      <mesh
        {...props}
        scale={active ? 1.2 : 1}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        {shape === "sphere" && <sphereGeometry args={[0.72, 48, 48]} />}
        {shape === "box" && <boxGeometry args={[1.05, 1.05, 1.05]} />}
        {shape === "torus" && <torusGeometry args={[0.62, 0.22, 20, 64]} />}
        {shape === "octahedron" && <octahedronGeometry args={[0.85, 0]} />}
        {shape === "icosahedron" && <icosahedronGeometry args={[0.82, 1]} />}

        <meshStandardMaterial
          color={domain.color}
          roughness={0.24}
          metalness={0.3}
          emissive={domain.color}
          emissiveIntensity={active ? 0.4 : 0.12}
        />

        <Html center distanceFactor={8} position={[0, -1.05, 0]}>
          <button
            className={`tool3d-label ${active ? "is-active" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              onSelect();
            }}
          >
            {domain.title}
          </button>
        </Html>
      </mesh>
    </Float>
  );
}

function WorkshopScene({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const shapes: ShapeProps["shape"][] = [
    "sphere",
    "torus",
    "box",
    "octahedron",
    "icosahedron",
  ];

  const positions: [number, number, number][] = [
    [-2.25, 0.8, 0],
    [0, 1.3, -0.4],
    [2.25, 0.8, 0],
    [-1.25, -1.35, 0.2],
    [1.25, -1.35, 0.2],
  ];

  return (
    <>
      <ambientLight intensity={1.5} />
      <pointLight position={[3, 4, 4]} intensity={35} color="#ffffff" />
      <pointLight position={[-4, -2, 2]} intensity={15} color="#e761aa" />

      <Float speed={0.8} floatIntensity={0.2}>
        <mesh position={[0, 0, -1.5]} scale={1.6}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#ffffff"
            wireframe
            transparent
            opacity={0.08}
          />
        </mesh>
      </Float>

      {DOMAINS.map((domain, index) => (
        <SkillObject
          key={domain.id}
          domain={domain}
          active={activeId === domain.id}
          onSelect={() => onSelect(domain.id)}
          shape={shapes[index]}
          position={positions[index]}
          rotation={[index * 0.3, index * 0.4, 0]}
        />
      ))}

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.8}
        maxPolarAngle={Math.PI / 1.8}
        rotateSpeed={0.4}
      />
    </>
  );
}

export default function ToolBox3D() {
  const [activeId, setActiveId] = useState("design");

  const active = DOMAINS.find((domain) => domain.id === activeId) ?? DOMAINS[0];

  return (
    <section className="toolbox3d" id="boite-a-outils">
      <div className="toolbox3d-heading">
        <p>
          Un mélange de design, de web et d’expérimentation numérique.
          Sélectionne un objet pour explorer mon univers.
        </p>
      </div>

      <div className="toolbox3d-layout">
        <div className="toolbox3d-stage">
          <Canvas
            camera={{ position: [0, 0, 8], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
          >
            <WorkshopScene activeId={activeId} onSelect={setActiveId} />
          </Canvas>
          <span className="toolbox3d-hint">
            CLIQUE SUR UN OBJET POUR EXPLORER
          </span>
        </div>

        <aside className="toolbox3d-panel" key={active.id}>
          <span className="toolbox3d-number" style={{ color: active.color }}>
            DOMAINE / 0{DOMAINS.indexOf(active) + 1}
          </span>

          <h3>{active.title}</h3>
          <p>{active.subtitle}</p>

          <div className="toolbox3d-tags">
            {active.tools.map((tool) => (
              <span key={tool}>{tool}</span>
            ))}
          </div>

          <div
            className="toolbox3d-indicator"
            style={{ background: active.color }}
          />
        </aside>
      </div>

      <div className="toolbox3d-mobile-list">
        {DOMAINS.map((domain) => (
          <button
            key={domain.id}
            className={activeId === domain.id ? "is-active" : ""}
            onClick={() => setActiveId(domain.id)}
          >
            <span style={{ background: domain.color }} />
            {domain.title}
          </button>
        ))}
      </div>
    </section>
  );
}
