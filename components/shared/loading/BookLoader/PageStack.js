"use client";

import { PAGE_WIDTH, PAGE_HEIGHT } from "./constants";

import { paperMaterial } from "./materials";

export default function PageStack({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  thickness = 0.16,
  side = "right",
}) {
  const xOffset = side === "left" ? -PAGE_WIDTH / 2 : PAGE_WIDTH / 2;

  return (
    <group position={position} rotation={rotation}>
      {/* Paper Block */}
      <mesh
        castShadow
        receiveShadow
        material={paperMaterial}
        position={[xOffset, 0, 0]}
      >
        <boxGeometry args={[PAGE_WIDTH, thickness, PAGE_HEIGHT]} />
      </mesh>

      {/* Fake paper edges */}
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            xOffset,
            thickness / 2 + 0.0005,
            -PAGE_HEIGHT / 2 + (i * PAGE_HEIGHT) / 17,
          ]}
        >
          <boxGeometry args={[PAGE_WIDTH * 0.985, 0.0008, 0.003]} />

          <meshStandardMaterial color="#E7DDCC" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}
