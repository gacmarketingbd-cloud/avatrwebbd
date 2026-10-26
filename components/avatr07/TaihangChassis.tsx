"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import chassis from "../../avatr 07 page/control chassis image.webp";
import { INK, u } from "./scale";
import { motionOff } from "./mobileMotionSwitch";
import { initCssReveal } from "./cssReveal";

const SPECS = [
  { title: "Double-wishbone aluminum independent suspension", lines: ["Precise steering / Dynamic stability"] },
  { title: "Multi-link aluminum independent suspension", lines: ["Space-efficient / High follow-through"] },
  { title: "Targeted Vibration Filtering Hydraulic Bushing Technology", lines: ["Space-efficient / High follow-through"] },
  { title: "Gigacasting aluminum underbody", lines: ["47% increase in torsional rigidity"] },
  { title: "CONTINENTAL 2nd-Gen Brake by wire System", lines: ["Faster braking response / 26km increased range"] },
  { title: "REPS Electronic Steering", lines: ["More responsive / Reduced steering wheel angle requirement by 10°"] },
];

// Phase 3 · 6 — Taihang Intelligent Control Chassis. Heading, a full-bleed chassis render (1920x658 on
// the artboard; the 16:9 source is cropped top and bottom) and the "Top-Tier Mechanical Quality"
// block: a 3x2 grid of pale grey spec cards (560px wide, 28px/24px gutters on the artboard).
export default function TaihangChassis() {
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLImageElement>(null);

  // Apple-style hierarchy that never makes the viewer wait: the heading and the line under it reveal on their own
  // trigger; the chassis image has its OWN independent trigger that fires as soon as the top ~12% of the image
  // container enters the viewport (it is not chained to the text timeline): opacity 0 -> 1 with a very light
  // desaturated / low-contrast resolve (no blur) and a hairline settle of the photo inside its clipped frame
  // (1.015 -> 1: the render is full-bleed, so a 0.985 shrink would show white slivers at the screen edges), in
  // 0.7s with no delay. Nothing inside the render moves independently. Skipped under reduced motion.
  useLayoutEffect(() => {
    const el = section.current;
    if (!el || motionOff("taihang", el)) return;
    const heading = el.querySelector<HTMLElement>("h2");
    const stopText = initCssReveal(
      el,
      heading,
      [
        { els: [heading], delay: 0, y: 10, duration: 900 },
        { els: [el.querySelector<HTMLElement>("h2 + p")], delay: 220, y: 10, duration: 900 },
      ],
      { triggerAt: 0.82 },
    );
    const stopImage = initCssReveal(
      el,
      frame.current,
      [
        { els: [frame.current], delay: 0, move: false, filter: "grayscale(0.35) contrast(0.9) brightness(1.02)", duration: 700 },
        { els: [photo.current], delay: 0, scale: 1.015, fade: false, duration: 700 },
      ],
      { triggerAt: 0.9 },
    );
    // Third, separate trigger: the "Top-Tier Mechanical Quality" block. The heading rises 10px, then the six cards
    // assemble in reading order (top row left -> right, a short pause, bottom row left -> right), each card one
    // unit (title + line together), fading in with a 12px rise (no scale/rotation). Once all six are in, their
    // light backgrounds settle from a hair lighter to the final grey, so the grid reads as fully assembled.
    const specHeading = el.querySelector<HTMLElement>("h3");
    const cards = [...el.querySelectorAll<HTMLElement>("ul > li")];
    const FINAL_BG = "#eeeff0"; // = the cards' static background below
    const SOFT_BG = "#f4f4f5";
    cards.forEach((c) => (c.style.background = SOFT_BG));
    const stopSpecs = initCssReveal(
      el,
      specHeading,
      [
        { els: [specHeading], delay: 0, y: 10, duration: 900 },
        ...cards.map((c, i) => ({ els: [c], delay: 350 + i * 110 + (i >= 3 ? 220 : 0), y: 12, duration: 900 })),
      ],
      {
        triggerAt: 0.82,
        onDone: () => {
          cards.forEach((c) => {
            c.style.transition = "background-color 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            c.style.backgroundColor = FINAL_BG;
          });
          window.setTimeout(() => {
            cards.forEach((c) => {
              c.style.transition = "";
              c.style.background = FINAL_BG; // identical to the static value
            });
          }, 800);
        },
      },
    );
    if (!stopSpecs) cards.forEach((c) => (c.style.background = FINAL_BG));
    return () => {
      stopText?.();
      stopImage?.();
      stopSpecs?.();
      cards.forEach((c) => (c.style.background = FINAL_BG));
    };
  }, []);

  return (
    <section ref={section} className="bg-white" style={{ paddingBottom: u(88, 48), color: INK }}>
      <div className="flex flex-col items-center px-5 text-center">
        <h2 className="font-normal" style={{ fontSize: u(58, 28), lineHeight: 1.15, letterSpacing: "0.005em" }}>
          Taihang Intelligent Control Chassis
        </h2>
        <p style={{ marginTop: u(14, 10), fontSize: u(22, 15), lineHeight: 1.4, letterSpacing: "0.01em" }}>
          Cross-domain integration. In-house algorithms. Endless evolution
        </p>
      </div>

      <div ref={frame} className="relative w-full overflow-hidden aspect-[4/3] md:aspect-[1920/658]" style={{ marginTop: u(68, 36) }}>
        {/* 16:9 photo in a 2.92:1 tile on desktop (painted ~1.0x viewport width); 4:3 tile on phones (~1.33x). */}
        <Image
          ref={photo}
          src={chassis}
          alt="AVATR 07 chassis: double-wishbone front and multi-link rear aluminum suspension"
          fill
          quality={100}
          sizes="(min-width: 768px) 103vw, 138vw"
          className="object-cover"
        />
      </div>

      <h3
        className="text-center font-normal"
        style={{ marginTop: u(24, 28), fontSize: u(30, 19), lineHeight: 1.2, letterSpacing: "0.005em" }}
      >
        Top-Tier Mechanical Quality
      </h3>

      <ul
        className="mx-auto grid grid-cols-1 px-5 md:max-w-[calc(var(--u)*1740)] md:grid-cols-3 md:px-0"
        style={{ marginTop: u(32, 20), columnGap: u(28, 12), rowGap: u(24, 12) }}
      >
        {SPECS.map((s) => (
          <li
            key={s.title}
            className="flex flex-col items-center justify-center text-center"
            style={{ background: "#eeeff0", minHeight: u(126, 0), padding: `${u(22, 18)} ${u(28, 20)}` }}
          >
            <p className="font-normal" style={{ fontSize: u(18.5, 14), lineHeight: 1.3 }}>
              {s.title}
            </p>
            {s.lines.map((l) => (
              <p key={l} style={{ marginTop: u(14, 8), fontSize: u(15, 12), lineHeight: 1.35 }}>
                {l}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
