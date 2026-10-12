import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Html, Environment } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { CatmullRomCurve3, Vector3, type Group } from "three";
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
    color: "#9ab88b",
    tools: ["Maquettes", "Prototypes", "Ergonomie"],
  },
  {
    id: "web",
    title: "Développement web",
    subtitle: "Donner vie aux idées",
    color: "#829cf4",
    tools: ["WordPress", "HTML", "CSS", "JavaScript"],
  },
  {
    id: "video",
    title: "Audiovisuel",
    subtitle: "Raconter en images",
    color: "#efaa82",
    tools: ["Premiere Pro", "After Effects", "Montage vidéo"],
  },
  {
    id: "ai",
    title: "IA & création",
    subtitle: "Explorer de nouvelles possibilités",
    color: "#b68be9",
    tools: ["Création assistée par IA", "Expérimentation"],
  },
];

type SkillObjectProps = ThreeElements["group"] & {
  domain: Domain;
  active: boolean;
  index: number;
  onSelect: () => void;
};

function createHeartCurve() {
  const points: Vector3[] = [];
  const segments = 160;

  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;

    const x = (16 * Math.pow(Math.sin(t), 3)) / 17;
    const y =
      (13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)) /
      17;

    // Profondeur alternée pour donner du relief au cœur.
    const z = Math.sin(t * 2) * 0.12;

    points.push(new Vector3(x, y, z));
  }

  return new CatmullRomCurve3(points, true, "centripetal", 0.5);
}

function HeartOutline({
  domain,
  active,
  index,
  onSelect,
  ...props
}: SkillObjectProps) {
  const group = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { pointer } = useThree();

  const curve = useMemo(() => createHeartCurve(), []);

  useFrame((state, delta) => {
    if (!group.current) return;

    const time = state.clock.elapsedTime;
    const influence = hovered ? 0.32 : 0.12;

    const targetX = -pointer.y * influence;
    const targetY =
      pointer.x * influence + Math.sin(time * 0.55 + index) * 0.08;

    group.current.rotation.x +=
      (targetX - group.current.rotation.x) * Math.min(delta * 3, 1);

    group.current.rotation.y +=
      (targetY - group.current.rotation.y) * Math.min(delta * 3, 1);

    const targetScale = hovered ? 1.35 : active ? 1.5 : 1;
    const nextScale =
      group.current.scale.x +
      (targetScale - group.current.scale.x) * Math.min(delta * 10, 1);

    group.current.scale.setScalar(nextScale);
  });

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  return (
    <group {...props}>
      <Float
        speed={1.1 + index * 0.16}
        rotationIntensity={0.1}
        floatIntensity={0.35 + index * 0.05}
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
          onPointerOut={handlePointerOut}
        >
          {/* Halo doux derrière le cœur */}
          <mesh
            position={[0, 0, -0.16]}
            scale={hovered ? 1.35 : active ? 1.2 : 1.08}
          >
            <sphereGeometry args={[0.72, 32, 32]} />
            <meshBasicMaterial
              color={domain.color}
              transparent
              opacity={hovered ? 0.12 : active ? 0.07 : 0.035}
              depthWrite={false}
            />
          </mesh>

          {/* Lueur large autour du contour */}
          <mesh>
            <tubeGeometry args={[curve, 160, 0.09, 12, true]} />
            <meshBasicMaterial
              color={domain.color}
              transparent
              opacity={hovered ? 0.2 : active ? 0.12 : 0.055}
              depthWrite={false}
            />
          </mesh>

          {/* Corps en verre transparent */}
          <mesh>
            <tubeGeometry args={[curve, 160, 0.052, 16, true]} />
            <meshPhysicalMaterial
              color={domain.color}
              roughness={0.08}
              metalness={0.05}
              transmission={0.85}
              thickness={0.7}
              ior={1.45}
              clearcoat={1}
              clearcoatRoughness={0.05}
              emissive={domain.color}
              emissiveIntensity={active ? 0.35 : 0.12}
              transparent
              opacity={0.95}
            />
          </mesh>

          {/* Reflet blanc pour accentuer l'effet verre */}
          <mesh>
            <tubeGeometry args={[curve, 160, 0.012, 8, true]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={hovered ? 0.95 : active ? 0.75 : 0.5}
              depthWrite={false}
            />
          </mesh>

          {/* Lumière colorée locale */}
          <pointLight
            color={domain.color}
            intensity={hovered ? 3 : active ? 1.6 : 0.45}
            distance={hovered ? 3.5 : 2.5}
          />

          {/* Étiquette du domaine */}
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
              onPointerOut={handlePointerOut}
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
  const { pointer } = useThree();
  const scene = useRef<Group>(null);

  const positions: [number, number, number][] = [
    [-3.0, 1.35, 0], // Design graphique : haut gauche
    [2.1, 1.35, -0.4], // UI/UX : haut droite
    [-0.15, 0.0, 0.2], // Développement web : centre
    [-2.45, -1.65, 0.1], // Audiovisuel : bas gauche
    [2.2, -1.65, 0.2], // IA : bas droite
  ];

  useFrame((_, delta) => {
    if (!scene.current) return;

    scene.current.rotation.y +=
      (pointer.x * 0.035 - scene.current.rotation.y) * Math.min(delta * 2, 1);

    scene.current.rotation.x +=
      (-pointer.y * 0.025 - scene.current.rotation.x) * Math.min(delta * 2, 1);
  });

  return (
    <>
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["#fff8fc", "#6f5578", 1.5]} />

      <directionalLight position={[4, 5, 6]} intensity={2.5} color="#ffffff" />

      <pointLight position={[-4, 1, 3]} intensity={12} color="#ffd9f0" />

      <pointLight position={[3, -2, 2]} intensity={10} color="#dce3ff" />

      <Environment preset="studio" />

      <group ref={scene}>
        {DOMAINS.map((domain, index) => (
          <HeartOutline
            key={domain.id}
            domain={domain}
            active={activeId === domain.id}
            index={index}
            position={positions[index]}
            rotation={[0, index * 0.2, index * 0.06]}
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
        <p>sélectionne un cœur pour explorer mon univers.</p>
      </div>

      <div className="toolbox3d-layout">
        <div className="toolbox3d-stage">
          <div className="toolbox3d-orb toolbox3d-orb--one" />
          <div className="toolbox3d-orb toolbox3d-orb--two" />

          <Canvas
            camera={{ position: [0, 0, 8], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
            onCreated={({ gl }) => {
              gl.toneMappingExposure = 1.15;
            }}
          >
            <WorkshopScene activeId={activeId} onSelect={setActiveId} />
          </Canvas>

          <span className="toolbox3d-hint">
            <span className="toolbox3d-hint-dot" />
            CLIQUE SUR UN CŒUR POUR EXPLORER
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
            <span className="toolbox3d-mobile-dot" />
            <span className="toolbox3d-mobile-text">
              <strong>{domain.title}</strong>
              <small>{domain.subtitle}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
