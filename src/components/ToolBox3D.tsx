
import { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import type { Group } from "three";
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

type Shape = "sphere" | "box" | "torus" | "octahedron" | "icosahedron";

type SkillObjectProps = ThreeElements["group"] & {
  domain: Domain;
  active: boolean;
  index: number;
  shape: Shape;
  onSelect: () => void;
};

function SkillObject({
  domain,
  active,
  index,
  shape,
  onSelect,
  ...props
}: SkillObjectProps) {
  const group = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { pointer } = useThree();

  useFrame((state, delta) => {
    if (!group.current) return;

    const t = state.clock.elapsedTime;
    const influence = hovered ? 0.28 : 0.1;

    // Inclinaison progressive selon la position de la souris.
    const targetX = -pointer.y * influence;
    const targetY = pointer.x * influence;

    group.current.rotation.x +=
      (targetX - group.current.rotation.x) * Math.min(delta * 3, 1);

    group.current.rotation.y +=
      (targetY + Math.sin(t * 0.45 + index) * 0.08 -
        group.current.rotation.y) *
      Math.min(delta * 3, 1);

    const targetScale = hovered ? 1.23 : active ? 1.12 : 1;
    const currentScale = group.current.scale.x;
    const nextScale =
      currentScale + (targetScale - currentScale) * Math.min(delta * 7, 1);

    group.current.scale.setScalar(nextScale);
  });

  return (
    <group {...props}>
      <Float
        speed={1.1 + index * 0.16}
        rotationIntensity={0.12}
        floatIntensity={0.45 + index * 0.06}
      >
        <group
          ref={group}
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
        >
          {/* Halo lumineux derrière l'objet */}
          <mesh position={[0, 0, -0.13]} scale={hovered ? 1.3 : active ? 1.15 : 1}>
            {shape === "sphere" && <sphereGeometry args={[0.82, 32, 32]} />}
            {shape === "box" && <boxGeometry args={[1.3, 1.3, 1.3]} />}
            {shape === "torus" && <torusGeometry args={[0.72, 0.27, 16, 48]} />}
            {shape === "octahedron" && <octahedronGeometry args={[0.98, 0]} />}
            {shape === "icosahedron" && <icosahedronGeometry args={[0.95, 1]} />}
            <meshBasicMaterial
              color={domain.color}
              transparent
              opacity={hovered ? 0.25 : active ? 0.17 : 0.07}
            />
          </mesh>

          <pointLight
            color={domain.color}
            intensity={hovered ? 5 : active ? 2.8 : 0.7}
            distance={hovered ? 4 : 2.8}
          />

          <mesh>
            {shape === "sphere" && <sphereGeometry args={[0.72, 48, 48]} />}
            {shape === "box" && <boxGeometry args={[1.05, 1.05, 1.05]} />}
            {shape === "torus" && <torusGeometry args={[0.62, 0.22, 20, 64]} />}
            {shape === "octahedron" && <octahedronGeometry args={[0.85, 0]} />}
            {shape === "icosahedron" && <icosahedronGeometry args={[0.82, 1]} />}

            <meshPhysicalMaterial
              color={domain.color}
              roughness={hovered ? 0.13 : 0.25}
              metalness={0.25}
              clearcoat={1}
              clearcoatRoughness={0.15}
              emissive={domain.color}
              emissiveIntensity={hovered ? 0.65 : active ? 0.35 : 0.12}
            />
          </mesh>

          <Html
            center
            distanceFactor={8}
            position={[0, -1.12, 0]}
            zIndexRange={[20, 0]}
          >
            <button
              className={`tool3d-label ${active ? "is-active" : ""} ${
                hovered ? "is-hovered" : ""
              }`}
              style={{ "--tool-color": domain.color } as React.CSSProperties}
              onClick={(event) => {
                event.stopPropagation();
                onSelect();
              }}
              onPointerOver={() => {
                setHovered(true);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                setHovered(false);
                document.body.style.cursor = "auto";
              }}
            >
              {domain.title}
            </button>
          </Html>
        </group>
      </Float>
    </group>
  );
}

function WorkshopScene({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const shapes: Shape[] = [
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

  const { pointer } = useThree();
  const scene = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!scene.current) return;

    scene.current.rotation.y +=
      (pointer.x * 0.035 - scene.current.rotation.y) *
      Math.min(delta * 2, 1);

    scene.current.rotation.x +=
      (-pointer.y * 0.025 - scene.current.rotation.x) *
      Math.min(delta * 2, 1);
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <hemisphereLight args={["#fff1fb", "#252039", 1.3]} />
      <pointLight position={[3, 4, 4]} intensity={24} color="#ffffff" />
      <pointLight position={[-4, -2, 2]} intensity={12} color="#e761aa" />
      <pointLight position={[0, 3, -2]} intensity={8} color="#b9c9ff" />

      <group ref={scene}>
        <Float speed={0.7} floatIntensity={0.16} rotationIntensity={0.08}>
          <mesh position={[0, 0, -1.6]} scale={1.8}>
            <icosahedronGeometry args={[1, 1]} />
            <meshBasicMaterial
              color="#e761aa"
              wireframe
              transparent
              opacity={0.1}
            />
          </mesh>
        </Float>

        {DOMAINS.map((domain, index) => (
          <SkillObject
            key={domain.id}
            domain={domain}
            active={activeId === domain.id}
            index={index}
            shape={shapes[index]}
            position={positions[index]}
            rotation={[index * 0.3, index * 0.4, 0]}
            onSelect={() => onSelect(domain.id)}
          />
        ))}
      </group>
    </>
  );
}

export default function ToolBox3D() {
  const [activeId, setActiveId] = useState("design");
  const active = DOMAINS.find((domain) => domain.id === activeId) ?? DOMAINS[0];

  return (
    <div className="toolbox3d">
      <div className="toolbox3d-heading">
        <p>
          Un mélange de design, de web et d’expérimentation numérique.
          Sélectionne un objet pour explorer mon univers.
        </p>
      </div>

      <div className="toolbox3d-layout">
        <div className="toolbox3d-stage">
          <div className="toolbox3d-orb toolbox3d-orb--one" />
          <div className="toolbox3d-orb toolbox3d-orb--two" />

          <Canvas
            camera={{ position: [0, 0, 8], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
          >
            <WorkshopScene activeId={activeId} onSelect={setActiveId} />
          </Canvas>

          <span className="toolbox3d-hint">
            <span className="toolbox3d-hint-dot" />
            CLIQUE SUR UN OBJET POUR EXPLORER
          </span>
        </div>

        <aside
          className="toolbox3d-panel"
          key={active.id}
          style={{ "--active-color": active.color } as React.CSSProperties}
        >
          <span className="toolbox3d-number" style={{ color: active.color }}>
            DOMAINE / 0{DOMAINS.indexOf(active) + 1}
          </span>

          <h3>{active.title}</h3>
          <p>{active.subtitle}</p>

          <div className="toolbox3d-tags">
            {active.tools.map((tool, index) => (
              <span key={tool} style={{ animationDelay: `${index * 70}ms` }}>
                {tool}
              </span>
            ))}
          </div>

          <div className="toolbox3d-indicator" />
        </aside>
      </div>

      <div className="toolbox3d-mobile-list">
        {DOMAINS.map((domain) => (
          <button
            key={domain.id}
            className={activeId === domain.id ? "is-active" : ""}
            style={{ "--tool-color": domain.color } as React.CSSProperties}
            onClick={() => setActiveId(domain.id)}
          >
            <span />
            {domain.title}
          </button>
        ))}
      </div>
    </div>
  );
}