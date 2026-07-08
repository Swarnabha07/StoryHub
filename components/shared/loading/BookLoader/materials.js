// materials.js

import * as THREE from "three";

// =========================
// PAPER MATERIAL
// =========================

export const paperMaterial = new THREE.MeshPhysicalMaterial({
  color: "#F8F4EA",

  roughness: 0.92,

  metalness: 0,

  clearcoat: 0,

  reflectivity: 0.15,
});

// =========================
// LEATHER COVER MATERIAL
// =========================

export const coverMaterial = new THREE.MeshPhysicalMaterial({
  color: "#6E4B33",

  roughness: 0.72,

  metalness: 0,

  clearcoat: 0.45,

  clearcoatRoughness: 0.25,

  reflectivity: 0.45,
});

// =========================
// SPINE MATERIAL
// =========================

export const spineMaterial = new THREE.MeshPhysicalMaterial({
  color: "#593A28",

  roughness: 0.82,

  metalness: 0,

  clearcoat: 0.35,

  reflectivity: 0.35,
});
