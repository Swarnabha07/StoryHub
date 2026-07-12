"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import Cover from "./Cover";
import Page from "./Page";
import PageStack from "./PageStack";

export default function Book() {
  const bookRef = useRef();
  const pageRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    //----------------------------------
    // Floating motion
    //----------------------------------

    bookRef.current.position.y = Math.sin(t * 0.9) * 0.05;

    bookRef.current.rotation.x = Math.sin(t * 0.3) * 0.02;

    bookRef.current.rotation.z = Math.sin(t * 0.5) * 0.015;

    bookRef.current.rotation.y = -0.32;

    //----------------------------------
    // One page animation
    //----------------------------------

    const cycle = 3.6;

    const progress = (t % cycle) / cycle;

    // Smooth acceleration and deceleration
    const eased = THREE.MathUtils.smootherstep(progress, 0, 1);

    // Extra easing near the end
    const turn = THREE.MathUtils.smoothstep(eased, 0, 1);

    // Rotate from right page to left page
    pageRef.current.rotation.z = -Math.PI * 0.99 * turn;

    // Lift page while turning.
    // Peaks at the middle and returns to zero.
    const lift = Math.sin(progress * Math.PI) * 0.025;
    pageRef.current.position.y = 0.002 + lift;

    // Shift from the right stack toward the left stack
    const pageShift = THREE.MathUtils.lerp(0.02, -0.02, turn);
    pageRef.current.position.x = pageShift;
  });

  return (
    <group ref={bookRef}>
      {/* Left Cover */}
      <Cover side="left" rotation={[0, 0, Math.PI * 0.98]} />

      {/* Left Stack */}
      <PageStack side="left" />

      {/* Animated Page */}
      <group ref={pageRef} position={[0, 0, 0]}>
        <Page />
      </group>

      {/* Right Stack */}
      <PageStack side="right" />

      {/* Right Cover */}
      <Cover side="right" rotation={[0, 0, -Math.PI * 0.98]} />
    </group>
  );
}
