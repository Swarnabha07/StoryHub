"use client";

import Scene from "./BookLoader/Scene";

export default function LoaderOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#FFFDF9]">
      {/* Glow behind the complete loader */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[380px] w-[380px] rounded-full bg-amber-100/50 blur-3xl lg:h-[700px] lg:w-[700px]" />
      </div>

      {/* Loader Content */}
      <div className="relative flex flex-col items-center">
        {/* 3D Book */}
        <div className="h-[240px] w-[240px] lg:h-[380px] lg:w-[380px]">
          <Scene />
        </div>

        {/* Branding */}
        <div className="mt-2 flex flex-col items-center text-center lg:mt-0">
          {/* <h1 className="font-serif text-3xl tracking-wide text-neutral-900 lg:text-5xl">
            StoryHub
          </h1> */}

          <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#5A2A27] lg:mt-3 lg:max-w-md lg:text-2xl">
            Just a moment…
          </p>

          {/* Animated dots */}
          <div className="mt-8 flex items-center gap-2 lg:mt-10 lg:gap-3">
            <span
              className="h-2 w-2 animate-bounce rounded-full bg-[#5A2A27] lg:h-3 lg:w-3"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="h-2 w-2 animate-bounce rounded-full bg-[#5A2A27] lg:h-3 lg:w-3"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-2 w-2 animate-bounce rounded-full bg-[#5A2A27] lg:h-3 lg:w-3"
              style={{ animationDelay: "300ms" }}
            />
          </div>

          <p className="mt-5 text-xs uppercase tracking-[0.35em] text-[#5A2A27] lg:mt-7 lg:text-lg lg:tracking-[0.45em]">
            Preparing your experience
          </p>
        </div>
      </div>
    </div>
  );
}
