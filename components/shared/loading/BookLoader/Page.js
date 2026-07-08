"use client";

import { PAGE_WIDTH, PAGE_HEIGHT, PAGE_THICKNESS } from "./constants";
import { paperMaterial } from "./materials";

export default function Page() {
  return (
    <group>
      <mesh
        castShadow
        receiveShadow
        material={paperMaterial}
        // Move the mesh so the LEFT edge is the hinge
        position={[-PAGE_WIDTH / 2, 0, 0]}
      >
        <boxGeometry args={[PAGE_WIDTH, PAGE_THICKNESS, PAGE_HEIGHT]} />
      </mesh>
    </group>
  );
}
