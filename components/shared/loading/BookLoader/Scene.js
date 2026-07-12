"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";

import Book from "./Book";
import { Suspense } from "react";

export default function Scene() {
  return (
    <Canvas
      shadows
      style={{ background: "transparent" }}
      dpr={[1, 2]}
      camera={{
        position: [-1.7, 4.0, 5.8],
        fov: 45,
      }}
      gl={{
        antialias: true,
        alpha: true,
      }}
    >
      <Suspense fallback={null}>
        {/* Lights */}
        <directionalLight
          castShadow
          position={[6, 8, 5]}
          intensity={2.8}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <directionalLight position={[-5, 3, 4]} intensity={1.2} />
        <directionalLight position={[0, 5, -6]} intensity={1} />
        <ambientLight intensity={0.45} />

        <Environment preset="studio" />

        <Book />

        <ContactShadows
          position={[0, -0.42, 0]}
          opacity={0.35}
          blur={2.8}
          scale={8}
          far={2}
        />
      </Suspense>

      {/* <OrbitControls enablePan={false} minDistance={4} maxDistance={8} /> */}
    </Canvas>
  );
}
