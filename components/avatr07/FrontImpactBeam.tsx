import Image from "next/image";
import beam from "../../avatr 07 page/Beam Stracture.webp";
import { INK, u } from "./scale";

// Phase 4 · 4 — Robust Front Impact Beam Structure. Mirror of the door-sill block: copy on the left (x148),
// photo flush to the right edge (904x595 on the artboard; the supplied 2844x1872 file has a thin transparent
// strip on its left). Below md the photo stacks above the text, like the previous section.
export default function FrontImpactBeam() {
  return (
    <section className="bg-white" style={{ color: INK, paddingTop: u(40, 0), paddingBottom: u(80, 40) }}>
      <div className="relative mx-auto w-full max-w-[1920px] md:h-[calc(var(--u)*595)]">
        <div className="relative aspect-[2844/1872] w-full md:absolute md:right-0 md:top-0 md:h-full md:w-auto">
          <Image
            src={beam}
            alt="Cut-away of the front impact beam and crash structure"
            fill
            quality={100}
            sizes="(min-width: 1920px) 904px, (min-width: 768px) 47vw, 100vw"
            className="object-cover"
          />
        </div>

        <div
          className="px-5 md:absolute md:left-[calc(var(--u)*148)] md:right-[calc(var(--u)*990)] md:top-[calc(var(--u)*235)] md:px-0"
          style={{ marginTop: u(0, 28) }}
        >
          <h3 className="font-normal" style={{ fontSize: u(34, 22), lineHeight: 1.3, letterSpacing: "0.005em" }}>
            Robust Front Impact
            <br />
            Beam Structure
          </h3>
          <p style={{ marginTop: u(46, 14), maxWidth: u(520, 340), fontSize: u(16, 12.5), lineHeight: 1.45, opacity: 0.55 }}>
            81% coverage for front protection, with a class-leading material thickness of 4mm
          </p>
        </div>
      </div>
    </section>
  );
}
