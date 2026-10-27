"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import panoramic from "../../avatr 07 page/Panoramic View.webp";
import { u } from "./scale";
import { byViewport, initSunroofCopyMobile } from "./mobileMotion";
import { initSunroofCopy } from "./sunroofMotion";

// The copy as tokens: plain words stay at body size and a little dimmer (secondary); the three figures
// (number + small unit) are larger and full white, inline in the sentence like the reference.
type Token = string | { n: string; unit: string };
const LINES: Token[][] = [
  [{ n: "1.46", unit: "M²" }, ..."ultra-large panoramic sunroof, with".split(" "), { n: "99.99", unit: "%" }, ..."UV blockage and".split(" ")],
  [{ n: "98.1", unit: "%" }, ..."IR rejection delivering outstanding sun protection and heat insulation".split(" ")],
];

// Phase 2 · 3 — panoramic sunroof. Full-bleed photo (1920x1040 on the artboard) with the centred copy over
// the sky. The photo never animates; only the copy does (see sunroofMotion.ts).
export default function PanoramicSunroof() {
  const copy = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = copy.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return byViewport(() => initSunroofCopy(el), () => initSunroofCopyMobile(el));
  }, []);

  return (
    <section className="relative aspect-[4/5] w-full overflow-hidden bg-black sm:aspect-[4/3] md:aspect-[1920/1040]">
      {/* 1.84:1 photo cropped into the tile: ~1.0x viewport width on desktop, 1.38x at 4:3, 2.3x at 4:5. */}
      <Image
        src={panoramic}
        alt="AVATR 07 panoramic sunroof and cabin"
        fill
        quality={100}
        // Phones ask for the 2048px copy (the 1920px one below 3x density), never 3840: for this photo the server answers
        // 3840 with the untouched original (~50 megapixels), which a phone decodes slowly and paints block by block.
        sizes="(min-width: 768px) 100vw, (min-resolution: 3.1dppx) 510px, 680px"
        className="object-cover"
      />
      <p
        ref={copy}
        className="sunroof-stable absolute inset-x-0 top-0 mx-auto px-5 text-center text-white"
        style={{ paddingTop: u(104, 40), maxWidth: u(1000, 340), fontSize: u(22, 15), lineHeight: 1.55, letterSpacing: "0.01em" }}
      >
        {/* Two lines on desktop (the first ends after "and", as in the reference), each its own masked block that
            is as wide as its text, so the left-to-right wipe meets the text straight away. */}
        {LINES.map((tokens, li) => (
          <span key={li} data-line className="relative mx-auto block w-fit max-w-full">
            {tokens.map((t, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                {typeof t === "string" ? (
                  <span style={{ color: "rgba(255,255,255,0.88)" }}>{t}</span>
                ) : (
                  <span data-hl className="inline-block" style={{ transformOrigin: "50% 50%" }}>
                    <span style={{ fontSize: "1.4em", lineHeight: 1 }}>{t.n}</span>
                    <span style={{ fontSize: "0.8em", lineHeight: 1 }}>{t.unit}</span>
                  </span>
                )}
              </Fragment>
            ))}
          </span>
        ))}
      </p>
    </section>
  );
}
