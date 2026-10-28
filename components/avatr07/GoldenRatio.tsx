"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import golden from "../../avatr 07 page/golden ratio.webp";
import GoldenRatioLines from "./GoldenRatioLines";
import { INK, TAN, u } from "./scale";
import { initGoldenRatioMotion } from "./goldenRatioMotion";

const RATIOS = [
  { label: "Wheelbase-to-length ratio: ", value: "0.61" },
  { label: "Width-to-height ratio: ", value: "1.23" },
  { label: "Wheel-to-height ratio: ", value: "0.48" },
];

export default function GoldenRatio() {
  const frameRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLElement>(null);

  // One coordinated sequence, played once when the text block scrolls into view:
  // heading -> the three ratios -> the golden-ratio line drawing on the photo above.
  // Skipped under prefers-reduced-motion (everything is simply shown, complete).
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const text = textRef.current;
    if (!frame || !text || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return initGoldenRatioMotion(frame, text);
  }, []);

  return (
    <>
      {/* Photo and guide layer share ONE box that keeps the source's true
          aspect ratio (1920 x 772 at desktop width), so the overlay is locked
          to the photo. On desktop the box is width-driven and sits 3.5px
          (0.48% of the frame) above the frame top — the 19px-lower crop from
          the master — and the frame clips whatever overflows. On mobile the
          box is height-driven and centred. Nothing is drawn outside the box. */}
      <section ref={frameRef} className="relative aspect-[16/9] w-full overflow-hidden bg-white md:aspect-[1920/727]">
        <div className="absolute left-1/2 top-0 aspect-[3000/1206] h-full -translate-x-1/2 md:left-0 md:top-[-0.481%] md:h-auto md:w-full md:translate-x-0">
          <Image
            src={golden}
            alt="AVATR 07 side profile"
            fill
            quality={100}
            sizes="100vw"
            className="object-cover"
          />
          <GoldenRatioLines />
        </div>
      </section>

      <section
        ref={textRef}
        className="bg-white px-5 text-center"
        style={{ paddingTop: u(56, 44), paddingBottom: u(64, 48) }}
      >
        <h2
          data-fx="gr-title"
          className="font-normal"
          style={{ color: INK, fontSize: u(58, 30), lineHeight: 1.15, letterSpacing: "0.005em" }}
        >
          Golden Ratio Proportions
        </h2>
        <ul
          className="flex flex-col items-center font-normal md:flex-row md:justify-center"
          style={{ marginTop: u(20, 12), color: INK, fontSize: u(22, 14), lineHeight: 1.35, rowGap: 4 }}
        >
          {RATIOS.map((r, i) => (
            <li key={r.label} data-fx="gr-ratio" className="flex items-center">
              {i > 0 && (
                <span
                  aria-hidden
                  data-fx="gr-sep"
                  className="hidden md:block"
                  style={{ width: 1, height: u(20), background: "rgba(20,20,20,0.7)", margin: `0 ${u(18)}` }}
                />
              )}
              <span data-fx="gr-text">
                {r.label}
                <span data-fx="gr-num" className="relative inline-block">
                  {r.value}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
