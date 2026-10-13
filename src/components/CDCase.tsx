import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshReflectorMaterial, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function CDJewelCase() {
  const groupRef = useRef<THREE.Group>(null);

  // Animation légère de flottement et suivi doux de la souris
  useFrame((state) => {
    if (!groupRef.current) return;
    const { x, y } = state.pointer;
    // Inclinaison fluide en fonction de la position de la souris
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      x * 0.5,
      0.1
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -y * 0.5,
      0.1
    );
  });

  return (
    <group ref={groupRef}>
      {/* Ombre portée au sol */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={2.5} castShadow />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#ff65a3" />

      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Boîtier arrière (Tray noir/graphite) */}
        <mesh position={[0, 0, -0.1]}>
          <boxGeometry args={[3, 3, 0.15]} />
          <meshStandardMaterial color="#1a1a1f" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Le CD à l'intérieur (Disque) */}
        <mesh position={[0, 0, -0.02]}>
          <cylinderGeometry args={[1.3, 1.3, 0.02, 32]} />
          <meshStandardMaterial 
            color="#222" 
            roughness={0.1} 
            metalness={0.9} 
          />
        </mesh>

        {/* Couvercle transparent en verre (Jewel Case Cover) */}
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[3, 3, 0.05]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.95} // Effet verre transparent
            opacity={1}
            transparent
            roughness={0.05}
            ior={1.5} // Indice de réfraction du verre
            thickness={0.5}
            specularIntensity={1}
          />
        </mesh>
      </Float>
    </group>
  );
}

export default function CDCase3D() {
  return (
    <div style={{ width: "100%", height: "400px", cursor: "grab" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <color attach="background" args={["#0d0d12"]} />
        <CDJewelCase />
        <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.6} />
      </Canvas>
    </div>
  );
}