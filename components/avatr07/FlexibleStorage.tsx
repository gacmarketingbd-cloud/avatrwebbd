"use client";

import { useLayoutEffect, useRef } from "react";
import AutoVideo from "./AutoVideo";
import { u } from "./scale";
import { initStorageText } from "./storageMotion";

// Phase 3 · 2 — Flexible Storage for Every Need. A full-bleed video band (1920x824 on the artboard;
// the 16:9 source is cropped top and bottom to fit) with a dark caption panel underneath. The panel carries
// its own background (it is what opens up in the entrance animation, see storageMotion.ts).
const HL = "inline-block whitespace-nowrap";

export default function FlexibleStorage() {
  const ref = useRef<HTMLElement>(null);

  // Text panel only (the video never animates); once, when the panel comes into view. Skipped under
  // prefers-reduced-motion.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return initStorageText(el);
  }, []);

  return (
    <section ref={ref} className="text-white">
      <div className="relative aspect-video w-full bg-[#231f20] md:aspect-[1920/824]">
        <AutoVideo
          src="/videos/avatr-07/extra-large-storage.mp4"
          label="AVATR 07 extra-large cargo space and fold-flat rear seats"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div
        data-fx="panel"
        className="flex flex-col items-center bg-[#231f20] px-5 text-center"
        style={{ paddingTop: u(38, 32), paddingBottom: u(42, 36) }}
      >
        <h2 className="font-normal" style={{ fontSize: u(40, 24), lineHeight: 1.2, letterSpacing: "0.005em" }}>
          Flexible Storage for Every Need
        </h2>
        <p style={{ marginTop: u(22, 12), maxWidth: u(930, 340), fontSize: u(22, 15), lineHeight: 1.4, letterSpacing: "0.01em" }}>
          Extra-large cargo space with <span data-fx="hl" className={HL}>1.8 m</span> depth and{" "}
          <span data-fx="hl" className={HL}>1,325 L</span> capacity, plus rear seats that fold flat to create a{" "}
          <span data-fx="hl" className={HL}>3 m²</span> king-size bed
        </p>
      </div>
    </section>
  );
}
