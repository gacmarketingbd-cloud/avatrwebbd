"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import CarouselArrow from "./CarouselArrow";
import SpecCaption, { type SpecStat } from "./SpecCaption";
import quiet from "../../avatr 07 page/quiet with gasoline or electricity.jpg";
import refuel from "../../avatr 07 page/Refueling and charge.webp";
import powerful from "../../avatr 07 page/Powerful performance with or without charge.webp";
import { INK, u } from "./scale";
import { initCssReveal } from "./cssReveal";
import { usePhotoVariants } from "./photoVariants";

const SPEC_NOTE =
  "*Specifications may vary depending on configuration. Data is based on announced or engineering development simulation values, which may be affected by weather, road condition, battery SOC, load, tire and other test factors, and is used for reference only";

const SLIDES: {
  id: string;
  title: string;
  image: typeof quiet;
  alt: string;
  lines: string[];
  stats: SpecStat[];
  note?: string;
}[] = [
  {
    id: "quiet",
    title: "Quiet with gasoline or electricity",
    image: quiet,
    alt: "Two passengers relaxing in the quiet AVATR 07 cabin",
    lines: [
      "Interior noise during idle charging as low as 35.7dB(A)*, Noise difference inbetween engine start-stop less than 1dB(A)*, 60dB(A) Noise level @ 100km/h*",
    ],
    stats: [
      { value: "35.7", unit: "dB(A)", label: "Interior noise during idle charging" },
      { value: "<1", unit: "dB(A)", label: "Noise difference inbetween engine start stop less" },
    ],
    note: SPEC_NOTE,
  },
  {
    id: "refuel",
    title: "Refueling and charging are both worry-free",
    image: refuel,
    alt: "AVATR 07 hybrid platform with the battery charging at an AVATR charger",
    lines: [
      "CATL freevoy super hybrid battery 52.01kWh battery capacity",
      "5C peak charging rate Less than 10min to charge from 30% to 80%",
      "333km CLTC pure electric range 1200km CLTC overall electric range",
      "92 #gasoline needed only",
    ],
    stats: [
      { value: "52.01", unit: "kWh", label: "CATL's Shenxing superfast charging battery" },
      { value: "5C", unit: "", label: "Peak charging rate" },
    ],
  },
  {
    id: "powerful",
    title: "Powerful Performance with or Without Charge",
    image: powerful,
    alt: "AVATR 07 parked in a sunlit courtyard",
    lines: ["231kW/367N·m 7-in-1 Rear PMSM Drives"],
    stats: [
      { value: "5.1", unit: "s", label: "Full charge" },
      { value: "5.9", unit: "s", label: "Low charge" },
    ],
    note: SPEC_NOTE + ".",
  },
];

const FADE = "opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)";

// Phase 3 · 8 — Kunlun REEV system / Full-stack 800V SiC EV platform. One 1452px card (artboard) with a
// 3-slide cross-fading slider: image on top (1632x725, object-cover), a bordered caption box below with
// the slide's title, copy, figures and footnote. Arrows sit outside the card on desktop and over the
// image edges on phones. On short desktop viewports the card narrows (image height follows) so that
// image + caption stay within one screen: width <= (viewport height - header/margins - caption) / image aspect.
export default function KunlunPowertrain() {
  const section = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const { active: index, shown, select, track, mounted } = usePhotoVariants(0, media);
  const captionBox = useRef<HTMLDivElement>(null);

  // Quick, responsive Apple-style reveal (see cssReveal.ts), with its own timings for this section: the heading and
  // the line under it reveal briefly (7-8px rise, 0.55s); the large image has its OWN independent trigger that
  // fires as soon as its top edge is properly in view (88% down the screen) with no delay and is not chained
  // behind the text: a clean opacity + 0.99 -> 1 fade in 0.55s (no blur, no wash, no vertical slide). The spec
  // caption under it (0.5s) and the understated arrows (opacity only) follow almost immediately. Skipped under
  // prefers-reduced-motion.
  useLayoutEffect(() => {
    const el = section.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const heading = el.querySelector<HTMLElement>("h2");
    const stopText = initCssReveal(
      el,
      heading,
      [
        { els: [heading], delay: 0, y: 7, duration: 550 },
        { els: [el.querySelector<HTMLElement>("h2 + p")], delay: 100, y: 8, duration: 550 },
      ],
      { triggerAt: 0.88 },
    );
    const stopImage = initCssReveal(
      el,
      media.current,
      [
        { els: [media.current], delay: 0, scale: 0.99, duration: 550 },
        { els: [captionBox.current], delay: 80, y: 8, duration: 500 },
        { els: [...el.querySelectorAll<HTMLElement>("button[aria-label$='slide']")], delay: 150, move: false, duration: 450 },
      ],
      { triggerAt: 0.88 },
    );
    return () => {
      stopText?.();
      stopImage?.();
    };
  }, []);
  const go = (d: number) => select((index + d + SLIDES.length) % SLIDES.length);

  return (
    <section ref={section} className="bg-white" style={{ paddingTop: u(24, 0), paddingBottom: u(83, 44), color: INK }}>
      <div className="flex flex-col items-center px-5 text-center">
        <h2 className="font-normal" style={{ maxWidth: u(1150, 340), fontSize: u(58, 28), lineHeight: 1.25, letterSpacing: "0.005em" }}>
          Kunlun REEV system / Full-stack 800V SiC EV platform
        </h2>
        <p style={{ marginTop: u(22, 12), fontSize: u(22, 15), lineHeight: 1.4, letterSpacing: "0.01em" }}>
          Two powertrain option, new chapter in intelligent power
        </p>
      </div>

      <div className="relative mx-auto w-full px-5 md:max-w-[min(calc(var(--u)*1452),calc((100svh-128px-var(--u)*301)/0.444))] md:px-0" style={{ marginTop: u(40, 28) }}>
        <div className="relative">
          <div ref={media} className="relative aspect-video w-full overflow-hidden bg-[#d9d9db] md:aspect-[1632/725]">
            {SLIDES.map((s, i) => mounted(i) && (
              <Image
                key={s.id}
                src={s.image}
                alt={i === shown ? s.alt : ""}
                aria-hidden={i !== shown}
                fill
                quality={100}
                sizes="(min-width: 768px) 76vw, 100vw"
                className="object-cover"
                style={{ opacity: i === shown ? 1 : 0, transition: FADE, zIndex: i === shown ? 1 : 0 }}
                {...track(i)}
              />
            ))}
          </div>

          <CarouselArrow
            dir="prev"
            onClick={() => go(-1)}
            className="left-3 border-white/80 bg-black/25 text-white hover:bg-black/45 md:left-auto md:right-full md:border-[#141414] md:bg-transparent md:text-[#141414] md:hover:bg-black/5 md:[margin-right:min(calc(var(--u)*57),max(4px,calc((100vw-var(--u)*1452)/2-46px)))]"
          />
          <CarouselArrow
            dir="next"
            onClick={() => go(1)}
            className="right-3 border-white/80 bg-black/25 text-white hover:bg-black/45 md:left-full md:right-auto md:border-[#141414] md:bg-transparent md:text-[#141414] md:hover:bg-black/5 md:[margin-left:min(calc(var(--u)*57),max(4px,calc((100vw-var(--u)*1452)/2-46px)))]"
          />
        </div>

        <div ref={captionBox} style={{ border: "1px solid rgba(20,20,20,0.4)", borderTop: 0 }} aria-live="polite">
          <SpecCaption
            slides={SLIDES.map((s) => ({ id: s.id, title: s.title, description: s.lines.join(" "), stats: s.stats, note: s.note }))}
            index={index}
          />
        </div>
      </div>
    </section>
  );
}
