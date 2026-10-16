"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import andesGray from "../../avatr 07 page/Andes Gray.webp";
import cottonWhite from "../../avatr 07 page/Cotton White.webp";
import mineralRockBlack from "../../avatr 07 page/Mineral Rock Black.webp";
import skylightSilk from "../../avatr 07 page/Skylight Silk.webp";
import damsonMetallic from "../../avatr 07 page/Damson Metallic.webp";
import { INK, u } from "./scale";
import { initHeadingReveal } from "./headingReveal";

// `dot` gradients are temporary swatch fills (to be replaced by supplied dots).
const COLOURS = [
  { name: "Andes Gray", image: andesGray, dot: "linear-gradient(135deg,#a4a4a4,#6c6c6c)" },
  { name: "Cotton White", image: cottonWhite, dot: "linear-gradient(135deg,#ffffff,#d6d6d6)" },
  { name: "Mineral Rock Black", image: mineralRockBlack, dot: "linear-gradient(135deg,#3d3d3d,#000000)" },
  { name: "Skylight Silk", image: skylightSilk, dot: "linear-gradient(135deg,#c9d9ec,#7f9fc4)" },
  { name: "Damson Metallic", image: damsonMetallic, dot: "linear-gradient(135deg,#63305f,#2b0e30)" },
];

export default function ColourPicker() {
  const [active, setActive] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Heading only: rises ~18px while fading in, once, as it enters the viewport. Skipped under
  // prefers-reduced-motion (the heading is simply shown).
  useLayoutEffect(() => {
    const el = headingRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return initHeadingReveal(el);
  }, []);

  return (
    <section
      className="overflow-x-clip bg-white text-center"
      style={{ paddingTop: u(80, 56), paddingBottom: u(140, 96) }}
    >
      <h2
        ref={headingRef}
        className="px-5 font-normal"
        style={{ color: INK, fontSize: u(58, 28), lineHeight: 1.15, letterSpacing: "0.005em" }}
      >
        Colour Inspired by Nature
      </h2>

      {/* Window onto the car renders: the source PNGs carry a lot of empty
          margin, so only the car + shadow band is shown. */}
      <div
        className="relative left-1/2 aspect-[1500/480] w-[128vw] -translate-x-1/2 md:w-[calc(var(--u)*1000)]"
        style={{ marginTop: u(96, 28) }}
      >
        {COLOURS.map((c, i) => (
          <Image
            key={c.name}
            src={c.image}
            alt={i === active ? `AVATR 07 in ${c.name}` : ""}
            aria-hidden={i !== active}
            fill
            priority={i === 0}
            quality={100}
            sizes="(min-width: 1920px) 1000px, (min-width: 768px) 53vw, 128vw"
            className="object-cover object-[50%_51.8%] transition-opacity duration-500 ease-in-out"
            style={{ opacity: i === active ? 1 : 0 }}
          />
        ))}
      </div>

      <div
        role="radiogroup"
        aria-label="Exterior colour"
        className="relative mx-auto flex justify-center md:translate-x-[calc(var(--u)*24)]"
        style={{ marginTop: u(84, 28) }}
      >
        {COLOURS.map((c, i) => {
          const selected = i === active;
          return (
            <button
              key={c.name}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={c.name}
              onClick={() => setActive(i)}
              className="relative flex items-center justify-center"
              style={{ width: u(100, 52), height: u(56, 48) }}
            >
              <span
                className="absolute rounded-full bg-[#e6e6e6] transition-opacity duration-300"
                style={{ width: u(56, 40), height: u(56, 40), opacity: selected ? 1 : 0 }}
              />
              <span
                className="relative rounded-full ring-1 ring-black/5"
                style={{ width: u(38, 28), height: u(38, 28), background: c.dot }}
              />
              {selected && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
                  style={{ top: "100%", marginTop: u(30, 10), color: INK, fontSize: u(17, 13), lineHeight: 1.3 }}
                >
                  {c.name}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
