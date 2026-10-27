"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import glacierCaramel from "../../avatr 07 page/Glacier Caramel Cockpit.webp";
import tintedShadows from "../../avatr 07 page/Tinted Shadows Cockpit.webp";
import { u } from "./scale";
import { initCockpitText } from "./cockpitTextMotion";
import { usePhotoVariants } from "./photoVariants";

// ---------------------------------------------------------------------------------------------
// ONE fixed stage, two interior renders registered to each other.
//
// The two supplied files are the same cockpit render but framed differently (Glacier Caramel
// 3034x1503 and left-hand drive; Tinted Shadows 3754x1676 and already right-hand drive), and the
// Tinted file contains LESS of the scene than Glacier. The shared frame is therefore the Tinted
// file's own framing (its 2.24:1 aspect also matches this section's desktop frame), and Glacier
// is placed onto it with a fixed scale + offset measured by matching the two renders' edge
// structure (scripts/register-cockpits.mjs: uniform scale 0.932, offset 32.5px / 2px at 960 wide;
// letting x and y scale separately gained nothing, so it is a pure similarity transform).
//
// The transform is static and sits on the stage, never on a state: toggling only changes opacity,
// so the cockpit itself cannot move, resize or zoom — only its colour/material changes.
// ---------------------------------------------------------------------------------------------
const STAGE_ASPECT = 3754 / 1676; // Tinted Shadows' native aspect = the shared frame

// Glacier Caramel (mirrored to RHD) expressed in the Tinted stage: inverse of the measured map.
const GLACIER_SCALE = 1 / 0.932;
const GLACIER_TX_PCT = (-32.5 / 0.932 / 960) * 100; // % of Glacier's own width
const GLACIER_TY_PCT = (-2 / 0.932 / ((960 * 1503) / 3034)) * 100; // % of Glacier's own height

// Order is the on-screen order: Glacier Caramel on the left, Tinted Shadows on the right.
// Images are keyed by `id` (not by position) so reordering the selectors can never change which
// image a selector shows.
const THEMES = [
  { id: "glacier", name: "Glacier Caramel", dot: "linear-gradient(135deg,#f4f4f4 0%,#f4f4f4 48%,#7a5b45 52%,#7a5b45 100%)" },
  { id: "tinted", name: "Tinted Shadows", dot: "linear-gradient(135deg,#59595f 0%,#59595f 48%,#26262b 52%,#26262b 100%)" },
] as const;
type ThemeId = (typeof THEMES)[number]["id"];
const DEFAULT_THEME: ThemeId = "glacier"; // Glacier Caramel

const FADE_MS = 700;
const FADE_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

export default function CockpitFeature() {
  const stage = useRef<HTMLElement>(null);
  const { active, shown, select, track, mounted } = usePhotoVariants<ThemeId>(DEFAULT_THEME, stage);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subcopyRef = useRef<HTMLParagraphElement>(null);

  // Headline + subcopy only: the Futuristic Design fade-rise (shared values in fadeRise.ts), once per
  // page load, when the text enters the viewport. Skipped under prefers-reduced-motion.
  useLayoutEffect(() => {
    const h = headlineRef.current;
    const p = subcopyRef.current;
    if (!h || !p || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return initCockpitText(h, p);
  }, []);

  // The incoming image fades in on top while the outgoing one stays fully opaque underneath until
  // the fade is done (then drops to 0 instantly), so the two never dip through black mid-fade.
  const layerStyle = (on: boolean) => ({
    opacity: on ? 1 : 0,
    zIndex: on ? 2 : 1,
    transition: on ? `opacity ${FADE_MS}ms ${FADE_EASE}` : `opacity 0ms linear ${FADE_MS}ms`,
  });

  return (
    // container-type:size lets the stage use cq units to cover the frame exactly like object-cover.
    <section ref={stage} className="relative aspect-[4/5] w-full overflow-hidden bg-black [container-type:size] sm:aspect-[4/3] md:aspect-[1920/856]">
      {/* The fixed stage: Tinted's framing, covering the section, top-anchored and centred. Both
          renders live inside it, so they always share one size, position and crop. */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2"
        style={{ width: `max(100cqw, calc(100cqh * ${STAGE_ASPECT}))`, aspectRatio: "3754 / 1676" }}
      >
        {/* Tinted Shadows: already right-hand drive, fills the stage exactly. */}
        {mounted("tinted") && (
        <div className="absolute inset-0" style={layerStyle(shown === "tinted")}>
          <Image
            src={tintedShadows}
            alt={shown === "tinted" ? "AVATR 07 cockpit in Tinted Shadows" : ""}
            aria-hidden={shown !== "tinted"}
            fill
            quality={100}
            sizes="(min-width: 768px) 100vw, (min-width: 640px) 170vw, 280vw"
            className="object-fill"
            {...track("tinted")}
          />
        </div>
        )}

        {/* Glacier Caramel: supplied left-hand drive, so it is mirrored; then registered onto the
            stage with the fixed scale/offset above. */}
        {mounted("glacier") && (
        <div className="absolute inset-0" style={layerStyle(shown === "glacier")}>
          <div
            className="absolute left-0 top-0 w-full"
            style={{
              aspectRatio: "3034 / 1503",
              transformOrigin: "0 0",
              transform: `translate(${GLACIER_TX_PCT}%, ${GLACIER_TY_PCT}%) scale(${GLACIER_SCALE})`,
            }}
          >
            <Image
              src={glacierCaramel}
              alt={shown === "glacier" ? "AVATR 07 cockpit in Glacier Caramel" : ""}
              aria-hidden={shown !== "glacier"}
              fill
              quality={100}
              sizes="(min-width: 768px) 108vw, (min-width: 640px) 185vw, 310vw"
              className="-scale-x-100 object-fill"
              {...track("glacier")}
            />
          </div>
        </div>
        )}
      </div>

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          zIndex: 3,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 24%, rgba(0,0,0,0) 54%)",
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center px-5 text-center text-white"
        style={{ paddingBottom: u(22, 18), zIndex: 4 }}
      >
        <h2 ref={headlineRef} className="text-stable font-normal" style={{ fontSize: u(30, 20), lineHeight: 1.15 }}>
          Five-screen Interaction with Digital Wraparound Design
        </h2>
        {/* The same will-change / backface-visibility the entrance uses are also set in CSS (.text-stable), so the
            layer is never dropped when the entrance ends (that re-rasterised the text and made it step). GSAP is
            the only thing that ever sets a transform on this element. */}
        <p
          ref={subcopyRef}
          className="text-stable font-light"
          style={{ marginTop: u(2, 4), fontSize: u(16, 13.5), lineHeight: 1.35 }}
        >
          Surround ambient lighting
        </p>

        <div role="radiogroup" aria-label="Interior theme" className="flex" style={{ marginTop: u(16, 12) }}>
          {THEMES.map((t) => {
            const selected = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => select(t.id)}
                className="flex flex-col items-center"
                style={{ width: u(130, 104) }}
              >
                <span
                  className="flex items-center justify-center rounded-full transition-colors duration-300"
                  style={{
                    width: u(52, 42),
                    height: u(52, 42),
                    background: selected ? "rgba(255,255,255,0.28)" : "transparent",
                  }}
                >
                  <span
                    className="rounded-full ring-1 ring-white/25"
                    style={{ width: u(44, 34), height: u(44, 34), background: t.dot }}
                  />
                </span>
                <span
                  className={`transition-opacity duration-300 ${selected ? "opacity-100" : "opacity-75"}`}
                  style={{ marginTop: u(6, 4), fontSize: u(11.5, 11), lineHeight: 1.4 }}
                >
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
