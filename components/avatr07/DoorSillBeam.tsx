import Image from "next/image";
import beam from "../../avatr 07 page/Door still bim.webp";
import { INK, u } from "./scale";

// Phase 4 · 3 — Seven-Grid Ultra-Long 1,968mm Energy-Absorbing Door Sill Beam. Full-height photo flush to the
// left edge (888x574 on the artboard; the supplied 3342x2160 file has no transparent margin) and the copy
// column at x983, vertically centred in the image's height. Below md the photo stacks above the text.
export default function DoorSillBeam() {
  return (
    <section className="bg-white" style={{ color: INK, paddingTop: u(40, 0), paddingBottom: u(60, 36) }}>
      <div className="relative mx-auto w-full max-w-[1920px] md:h-[calc(var(--u)*574)]">
        <div className="relative aspect-[3342/2160] w-full md:absolute md:left-0 md:top-0 md:h-full md:w-auto">
          <Image
            src={beam}
            alt="Cut-away of the seven-grid extruded aluminum door sill beam"
            fill
            quality={100}
            sizes="(min-width: 1920px) 888px, (min-width: 768px) 46vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="px-5 md:absolute md:left-[calc(var(--u)*983)] md:right-5 md:top-[calc(var(--u)*156)] md:px-0" style={{ marginTop: u(0, 28) }}>
          <h3 className="font-normal" style={{ fontSize: u(34, 22), lineHeight: 1.3, letterSpacing: "0.005em" }}>
            Seven-Grid Ultra-Long 1,968mm
            <br className="hidden md:block" /> Energy-Absorbing Door Sill Beam
          </h3>
          <p style={{ marginTop: u(46, 14), maxWidth: u(520, 340), fontSize: u(16, 12.5), lineHeight: 1.45, opacity: 0.55 }}>
            Better absorbs collision energy in side impacts, reducing deformation and intrusion into the seat crossbeam
            and battery ensuring the safety of the battery and occupants.
          </p>
        </div>
      </div>
    </section>
  );
}
