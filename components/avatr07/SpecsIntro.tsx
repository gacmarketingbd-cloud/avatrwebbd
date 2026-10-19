"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import ifAward from "../../avatr 07 page/2025-Germany-iF-Design-Award.png";
import idaAward from "../../avatr 07 page/2024-USA-IDA-International.png";
import SectionHeading from "./SectionHeading";
import { INK, TAN, u } from "./scale";
import { initSpecsIntroMotion } from "./specsIntroMotion";

const SPECS = [
  { value: "4825", unit: "mm", label: "Length" },
  { value: "1980", unit: "mm", label: "Width" },
  { value: "1620", unit: "mm", label: "Height" },
  { value: "2940", unit: "mm", label: "Wheelbase" },
];

const AWARDS = [
  { src: ifAward, alt: "iF Design Award", caption: ["2025 Germany", "iF Design Award"] },
  {
    src: idaAward,
    alt: "IDA Design Awards",
    caption: ["2024 USA IDA International", "Design Award Gold Prize"],
  },
];

export default function SpecsIntro() {
  const ref = useRef<HTMLElement>(null);

  // Scroll-triggered, play-once reveal (GSAP + ScrollTrigger). Skipped entirely under
  // prefers-reduced-motion, so the section is simply shown in its final state.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return initSpecsIntroMotion(el);
  }, []);

  return (
    <section ref={ref} className="bg-white px-5" style={{ paddingTop: u(56, 44), paddingBottom: u(68, 50) }}>
      <SectionHeading
        title="Futuristic Design"
        titleSize={58}
        subtitleSize={22}
        ruleGap={20}
        ruleWidth={520}
        subtitleGap={26}
        subtitle="Flowing lines and an elegantly dynamic posture – breaking boundaries and convention"
      />

      <dl
        className="mx-auto grid grid-cols-2 justify-items-center gap-x-6 gap-y-10 md:flex md:justify-center md:gap-0"
        style={{ marginTop: u(76, 36) }}
      >
        {SPECS.map((s) => (
          <div key={s.label} data-fx="spec" className="flex flex-col items-center md:mx-[calc(var(--u)*36)]">
            <dd data-fx="spec-value" className="flex items-baseline whitespace-nowrap" style={{ lineHeight: 1.1 }}>
              <span data-fx="spec-num" className="relative font-normal" style={{ color: TAN, fontSize: u(45, 30) }}>
                {s.value}
              </span>
              <span className="ml-[0.25em]" style={{ color: INK, fontSize: u(18, 12) }}>
                {s.unit}
              </span>
            </dd>
            <dt data-fx="spec-label" style={{ color: INK, fontSize: u(21, 13), lineHeight: 1.3, marginTop: u(5, 0) }}>{s.label}</dt>
          </div>
        ))}
      </dl>

      <div
        className="mx-auto flex flex-wrap items-start justify-center"
        style={{ marginTop: u(50, 36), columnGap: u(116, 32), rowGap: 32 }}
      >
        {AWARDS.map((a) => (
          <figure key={a.alt} data-fx="award" className="flex flex-col items-center">
            <Image
              src={a.src}
              alt={a.alt}
              quality={100}
              sizes="108px"
              style={{ width: u(108, 72), height: "auto" }}
            />
            <figcaption
              data-fx="award-cap"
              className="text-center text-[#141414]"
              style={{ marginTop: u(15, 10), fontSize: u(12.5, 11), lineHeight: 1.2 }}
            >
              {a.caption[0]}
              <br />
              {a.caption[1]}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
