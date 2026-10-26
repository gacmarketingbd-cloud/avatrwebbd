"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import type { CSSProperties } from "react";
import acoustic from "../../avatr 07 page/The Meridian sound system- Best Acoustic Materials.webp";
import reQ from "../../avatr 07 page/RE q.png";
import digitalPrecision from "../../avatr 07 page/Digital Precision.png";
import horizon from "../../avatr 07 page/Horizon.png";
import perfectBalance from "../../avatr 07 page/Perfect Balance.png";
import trueTime from "../../avatr 07 page/True time.png";
import intelliQ from "../../avatr 07 page/Intelli-Q.png";
import { u } from "./scale";
import { motionOff } from "./mobileMotionSwitch";
import { initAcousticIntro } from "./acousticMotion";
import { initAlgorithmIntro } from "./algorithmMotion";

const BG = "#b08e76"; // sampled from the reference's tan field

const MATERIALS = [
  {
    title: "Treble Speaker",
    body: "The dome material-aluminum-magnesium alloy+artificial silk fiber ring; light weight, high strength, light and bright tone, delicate sound.",
  },
  {
    title: "Central Midrange Speaker",
    body: "Glass fiber+foam composite diaphragm. Improvement in mid- and high-frequency response.The sound quality is bright and brisk.",
  },
  {
    title: "Midrange/surround sound speakers",
    body: "Made of glass fiber. Presence of natural sound, outstanding response speed of the speaker. Rich, powerful and full of depth",
  },
  {
    title: "Air Subwoofer",
    body: "Dual coil 70W+70W ultra-high power. Membrane paper + rubber composite diaphragm. Sound quality is rich and powerful",
  },
];

// Icon PNGs already include their own caption (RE-Q, DIGITAL PRECISION, ...).
const ALGORITHMS = [
  { icon: reQ, alt: "RE-Q", title: "RE-Q", body: "more natural bass effects" },
  { icon: digitalPrecision, alt: "Digital Precision", title: "Digital Precision", body: "perfect sound quality regardless of the sound sources" },
  { icon: horizon, alt: "Horizon", title: "Horizon", body: "Perfect sound quality throughout the cabin" },
  { icon: perfectBalance, alt: "Perfect Balance", title: "Perfect Balance", body: "low volume balancing" },
  { icon: trueTime, alt: "True time", title: "True time", body: "Clear and lifelike sound" },
  { icon: intelliQ, alt: "Intelli-Q", title: "Intelli-Q", body: "the best audio experience with windows open and at high speeds" },
];

// Phase 2 · 5 — acoustic materials. The speaker photo sits at the top at its own aspect (1920x751 on
// the artboard) and fades into the tan field the rest of the section is drawn on; the headings, the
// 2x2 material boxes and the six algorithm icons are all live text over that field.
export default function AcousticMaterials() {
  const ref = useRef<HTMLElement>(null);

  // Main heading + the four material cards (acousticMotion.ts) and the algorithms heading + six items
  // (algorithmMotion.ts), each once when its own heading comes into view. Skipped under prefers-reduced-motion.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || motionOff("materials", el)) return;
    const stopCards = initAcousticIntro(el);
    const stopAlgos = initAlgorithmIntro(el);
    return () => {
      stopCards?.();
      stopAlgos?.();
    };
  }, []);

  return (
    <section
      ref={ref}
      className="acoustic-stable relative overflow-hidden text-white [--ih:75vw] md:[--ih:calc(var(--u)*751)]"
      style={{ background: BG, paddingBottom: u(96, 48) } as CSSProperties}
    >
      <div className="absolute inset-x-0 top-0" style={{ height: "var(--ih)" }}>
        {/* 2.56:1 photo in a 2.56:1 box on desktop (1.0x viewport width); 4:3 box on phones crops it to ~1.9x. */}
        <Image
          src={acoustic}
          alt="Meridian speaker grille in the AVATR 07 door trim"
          fill
          quality={100}
          sizes="(min-width: 768px) 100vw, 192vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, rgba(176,142,118,0) 38%, ${BG} 100%)` }}
        />
      </div>

      <div className="relative px-5" style={{ paddingTop: "calc(var(--ih) * 0.6)" }}>
        <h2 className="text-center font-normal" style={{ fontSize: u(34, 20), lineHeight: 1.2 }}>
          The Meridian sound system- Best Acoustic Materials
        </h2>

        <div
          className="mx-auto grid grid-cols-1 md:grid-cols-2"
          style={{ maxWidth: u(1732), marginTop: u(36, 24), gap: u(14, 12) }}
        >
          {MATERIALS.map((m) => (
            <div
              key={m.title}
              data-fx="card"
              className="relative flex flex-col items-center justify-center text-center"
              style={{ border: "1px solid rgba(255,255,255,0.45)", padding: `${u(18, 16)} ${u(56, 20)}`, minHeight: u(150, 0) }}
            >
              <h3 data-fx="card-title" className="font-normal" style={{ fontSize: u(21, 15), lineHeight: 1.3 }}>
                {m.title}
              </h3>
              <p data-fx="card-desc" style={{ marginTop: u(16, 8), fontSize: u(17, 12.5), lineHeight: 1.35 }}>{m.body}</p>
            </div>
          ))}
        </div>

        <h2 data-fx="algo-heading" className="text-center font-normal" style={{ marginTop: u(70, 40), fontSize: u(34, 20), lineHeight: 1.2 }}>
          Exclusive 6 sound effect algorithms from Meridian Audio
        </h2>

        <ul
          className="mx-auto grid grid-cols-1 md:grid-cols-3"
          style={{ maxWidth: u(1732), marginTop: u(46, 28), columnGap: u(40, 20), rowGap: u(34, 24) }}
        >
          {ALGORITHMS.map((a) => (
            <li key={a.title} data-fx="algo" className="flex items-center" style={{ gap: u(22, 14) }}>
              {/* Small PNGs are served untouched (unoptimized) so their edges are never re-encoded. */}
              <Image src={a.icon} alt={a.alt} unoptimized className="h-auto shrink-0" style={{ width: u(100, 68) }} />
              <div data-fx="algo-text">
                <h3 className="font-normal" style={{ fontSize: u(21, 15), lineHeight: 1.3 }}>
                  {a.title}
                </h3>
                <p style={{ marginTop: u(6, 3), fontSize: u(17, 12.5), lineHeight: 1.35 }}>{a.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
