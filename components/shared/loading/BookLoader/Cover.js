"use client";

import {
  COVER_WIDTH,
  COVER_HEIGHT,
  COVER_THICKNESS,
} from "./constants";

import { coverMaterial } from "./materials";

export default function Cover({
  side = "right",
  rotation = [0, 0, 0],
}) {
  const direction = side === "left" ? -1 : 1;

  return (
    <group rotation={rotation}>
      <mesh
        castShadow
        receiveShadow
        material={coverMaterial}
        position={[
          direction * COVER_WIDTH / 2,
          0,
          0,
        ]}
      >
        <boxGeometry
          args={[
            COVER_WIDTH,
            COVER_THICKNESS,
            COVER_HEIGHT,
          ]}
        />
      </mesh>
    </group>
  );
}