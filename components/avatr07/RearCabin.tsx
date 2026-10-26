"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import rearSeat from "../../avatr 07 page/Rear Seat.webp";
import StatFigure from "./StatFigure";
import { u } from "./scale";
import { motionOff } from "./mobileMotionSwitch";
import { initStatRoll } from "./statRollMotion";

const STATS = [
  { value: "3119", unit: "mm", label: "Overall usable space inside" },
  { value: "1037", unit: "mm", label: "Front and rear headroom reaches" },
  { value: "965", unit: "mm", label: "Effective rear legroom reaches" },
];

// Phase 2 · 1 — rear cabin spaciousness. Full-bleed photo (1920x900 on desktop, never taller than the
// viewport minus the 72px header, so photo + all three measurements are visible together) with a dark
// gradient at the foot and three measurements. The top margin completes the 83px white gap that
// follows the Luxury Experience stats (which already end with 68px of padding).
export default function RearCabin() {
  const stats = useRef<HTMLDivElement>(null);

  // Measurements only (the photo never animates): short number roll, then unit + caption rise. Plays once
  // when the stats come into view; skipped under prefers-reduced-motion.
  useLayoutEffect(() => {
    const el = stats.current;
    if (!el || motionOff("seat", el)) return;
    return initStatRoll(el);
  }, []);

  return (
    <section
      className="relative aspect-[4/5] w-full overflow-hidden bg-black sm:aspect-[4/3] md:aspect-auto md:h-[min(calc(var(--u)*900),calc(100svh-72px))]"
      style={{ marginTop: u(15, 0) }}
    >
      {/* Object-cover crop of a 1.54:1 photo: painted ~1.0x the viewport width on desktop, ~1.16x at
          4:3 and ~1.93x at 4:5, so `sizes` describes the photo, not the tile. */}
      <Image
        src={rearSeat}
        alt="AVATR 07 rear cabin"
        fill
        quality={100}
        sizes="(min-width: 768px) 100vw, (min-width: 640px) 116vw, 193vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0) 34%)" }}
      />
      <div
        ref={stats}
        className="stat-stable absolute inset-x-0 bottom-0 flex flex-col items-center px-5 md:flex-row md:items-start md:justify-center"
        style={{ paddingBottom: u(50, 24), gap: u(120, 18) }}
      >
        {STATS.map((s) => (
          <StatFigure key={s.label} {...s} numberSize={[45, 30]} unitSize={[18, 12]} labelSize={[21, 13]} />
        ))}
      </div>
    </section>
  );
}
