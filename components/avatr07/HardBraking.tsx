"use client";

import { useLayoutEffect, useRef } from "react";
import AutoVideo from "./AutoVideo";
import { INK, u } from "./scale";
import { initCssReveal } from "./cssReveal";

// Phase 3 · 7 — First Perceive, Then Adjust Quickly. Heading, then a 1630px card (artboard): the
// hard-braking video (the 16:9 source is cropped top and bottom to 1630x725) over a bordered caption box.
export default function HardBraking() {
  const section = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);

  // Apple-style reveal (see cssReveal.ts). Text: the heading, then the line under it. Image: its OWN independent
  // trigger that reacts directly to scroll position (it is NOT chained to the heading/line timeline): it starts as
  // soon as the top of the video card is properly in view (top edge 85% down the screen), no delay, a clean
  // fade, opacity 0 -> 1 with a 0.99 -> 1 scale over 0.65s. No blur, no filter, no wash: the footage has its
  // true colour, contrast and brightness from the first frame. The caption under it follows a beat later.
  // Skipped under prefers-reduced-motion.
  useLayoutEffect(() => {
    const el = section.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const heading = el.querySelector<HTMLElement>("h2");
    const line = el.querySelector<HTMLElement>("h2 + p");
    let headingDone!: () => void;
    const gate1 = new Promise<void>((r) => (headingDone = r));
    const stopHeading = initCssReveal(el, heading, [{ els: [heading], delay: 0, y: 10, duration: 900 }], { triggerAt: 0.82, onDone: () => headingDone() });
    const stopLine = initCssReveal(el, line, [{ els: [line], delay: 150, y: 10, duration: 900 }], { triggerAt: 0.8, gate: gate1 });
    const stopImage = initCssReveal(
      el,
      media.current,
      [
        { els: [media.current], delay: 0, scale: 0.99, duration: 650 },
        { els: [caption.current], delay: 200, y: 10, duration: 650 },
      ],
      { triggerAt: 0.85 },
    );
    return () => {
      stopHeading?.();
      stopLine?.();
      stopImage?.();
    };
  }, []);

  return (
    <section ref={section} className="bg-white" style={{ paddingBottom: u(88, 48), color: INK }}>
      <div className="flex flex-col items-center px-5 text-center">
        <h2 className="font-normal" style={{ fontSize: u(58, 28), lineHeight: 1.15, letterSpacing: "0.005em" }}>
          First Perceive, Then Adjust Quickly
        </h2>
        <p style={{ marginTop: u(14, 10), fontSize: u(22, 15), lineHeight: 1.4, letterSpacing: "0.01em" }}>
          Chassis X Powertrain X ADAS, Cross-Domain Data Fusion
        </p>
      </div>

      <div className="mx-auto w-full px-5 md:max-w-[calc(var(--u)*1630)] md:px-0" style={{ marginTop: u(66, 28) }}>
        <div ref={media} className="relative aspect-video w-full overflow-hidden bg-black md:aspect-[1630/725]">
          <AutoVideo
            src="/videos/avatr-07/hard-braking.mp4"
            label="AVATR 07 stable under hard braking"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div
          ref={caption}
          className="text-center"
          style={{ border: "1px solid rgba(20,20,20,0.4)", borderTop: 0, padding: `${u(32, 20)} ${u(24, 16)} ${u(54, 28)}` }}
        >
          <h3 className="font-normal" style={{ fontSize: u(30, 19), lineHeight: 1.2, letterSpacing: "0.005em" }}>
            Stable in Hard Braking, Elegant in Light Braking
          </h3>
          <p style={{ marginTop: u(16, 8), fontSize: u(17, 12.5), lineHeight: 1.4 }}>
            ICST 2.0 Comfort Braking System 85% reduction in braking pitch
          </p>
        </div>
      </div>
    </section>
  );
}
