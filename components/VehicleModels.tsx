"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import avatr07 from "../Landing page/Avatr 07 vehicle model image.jpg";
import avatr11 from "../Landing page/Avatr 11 vehicle model image.jpg";

const MODELS: { id: string; name: string; image: StaticImageData; href?: string }[] = [
  { id: "07", name: "AVATR 07", image: avatr07, href: "/avatr-07" },
  { id: "11", name: "AVATR 11", image: avatr11 },
];

const CTA_CLASS =
  "border border-black/25 px-10 py-4 text-tagline tracking-wide text-black transition-colors hover:bg-black hover:text-white md:px-12 md:py-5";

export default function VehicleModels() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = MODELS[activeIndex];

  const goPrev = () => setActiveIndex((i) => (i - 1 + MODELS.length) % MODELS.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % MODELS.length);

  return (
    <section id="models" className="scroll-mt-14 bg-white pt-10 pb-24 md:scroll-mt-[72px] md:pt-14 md:pb-36">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-h2 md:text-h2-lg text-center font-bold text-black">
          Vehicle Models
        </h2>

        <div className="mt-8 flex justify-center gap-10 md:mt-12 md:gap-16">
          {MODELS.map((model, i) => (
            <button
              key={model.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`text-xl md:text-2xl font-medium tracking-wide transition-colors ${
                i === activeIndex ? "text-black" : "text-black/35 hover:text-black/60"
              }`}
            >
              {model.name}
            </button>
          ))}
        </div>

        <div className="relative mt-16 flex items-center justify-center px-14 md:mt-24 md:px-24">
          <button
            type="button"
            aria-label="Previous model"
            onClick={goPrev}
            className="absolute left-0 z-10 flex h-10 w-10 items-center justify-center text-black/50 hover:text-black transition-colors md:left-4"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <polyline points="15 6 9 12 15 18" />
            </svg>
          </button>

          <div className="relative aspect-[2.3/1] w-full">
            <Image
              src={active.image}
              alt={active.name}
              fill
              className="object-contain"
              sizes="(min-width: 1280px) 1152px, 100vw"
              priority
            />
          </div>

          <button
            type="button"
            aria-label="Next model"
            onClick={goNext}
            className="absolute right-0 z-10 flex h-10 w-10 items-center justify-center text-black/50 hover:text-black transition-colors md:right-4"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </div>

        <div className="mt-14 flex justify-center md:mt-20">
          {active.href ? (
            <Link href={active.href} className={CTA_CLASS}>
              Know more about {active.name}
            </Link>
          ) : (
            <button type="button" className={CTA_CLASS}>
              Know more about {active.name}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
