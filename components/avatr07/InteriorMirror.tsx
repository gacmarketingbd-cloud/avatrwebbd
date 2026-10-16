"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import mirror from "../../avatr 07 page/The FHD digital interior mirror.webp";
import fridge from "../../avatr 07 page/fridge.webp";
import wireless from "../../avatr 07 page/Wireless charging.webp";
import { TAN, u } from "./scale";
import { initInteriorMirrorReveal } from "./interiorMirrorMotion";

// `copy` is one paragraph per entry; `note` is an optional smaller footnote.
const SLIDES = [
  {
    title: "FHD digital interior mirror",
    copy: ["Beyond visual limits, crystal-clear visibility day or night rain or shine, ensuring assured safety in every maneuver."],
    image: mirror,
    alt: "AVATR 07 FHD digital interior mirror showing the road behind",
    sizes: "(min-width: 768px) 60vw, 100vw",
  },
  {
    title: "Intelligent car refrigerator",
    copy: [
      "Cooling and heating on the go, 4L large capacity, rapid temperature control, extended thermal retention, perfect for family travel needs",
      "Preserve summer’s coolness, retain winter’s warmth, enjoy freshness anywhere on the Go.",
    ],
    image: fridge, alt: "AVATR 07 centre console fridge holding drinks", sizes: "(min-width: 768px) 60vw, 100vw" },
  {
    title: "50W mobile phone fast charging*",
    copy: ["Charge anytime, power up instantly"],
    note: "*It is only available for the mobile phones with 50W charging protocol, with a wireless charging power up to 50W.",
    image: wireless, alt: "AVATR 07 wireless charging pad in the centre console", sizes: "(min-width: 768px) 60vw, 100vw" },
] as const;

const FADE = "opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)";

function Arrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === "prev" ? "M14.5 7.5 10 12l4.5 4.5" : "M9.5 7.5 14 12l-4.5 4.5"} />
    </svg>
  );
}

// Phase 2 · 6 — FHD digital interior mirror: a wide photo beside a tan panel (1152 + 624px on the
// artboard, 24px gutter, 60px side margins) with a 3-slide pager. Desktop keeps the pair side by side;
// phones stack them.
export default function InteriorMirror() {
  const [index, setIndex] = useState(0);
  const imagePanel = useRef<HTMLDivElement>(null);

  // Image panel only: a soft fade + 0.985 -> 1 scale when it enters the viewport (once). The text panel stays
  // static. Skipped under prefers-reduced-motion.
  useLayoutEffect(() => {
    const el = imagePanel.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return initInteriorMirrorReveal(el);
  }, []);
  const go = (d: number) => setIndex((i) => (i + d + SLIDES.length) % SLIDES.length);

  return (
    <section className="bg-white px-5 md:px-[calc(var(--u)*60)]" style={{ paddingTop: u(121, 44), paddingBottom: u(83, 44) }}>
      <div className="grid md:grid-cols-[1152fr_624fr]" style={{ gap: u(24, 12) }}>
        <div ref={imagePanel} className="relative aspect-[1152/617] w-full overflow-hidden bg-black">
          {SLIDES.map((s, i) => (
            <Image
              key={s.image.src}
              src={s.image}
              alt={i === index ? s.alt : ""}
              aria-hidden={i !== index}
              fill
              quality={100}
              sizes={s.sizes}
              className="object-cover"
              style={{ opacity: i === index ? 1 : 0, transition: FADE, zIndex: i === index ? 1 : 0 }}
            />
          ))}
        </div>

        <div
          className="relative flex flex-col text-white"
          style={{ background: TAN, padding: `${u(56, 28)} ${u(36, 20)} ${u(28, 20)}`, minHeight: u(300, 0) }}
        >
          <div aria-live="polite" className="grid">
            {SLIDES.map((s, i) => (
              <div
                key={s.image.src}
                aria-hidden={i !== index}
                style={{ gridArea: "1 / 1", opacity: i === index ? 1 : 0, transition: FADE }}
              >
                <h2 className="font-normal" style={{ fontSize: u(34, 22), lineHeight: 1.2 }}>
                  {s.title.endsWith("*") ? (
                    <>
                      {s.title.slice(0, -1)}
                      {/* the footnote mark sits above the cap line, as in the supplied copy screenshot */}
                      <span style={{ position: "relative", top: "-0.34em" }}>*</span>
                    </>
                  ) : (
                    s.title
                  )}
                </h2>
                {s.copy.map((c, k) => (
                  <p key={k} style={{ marginTop: k === 0 ? u(28, 14) : u(6, 4), fontSize: u(17, 13), lineHeight: 1.5 }}>
                    {c}
                  </p>
                ))}
                {"note" in s && (
                  <p style={{ marginTop: u(26, 14), fontSize: u(14, 12), lineHeight: 1.5, opacity: 0.9 }}>{s.note}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex-1" style={{ minHeight: u(36, 28) }} />
          <div
            className="flex items-center self-start text-white"
            style={{ gap: u(30, 16) }}
          >
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(-1)}
              className="rounded-full border-[1.5px] border-white transition-colors hover:bg-white/15"
              style={{ width: u(44, 40), height: u(44, 40) }}
            >
              <Arrow dir="prev" />
            </button>
            <span aria-live="off" style={{ fontSize: u(26, 17), minWidth: u(44, 34), textAlign: "center", lineHeight: 1 }}>
              {index + 1}/{SLIDES.length}
            </span>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(1)}
              className="rounded-full border-[1.5px] border-white transition-colors hover:bg-white/15"
              style={{ width: u(44, 40), height: u(44, 40) }}
            >
              <Arrow dir="next" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
