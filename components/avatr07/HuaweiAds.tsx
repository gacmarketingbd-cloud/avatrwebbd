"use client";

import { useLayoutEffect, useRef, useState } from "react";
import AutoVideo from "./AutoVideo";
import ArrowButton from "./CarouselArrow";
import { INK, u } from "./scale";
import { motionOff } from "./mobileMotionSwitch";
import { initCssReveal } from "./cssReveal";

const SLIDES = [
  {
    title: "27 High-Sensitivity Sensors Across the Vehicle",
    video: "/videos/avatr-07/huawei-ads-1.mp4",
    label: "Huawei ADS 5 sensor suite",
    copy: [
      "1 lidar, 3 millimeter-wave radars (4D), 12 ultrasonic radars, and 11 high-definition cameras, with a four-layer redundant perception system providing 360° coverage.",
      "120°*20° ultra-wide field, 20Hz view scanning rate, 250m maximum detection range, which brings 20% improvement over the industry average greatly improving response speed in emergency scenarios.",
    ],
  },
  {
    title: "4D Millimeter-Wave Radars",
    video: "/videos/avatr-07/huawei-ads-2.mp4",
    label: "Huawei ADS 5 4D millimeter-wave radar",
    copy: [
      "Quadrupled detection accuracy, 65% reduced latency, 35% increased detection range, enhanced capability in handling extreme scenarios with immunity to sudden pedestrian appearances (ghost probes). Achieves higher success rates in narrow-space passing & parking, along with superior parking experience in low-light conditions.",
    ],
  },
] as const;

const FADE = "opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)";

// Phase 3 · 5 — HUAWEI ADS 5. Heading, then a 1498px card (artboard) with a video over a bordered
// text box (title left, copy right) and a circular arrow either side. Two slides cross-fade.
// Arrows sit outside the card on desktop and over the video's edges on phones.
export default function HuaweiAds() {
  const [index, setIndex] = useState(0);
  const section = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const copyBox = useRef<HTMLDivElement>(null);

  // Two independent Apple-style reveals (see cssReveal.ts): the text, and the image on its own trigger that reacts
  // directly to scroll position. Skipped under prefers-reduced-motion.
  useLayoutEffect(() => {
    const el = section.current;
    if (!el || motionOff("huawei", el)) return;
    const heading = el.querySelector<HTMLElement>("h2");
    // Stage 1 (text): the heading, then the description, once the text area is in the lower part of the screen.
    const stopText = initCssReveal(
      el,
      heading,
      [
        { els: [heading], delay: 0, y: 12, duration: 900 },
        { els: [el.querySelector<HTMLElement>("h2 + p")], delay: 220, y: 12, duration: 900 },
      ],
      { triggerAt: 0.82 },
    );
    // Stage 2 (image): its OWN trigger that reacts directly to scroll position: it starts as soon as the video card
    // properly enters the viewport (top edge 85% down the screen), with no delay and NOT chained behind the text
    // timeline. Quick and soft: opacity 0 -> 1 with a 0.99 -> 1 scale over 0.7s, no vertical slide; the spec text
    // under it and the arrows follow a beat later.
    const stopImage = initCssReveal(
      el,
      media.current,
      [
        { els: [media.current], delay: 0, scale: 0.99, duration: 700 },
        { els: [copyBox.current], delay: 220, y: 10, duration: 700 },
        { els: [...el.querySelectorAll<HTMLElement>("button[aria-label$='slide']")], delay: 380, move: false, duration: 600 },
      ],
      { triggerAt: 0.85 },
    );
    return () => {
      stopText?.();
      stopImage?.();
    };
  }, []);
  const go = (d: number) => setIndex((i) => (i + d + SLIDES.length) % SLIDES.length);

  return (
    <section ref={section} className="bg-white" style={{ paddingTop: u(88, 40), paddingBottom: u(83, 44), color: INK }}>
      <div className="flex flex-col items-center px-5 text-center">
        <h2 className="font-normal" style={{ fontSize: u(58, 28), lineHeight: 1.15, letterSpacing: "0.005em" }}>
          HUAWEI ADS 5
        </h2>
        <p style={{ marginTop: u(26, 12), maxWidth: u(1250, 340), fontSize: u(22, 15), lineHeight: 1.4, letterSpacing: "0.01em" }}>
          Utilizing an end-to-end architecture with 27 high-perception sensors, it enables seamless parking-to-parking
          full-scenario assisted driving
        </p>
      </div>

      <div className="relative mx-auto w-full px-5 md:max-w-[calc(var(--u)*1498)] md:px-0" style={{ marginTop: u(52, 28) }}>
        {/* the arrows are positioned against this wrapper so they track the video's vertical centre */}
        <div className="relative">
          <div ref={media} className="relative aspect-video w-full overflow-hidden bg-black md:aspect-[1498/724]">
            {SLIDES.map((s, i) => (
              <div key={s.video} className="absolute inset-0" style={{ opacity: i === index ? 1 : 0, transition: FADE }} aria-hidden={i !== index}>
                <AutoVideo src={s.video} label={s.label} active={i === index} className="absolute inset-0 h-full w-full object-cover" />
              </div>
            ))}
          </div>

          <ArrowButton
            dir="prev"
            onClick={() => go(-1)}
            className="left-3 border-white/80 bg-black/25 text-white hover:bg-black/45 md:left-auto md:right-full md:bg-transparent md:text-[#141414] md:hover:bg-black/5 md:border-[#141414] md:[margin-right:calc(var(--u)*57)]"
          />
          <ArrowButton
            dir="next"
            onClick={() => go(1)}
            className="right-3 border-white/80 bg-black/25 text-white hover:bg-black/45 md:left-full md:right-auto md:bg-transparent md:text-[#141414] md:hover:bg-black/5 md:border-[#141414] md:[margin-left:calc(var(--u)*57)]"
          />
        </div>

        <div
          ref={copyBox}
          className="grid"
          style={{ border: "1px solid rgba(20,20,20,0.4)", borderTop: 0 }}
          aria-live="polite"
        >
          {SLIDES.map((s, i) => (
            <div
              key={s.title}
              aria-hidden={i !== index}
              className="grid gap-4 md:grid-cols-[57fr_43fr] md:gap-0"
              style={{
                gridArea: "1 / 1",
                opacity: i === index ? 1 : 0,
                transition: FADE,
                padding: `${u(36, 20)} ${u(36, 20)} ${u(44, 24)}`,
              }}
            >
              <h3 className="font-normal md:max-w-[calc(var(--u)*540)]" style={{ fontSize: u(34, 22), lineHeight: 1.25, letterSpacing: "0.005em" }}>
                {s.title}
              </h3>
              <div style={{ fontSize: u(17, 12.5), lineHeight: 1.4 }} className="md:pr-6">
                {s.copy.map((c, k) => (
                  <p key={k} style={{ marginTop: k === 0 ? 0 : u(4, 4) }}>
                    {c}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
