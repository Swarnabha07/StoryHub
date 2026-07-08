"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";

import Book from "./Book";

export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{
        position: [2.8, 2.1, 5.8],
        fov: 32,
      }}
      gl={{
        antialias: true,
      }}
    >
      {/* Background */}
      <color attach="background" args={["#f7f3eb"]} />

      {/* -------------------------
          THREE POINT LIGHTING
      ------------------------- */}

      {/* Key Light */}
      <directionalLight
        castShadow
        position={[6, 8, 5]}
        intensity={2.8}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Fill Light */}
      <directionalLight position={[-5, 3, 4]} intensity={1.2} />

      {/* Rim Light */}
      <directionalLight position={[0, 5, -6]} intensity={1} />

      {/* Soft ambient illumination */}
      <ambientLight intensity={0.45} />

      {/* HDR reflections */}
      <Environment preset="studio" />

      {/* Book */}
      <Book />

      {/* Soft floor shadow */}
      <ContactShadows
        position={[0, -0.42, 0]}
        opacity={0.35}
        blur={2.8}
        scale={8}
        far={2}
      />

      {/* Development only */}
      <OrbitControls enablePan={false} minDistance={4} maxDistance={8} />
    </Canvas>
  );
}
