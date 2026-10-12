
import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import {
  CatmullRomCurve3,
  Vector3,
  type Group,
} from "three";
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

type SkillObjectProps = ThreeElements["group"] & {
  domain: Domain;
  active: boolean;
  index: number;
  onSelect: () => void;
};

function createHeartCurve() {
  const points: Vector3[] = [];
  const segments = 120;

  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;

    // Courbe classique d'un cœur, transformée en contour 3D.
    const x = (16 * Math.pow(Math.sin(t), 3)) / 17;
    const y =
      (13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)) /
      17;

    // Profondeur douce pour donner du relief au contour.
    const z = Math.sin(t * 2) * 0.12;

    points.push(new Vector3(x, y, z));
  }

  return new CatmullRomCurve3(points, true, "catmullrom", 0.5);
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

    const t = state.clock.elapsedTime;
    const influence = hovered ? 0.32 : 0.12;

    const targetX = -pointer.y * influence;
    const targetY =
      pointer.x * influence + Math.sin(t * 0.55 + index) * 0.08;

    group.current.rotation.x +=
      (targetX - group.current.rotation.x) *
      Math.min(delta * 3, 1);

    group.current.rotation.y +=
      (targetY - group.current.rotation.y) *
      Math.min(delta * 3, 1);

    const targetScale = hovered ? 1.28 : active ? 1.12 : 1;
    const nextScale =
      group.current.scale.x +
      (targetScale - group.current.scale.x) *
        Math.min(delta * 7, 1);

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
          {/* Halo coloré derrière le cœur */}
          <mesh position={[0, 0, -0.12]} scale={hovered ? 1.3 : 1.12}>
            <sphereGeometry args={[0.78, 32, 32]} />
            <meshBasicMaterial
              color={domain.color}
              transparent
              opacity={hovered ? 0.12 : active ? 0.075 : 0.035}
              depthWrite={false}
            />
          </mesh>

          {/* Lueur du contour */}
          <mesh>
            <tubeGeometry args={[curve, 120, 0.065, 8, true]} />
            <meshBasicMaterial
              color={domain.color}
              transparent
              opacity={hovered ? 0.28 : active ? 0.2 : 0.1}
              depthWrite={false}
            />
          </mesh>

          {/* Contour principal du cœur */}
          <mesh>
            <tubeGeometry args={[curve, 120, 0.025, 8, true]} />
            <meshStandardMaterial
              color={domain.color}
              emissive={domain.color}
              emissiveIntensity={hovered ? 2.5 : active ? 1.7 : 0.8}
              metalness={0.45}
              roughness={0.25}
            />
          </mesh>

          {/* Petit point lumineux sur le cœur */}
          <pointLight
            color={domain.color}
            intensity={hovered ? 4 : active ? 2 : 0.7}
            distance={hovered ? 4 : 2.8}
          />

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
              style={
                { "--tool-color": domain.color } as React.CSSProperties
              }
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
  const { pointer } = useThree();
  const scene = useRef<Group>(null);

  const positions: [number, number, number][] = [
    [-2.25, 0.8, 0],
    [0, 1.3, -0.4],
    [2.25, 0.8, 0],
    [-1.25, -1.35, 0.2],
    [1.25, -1.35, 0.2],
  ];

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

  const active =
    DOMAINS.find((domain) => domain.id === activeId) ?? DOMAINS[0];

  return (
    <div className="toolbox3d">
      <div className="toolbox3d-heading">
        <p>
          Un mélange de design, de web et d’expérimentation numérique.
          Sélectionne un cœur pour explorer mon univers.
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
            <WorkshopScene
              activeId={activeId}
              onSelect={setActiveId}
            />
          </Canvas>

          <span className="toolbox3d-hint">
            <span className="toolbox3d-hint-dot" />
            CLIQUE SUR UN CŒUR POUR EXPLORER
          </span>
        </div>

        <aside
          className="toolbox3d-panel"
          key={active.id}
          style={
            { "--active-color": active.color } as React.CSSProperties
          }
        >
          <span
            className="toolbox3d-number"
            style={{ color: active.color }}
          >
            DOMAINE / 0{DOMAINS.indexOf(active) + 1}
          </span>

          <h3>{active.title}</h3>
          <p>{active.subtitle}</p>

          <div className="toolbox3d-tags">
            {active.tools.map((tool, index) => (
              <span
                key={tool}
                style={{ animationDelay: `${index * 70}ms` }}
              >
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
            style={
              { "--tool-color": domain.color } as React.CSSProperties
            }
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
