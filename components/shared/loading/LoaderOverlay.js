"use client";

import Scene from "./BookLoader/Scene";

export default function LoaderOverlay() {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-[#f7f3eb]">
      <div className="w-full max-w-sm aspect-square">
        <Scene />
      </div>

      <p className="absolute bottom-20 text-sm tracking-[0.35em] uppercase text-neutral-600">
        Loading...
      </p>
    </div>
  );
}
