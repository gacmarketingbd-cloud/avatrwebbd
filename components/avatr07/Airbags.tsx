import Image from "next/image";
import airbags from "../../avatr 07 page/air bags.webp";
import { INK, u } from "./scale";

// Phase 4 · 2 — Standard 9 Airbags Across All Models. Centred heading + one-line subcopy, then the cut-away
// car with its airbags. The supplied 2804x1931 file has transparent margins; the car is ~930 artboard px
// wide in the reference, so the file box is 962px wide and centred.
export default function Airbags() {
  return (
    <section className="bg-white px-5" style={{ paddingTop: u(70, 36), paddingBottom: u(70, 36), color: INK }}>
      <div className="flex flex-col items-center text-center">
        <h2 className="font-normal" style={{ fontSize: u(58, 28), lineHeight: 1.15, letterSpacing: "0.005em" }}>
          Standard 9 Airbags Across All Models
        </h2>
        <p style={{ marginTop: u(26, 12), fontSize: u(22, 15), lineHeight: 1.4, letterSpacing: "0.01em" }}>
          Best in class with rear side airbags and front distal airgbags
        </p>
      </div>

      <div className="relative mx-auto aspect-[2804/1931] w-full max-w-[560px] md:w-[calc(var(--u)*962)] md:max-w-none" style={{ marginTop: u(80, 16) }}>
        <Image
          src={airbags}
          alt="AVATR 07 cut-away showing the nine airbags"
          fill
          quality={100}
          sizes="(min-width: 1920px) 962px, (min-width: 768px) 50vw, 100vw"
          className="object-contain"
        />
      </div>
    </section>
  );
}
