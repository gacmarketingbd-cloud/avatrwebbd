"use client";

import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import sound from "../../avatr 07 page/Meridian™ High-end Sound System.webp";
import StatFigure from "./StatFigure";
import { u } from "./scale";
import { byViewport, initMeridianTextMobile } from "./mobileMotion";
import { initMeridianText } from "./meridianMotion";

const STATS = [
  { value: "25", label: "Loudspeakers" },
  { value: "7.1.4", label: "Sound System" },
  { value: "2016w", label: "Power Output" },
  { value: "24", label: "Independent Channels" },
];

// Phase 2 · 4 — Meridian high-end sound system. Full-bleed top-down car fading to dark at the foot, with
// the title and four figures. Desktop: the photo is shown at exactly the viewport width (no side crop) and its
// empty top margin is trimmed instead (T), so the section is 960px tall at 1920 (was 1178) and never taller
// than the viewport minus the 72px header (floor 820px so the car is never cut). The photo is 16:9 and the car
// with all 15 speaker rings sits between 19% and 80% of its height, so only unused space is removed.
const DESKTOP_VARS = {
  "--ms-h": "56.25vw", // the 16:9 photo's height at full viewport width
  "--ms-box": "max(calc(var(--u) * 820), min(calc(var(--u) * 960), calc(100svh - 72px)))",
  "--ms-top": "max(0px, min(calc(var(--ms-h) * 0.139), calc(var(--ms-h) - var(--ms-box))))", // crop from the top
} as CSSProperties;

export default function MeridianSound() {
  const ref = useRef<HTMLElement>(null);

  // Title + figures + labels only (the photo never animates); once, when the text comes into view.
  // Skipped under prefers-reduced-motion.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return byViewport(() => initMeridianText(el), () => initMeridianTextMobile(el));
  }, []);

  return (
    <section
      ref={ref}
      className="relative aspect-[4/5] w-full overflow-hidden bg-[#1a1a1c] sm:aspect-[4/3] md:aspect-auto md:h-[var(--ms-box)]"
      style={DESKTOP_VARS}
    >
      {/* Phones/tablets: 16:9 photo cropped into the tile (1.33x viewport width at 4:3, 2.22x at 4:5).
          Desktop: full width, top-trimmed (see above). */}
      <Image
        src={sound}
        alt="AVATR 07 seen from above with the Meridian speaker positions highlighted"
        fill
        quality={100}
        sizes="(min-width: 768px) 100vw, (min-width: 640px) 133vw, 222vw"
        className="object-cover md:!bottom-auto md:!h-auto md:!top-[calc(var(--ms-top)*-1)]"
      />
      <div
        aria-hidden
        data-fx="deepen"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(22,22,24,0.96) 0%, rgba(22,22,24,0.82) 22%, rgba(22,22,24,0.45) 38%, rgba(22,22,24,0) 54%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-5 text-white" style={{ paddingBottom: u(60, 28) }}>
        <h2 className="text-center font-normal" style={{ fontSize: u(34, 20), lineHeight: 1.15 }}>
          Meridian™ High-end Sound System
        </h2>
        <div className="grid grid-cols-2 md:flex md:justify-center" style={{ marginTop: u(46, 22), columnGap: u(60, 24), rowGap: u(20, 16) }}>
          {STATS.map((s) => (
            <StatFigure key={s.label} {...s} numberSize={[30, 22]} unitSize={[16, 12]} labelSize={[17, 12.5]} />
          ))}
        </div>
      </div>
    </section>
  );
}
