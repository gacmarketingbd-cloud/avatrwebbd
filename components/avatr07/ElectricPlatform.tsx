import Image from "next/image";
import battery from "../../avatr 07 page/Electric Platform Battery image.webp";
import { INK, u } from "./scale";

const STATS = [
  { label: "Battery capacity", value: "82.16kWh" },
  { label: "Peak charging rate", value: "4.5C" },
];

// Phase 4 · 1 — Class-Leading Pure Electric Platform. Heading, then the exploded battery pack on the left
// (the supplied 3840x2160 file has transparent padding; its pack is ~700 artboard px wide, so the file box is
// 1152px wide and positioned so the pack lands at x227–925) and the platform copy + two figures on the right
// (text column at x982). Below md the image stacks above the text.
export default function ElectricPlatform() {
  return (
    <section className="bg-white" style={{ paddingTop: u(40, 20), paddingBottom: u(60, 40), color: INK }}>
      <h2 className="px-5 text-center font-normal" style={{ fontSize: u(58, 28), lineHeight: 1.15, letterSpacing: "0.005em" }}>
        Class-Leading Pure Electric Platform
      </h2>

      <div className="relative mx-auto w-full max-w-[1920px] px-5 md:h-[calc(var(--u)*520)] md:px-0" style={{ marginTop: u(60, 24) }}>
        {/* 16:9 box with transparent margins; `sizes` = painted box width (1152 artboard px on desktop) */}
        <div className="relative mx-auto aspect-video w-full max-w-[560px] md:absolute md:left-0 md:mx-0 md:w-[calc(var(--u)*1152)] md:max-w-none md:[top:calc(var(--u)*-64)]">
          <Image
            src={battery}
            alt="Exploded view of the AVATR 07 battery pack: cover, cells and base tray"
            fill
            quality={100}
            sizes="(min-width: 1920px) 1152px, (min-width: 768px) 60vw, 100vw"
            className="object-contain"
          />
        </div>

        <div className="md:absolute md:left-[calc(var(--u)*982)] md:right-5 md:[top:calc(var(--u)*6)]" style={{ marginTop: 0 }}>
          <h3 className="font-normal" style={{ fontSize: u(34, 22), lineHeight: 1.3, letterSpacing: "0.005em" }}>
            Full 800V
            <br />
            Silicon Carbide Power Platform
          </h3>
          <div style={{ marginTop: u(22, 12), maxWidth: u(520, 340), fontSize: u(16, 12.5), lineHeight: 1.45, opacity: 0.55 }}>
            <p>With an 82.16 kWh battery pack. 4.5C charging enabled. Peak charging power reaches 420kW.</p>
            <p style={{ marginTop: u(14, 8) }}>350 km range in 10 min. of charging</p>
          </div>
          <dl className="flex" style={{ marginTop: u(70, 28), gap: u(100, 40) }}>
            {STATS.map((s) => (
              <div key={s.label}>
                <dt style={{ fontSize: u(14, 11), lineHeight: 1.3, opacity: 0.55 }}>{s.label}</dt>
                <dd className="font-normal" style={{ marginTop: u(12, 6), fontSize: u(48, 30), lineHeight: 1.1 }}>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
