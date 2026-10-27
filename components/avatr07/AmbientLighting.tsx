"use client";

import { useLayoutEffect, useRef } from "react";
import AutoVideo from "./AutoVideo";
import { u } from "./scale";
import { byViewport, initAmbientLightingMobile } from "./mobileMotion";
import { initAmbientLighting } from "./ambientMotion";

// The word "Ambient": a 250%-wide horizontal gradient clipped to the letters (only background-position is ever
// animated), in an AVATR-inspired palette (deep violet, electric blue, cyan, emerald, warm amber, magenta, and
// back to violet so the tile repeats seamlessly), plus a blurred copy behind it as the matching soft glow.
// Without JS or with reduced motion this is the static multi-colour version.
const GRADIENT = "linear-gradient(90deg, #6a42d6, #3c78ff, #46d7eb, #3ccd96, #f0aa46, #e155aa, #6a42d6)";
const CLIP: React.CSSProperties = {
  backgroundImage: GRADIENT,
  backgroundSize: "250% 100%",
  backgroundRepeat: "repeat-x",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const STATS = [
  { value: "21", unit: "", label: "Ambient light sources" },
  { value: "249", unit: "pcs", label: "Multi-color LEDs" },
  { value: "2800", unit: "mm", label: "Continuous light strip" },
];

// Phase 3 · 1 — Optical Surround Ambient Lighting. Full-bleed 16:9 video (1920x1080 on the artboard)
// with the heading, description and three figures over its lower part. Below md the video keeps its
// own 16:9 frame (below 1024px) and the text sits under it on the same near-black ground.
export default function AmbientLighting() {
  const ref = useRef<HTMLElement>(null);

  // Entrance (heading, description, specs) once when the heading comes into view, then a continuous colour
  // glow on the word "Ambient" only. Skipped under prefers-reduced-motion (static white heading).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return byViewport(() => initAmbientLighting(el), () => initAmbientLightingMobile(el));
  }, []);

  return (
    <section ref={ref} className="relative bg-[#1c1c1c] text-white lg:aspect-[1920/1080]">
      <div className="relative aspect-video w-full lg:absolute lg:inset-0 lg:aspect-auto">
        <AutoVideo
          src="/videos/avatr-07/ambient-lighting.mp4"
          label="AVATR 07 optical surround ambient lighting"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Desktop only: black scrim at the foot so the copy stays legible over the video. */}
        <div
          aria-hidden
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.6) 24%, rgba(0,0,0,0.25) 42%, rgba(0,0,0,0) 56%)",
          }}
        />
      </div>

      <div
        className="relative flex flex-col items-center px-5 text-center lg:absolute lg:inset-x-0 lg:bottom-0"
        style={{ paddingTop: u(40, 36), paddingBottom: u(46, 44) }}
      >
        <h2 className="font-normal" style={{ fontSize: u(58, 28), lineHeight: 1.15, letterSpacing: "0.005em" }}>
          Optical Surround <span className="relative inline-block">
            <span aria-hidden data-fx="ambient-glow" className="pointer-events-none absolute inset-0 select-none" style={{ ...CLIP, filter: "blur(10px)", opacity: 0.55 }}>
              Ambient
            </span>
            <span data-fx="ambient-fill" style={CLIP}>
              Ambient
            </span>
          </span> Lighting
        </h2>
        <p
          style={{ marginTop: u(26, 14), maxWidth: u(1000, 340), fontSize: u(22, 15), lineHeight: 1.4, letterSpacing: "0.01em" }}
        >
          High real-time music rhythm effect with &lt;40ms sound-light delay, lighting moves with the sound creating a
          perfectly matched ambiance
        </p>

        <dl className="flex items-start justify-center" style={{ marginTop: u(36, 28), gap: u(70, 28) }}>
          {STATS.map((s) => (
            <div key={s.label} data-fx="spec" className="flex flex-col items-center">
              <dd className="flex items-baseline whitespace-nowrap" style={{ lineHeight: 1.1 }}>
                <span className="font-normal" style={{ fontSize: u(45, 30) }}>
                  {s.value}
                </span>
                {s.unit && (
                  <span className="ml-[0.25em]" style={{ fontSize: u(18, 12) }}>
                    {s.unit}
                  </span>
                )}
              </dd>
              <dt style={{ fontSize: u(17, 12), lineHeight: 1.3, marginTop: u(2, 3) }}>{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
