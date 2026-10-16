"use client";

import { useLayoutEffect, useRef } from "react";
import SectionHeading from "./SectionHeading";
import { INK, TAN, u } from "./scale";
import { initLuxuryStatsMotion } from "./luxuryStatsMotion";

const STATS = [
  { prefix: "", value: "35.4", label: "4K panoramic horizon screen" },
  { prefix: "", value: "15.6", label: "2K floating central control screen" },
  { prefix: "Dual", value: "6.7", label: "HD rearview screens" },
];

export default function LuxuryStats() {
  const ref = useRef<HTMLElement>(null);

  // Scroll-triggered, play-once reveal (GSAP + ScrollTrigger); skipped under prefers-reduced-motion.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return initLuxuryStatsMotion(el);
  }, []);

  return (
    <section ref={ref} className="bg-white px-5" style={{ paddingTop: u(56, 44), paddingBottom: u(68, 50) }}>
      <SectionHeading
        title="Luxury Experience"
        subtitle="Future-encircling cockpit, premium materials, and exquisite details deliver an unparalleled experience"
        subtitleSize={22}
        titleSize={58}
        ruleWidth={520}
        subtitleGap={26}
        ruleGap={20}
      />

      <dl
        className="mx-auto flex flex-col items-center md:-translate-x-[calc(var(--u)*14)] md:flex-row md:justify-center"
        style={{ marginTop: u(60, 32) }}
      >
        {STATS.map((s, i) => (
          <div key={s.label} data-fx="spec" className="flex items-stretch">
            {i > 0 && (
              <span
                aria-hidden
                data-fx="divider"
                className="hidden self-center md:block"
                style={{ width: 1, height: u(64), background: "rgba(20,20,20,0.22)" }}
              />
            )}
            <div className="flex flex-col items-center py-5 md:py-0">
              <dd
                className="flex items-baseline whitespace-nowrap md:px-[calc(var(--u)*56)]"
                style={{ lineHeight: 1.1 }}
              >
                {s.prefix && (
                  <span data-fx="spec-unit" className="mr-[0.25em]" style={{ color: INK, fontSize: u(18, 14) }}>
                    {s.prefix}
                  </span>
                )}
                <span data-fx="spec-num" className="relative font-normal" style={{ color: TAN, fontSize: u(45, 34) }}>
                  {s.value}
                </span>
                <span data-fx="spec-unit" className="ml-[0.25em]" style={{ color: INK, fontSize: u(18, 14) }}>
                  inch
                </span>
              </dd>
              <dt
                data-fx="spec-label"
                className="md:px-[calc(var(--u)*56)]"
                style={{ color: INK, fontSize: u(21, 14), lineHeight: 1.3, marginTop: u(-3, 4) }}
              >
                {s.label}
              </dt>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
