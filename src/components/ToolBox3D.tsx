
import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  Html,
  Environment,
  Sparkles,
  ContactShadows,
} from "@react-three/drei";
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
    tools: ["Photoshop", "Illustrator", "InDesign", "Affinity"],
  },
  {
    id: "uiux",
    title: "UI/UX design",
    subtitle: "Imaginer des interfaces",
    color: "#9ab88b",
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
    tools: ["Premiere Pro", "After Effects"],
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

    points.push(
      new Vector3(
        (16 * Math.pow(Math.sin(t), 3)) / 17,
        (
          13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)
        ) / 17,
        Math.sin(t * 2) * 0.12,
      ),
    );
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
  const halo = useRef<Group>(null);
  const pulse = useRef(0);
  const [hovered, setHovered] = useState(false);
  const { pointer } = useThree();

  const curve = useMemo(() => createHeartCurve(), []);

  const handleSelect = useCallback(() => {
    pulse.current = 1;
    onSelect();
  }, [onSelect]);

  useFrame((state, delta) => {
    if (!group.current) return;

    const time = state.clock.elapsedTime;
    const influence = hovered ? 0.32 : 0.16;

    const targetX = -pointer.y * influence;
    const targetY =
      pointer.x * influence +
      Math.sin(time * 0.55 + index) * 0.08;

    group.current.rotation.x +=
      (targetX - group.current.rotation.x) *
      Math.min(delta * 4, 1);

    group.current.rotation.y +=
      (targetY - group.current.rotation.y) *
      Math.min(delta * 4, 1);

    const targetScale = active ? 1.42 : hovered ? 1.22 : 1;
    const pulseAmount = pulse.current;

    pulse.current = Math.max(0, pulse.current - delta * 1.8);

    const pulseScale = Math.sin(pulseAmount * Math.PI) * 0.13;
    const finalScale = targetScale + pulseScale;

    const nextScale =
      group.current.scale.x +
      (finalScale - group.current.scale.x) *
        Math.min(delta * 9, 1);

    group.current.scale.setScalar(nextScale);

    if (halo.current) {
      const haloScale =
        (active ? 1.25 : 1) +
        Math.sin(time * 2.2 + index) * 0.035 +
        pulseAmount * 0.35;

      halo.current.scale.setScalar(haloScale);
    }
  });

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = "";
  };

  return (
    <group {...props}>
      <Float
        speed={1.1 + index * 0.22}
        rotationIntensity={0.16}
        floatIntensity={0.45 + index * 0.06}
      >
        <group
          ref={group}
          onClick={(event) => {
            event.stopPropagation();
            handleSelect();
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={handlePointerOut}
        >
          {/* Halo animé */}
          <group ref={halo} position={[0, 0, -0.16]}>
            <mesh>
              <sphereGeometry args={[0.74, 32, 32]} />
              <meshBasicMaterial
                color={domain.color}
                transparent
                opacity={active ? 0.12 : hovered ? 0.1 : 0.035}
                depthWrite={false}
              />
            </mesh>
          </group>

          {/* Lueur extérieure */}
          <mesh>
            <tubeGeometry args={[curve, 160, 0.095, 12, true]} />
            <meshBasicMaterial
              color={domain.color}
              transparent
              opacity={active ? 0.3 : hovered ? 0.25 : 0.075}
              depthWrite={false}
            />
          </mesh>

          {/* Contour effet verre */}
          <mesh>
            <tubeGeometry args={[curve, 160, 0.052, 16, true]} />
            <meshPhysicalMaterial
              color={domain.color}
              roughness={0.08}
              metalness={0.05}
              transmission={0.75}
              thickness={0.7}
              ior={1.45}
              clearcoat={1}
              clearcoatRoughness={0.05}
              emissive={domain.color}
              emissiveIntensity={active ? 0.65 : hovered ? 0.4 : 0.12}
              transparent
              opacity={0.95}
            />
          </mesh>

          {/* Reflet lumineux */}
          <mesh>
            <tubeGeometry args={[curve, 160, 0.012, 8, true]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={hovered || active ? 0.95 : 0.5}
              depthWrite={false}
            />
          </mesh>

          {/* Éclats autour du cœur actif */}
          {(active || hovered) && (
            <Sparkles
              count={active ? 24 : 12}
              scale={[2.3, 2.3, 0.7]}
              size={active ? 3 : 2}
              speed={0.45}
              opacity={active ? 0.85 : 0.5}
              color={domain.color}
            />
          )}

          <pointLight
            color={domain.color}
            intensity={active ? 2.5 : hovered ? 2 : 0.45}
            distance={active ? 4 : 3}
          />

          {/* Étiquette cliquable */}
          <Html
            center
            distanceFactor={8}
            position={[0, -1.12, 0]}
            zIndexRange={[20, 0]}
          >
            <button
              type="button"
              aria-pressed={active}
              aria-label={`Explorer le domaine ${domain.title}`}
              className={`tool3d-label ${
                active ? "is-active" : ""
              } ${hovered ? "is-hovered" : ""}`}
              style={
                { "--tool-color": domain.color } as React.CSSProperties
              }
              onClick={(event) => {
                event.stopPropagation();
                handleSelect();
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
    [-3.15, 1.45, 0],
    [2.8, 1.75, -0.4],
    [0.35, -0.5, 0.2],
    [-2.5, -1.8, 0.1],
  ];

  useFrame((_, delta) => {
    if (!scene.current) return;

    scene.current.rotation.y +=
      (pointer.x * 0.065 - scene.current.rotation.y) *
      Math.min(delta * 2.5, 1);

    scene.current.rotation.x +=
      (-pointer.y * 0.045 - scene.current.rotation.x) *
      Math.min(delta * 2.5, 1);
  });

  return (
    <>
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["#fff8fc", "#6f5578", 1.5]} />
      <directionalLight
        position={[4, 5, 6]}
        intensity={2.5}
        color="#ffffff"
      />
      <pointLight
        position={[-4, 1, 3]}
        intensity={10}
        color="#ffd9f0"
      />
      <pointLight
        position={[3, -2, 2]}
        intensity={8}
        color="#dce3ff"
      />
      <Environment preset="studio" />

      <group ref={scene}>
        {DOMAINS.map((domain, index) => (
          <HeartOutline
            key={domain.id}
            domain={domain}
            active={activeId === domain.id}
            index={index}
            position={positions[index]}
            rotation={[0, index * 0.12, index * 0.04]}
            onSelect={() => onSelect(domain.id)}
          />
        ))}
      </group>

      <ContactShadows
        position={[0, -2.8, -1]}
        opacity={0.18}
        scale={10}
        blur={2.5}
        far={4}
      />
    </>
  );
}

export default function ToolBox3D() {
  const [activeId, setActiveId] = useState("design");

  const activeIndex = DOMAINS.findIndex(
    (domain) => domain.id === activeId,
  );

  const active = DOMAINS[activeIndex] ?? DOMAINS[0];

  const changeDomain = useCallback((step: number) => {
    setActiveId((currentId) => {
      const currentIndex = DOMAINS.findIndex(
        (domain) => domain.id === currentId,
      );
      const nextIndex =
        (currentIndex + step + DOMAINS.length) % DOMAINS.length;

      return DOMAINS[nextIndex].id;
    });
  }, []);

  return (
    <div
      className="toolbox3d"
      style={{ "--active-color": active.color } as React.CSSProperties}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          changeDomain(1);
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          changeDomain(-1);
        }
      }}
    >
      <div className="toolbox3d-heading">
        <p>Choisis un cœur et explore mon univers créatif.</p>
        <span className="toolbox3d-counter">
          {String(activeIndex + 1).padStart(2, "0")} / 04
        </span>
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
            <WorkshopScene
              activeId={activeId}
              onSelect={setActiveId}
            />
          </Canvas>

          <span className="toolbox3d-hint">
            <span className="toolbox3d-hint-dot" />
            SURVOLE · CLIQUE · EXPLORE
          </span>
        </div>

        <aside
          className="toolbox3d-panel"
          key={active.id}
          style={
            { "--active-color": active.color } as React.CSSProperties
          }
          aria-live="polite"
        >
          <span
            className="toolbox3d-number"
            style={{ color: active.color }}
          >
            DOMAINE / 0{activeIndex + 1}
          </span>

          <h3>{active.title}</h3>
          <p>{active.subtitle}</p>

          <div className="toolbox3d-tags">
            {active.tools.map((tool, index) => (
              <span
                key={tool}
                style={{ animationDelay: `${index * 65}ms` }}
              >
                {tool}
              </span>
            ))}
          </div>

          <div className="toolbox3d-panel-nav">
            <button
              type="button"
              onClick={() => changeDomain(-1)}
              aria-label="Domaine précédent"
            >
              ← Précédent
            </button>
            <button
              type="button"
              onClick={() => changeDomain(1)}
              aria-label="Domaine suivant"
            >
              Suivant →
            </button>
          </div>

          <div className="toolbox3d-indicator" />
        </aside>
      </div>

      <div className="toolbox3d-mobile-list">
        {DOMAINS.map((domain, index) => (
          <button
            key={domain.id}
            type="button"
            aria-pressed={activeId === domain.id}
            className={activeId === domain.id ? "is-active" : ""}
            style={
              { "--tool-color": domain.color } as React.CSSProperties
            }
            onClick={() => setActiveId(domain.id)}
          >
            <span className="toolbox3d-mobile-dot" />
            <span className="toolbox3d-mobile-text">
              <strong>{domain.title}</strong>
              <small>{domain.subtitle}</small>
            </span>
            <span className="toolbox3d-mobile-index">
              {String(index + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
