import AutoVideo from "./AutoVideo";
import { INK, u } from "./scale";

const POINTS = [
  "9-Layer thermal safety protection structure",
  "4-Layer underbody armor protection system",
  "From hardware to software, the battery delivers comprehensive high safety",
];

const COPY = [
  "It features an ultra-high-strength top cover, an extruded aluminum mounting beam, an extra-long side impact beam, and a high-density anti-scuff coating on the underside to withstand physical impacts.",
  "The battery is equipped with a 24-hour overheating monitoring strategy, ensuring that thermal runaway in a single cell does not propagate, with a single-cell failure rate as low as one part per billion (PPB).",
  "The entire battery pack achieves an IPX8 waterproof rating.",
];

// Phase 4 · 5 — Battery safety. One 1630px card (artboard) like the hard-braking block: the battery video
// (16:9 source cropped to 1630x725) over a bordered box with the three safety points on the left and the three
// paragraphs on the right (column at x942). Below md the two columns stack.
export default function BatterySafety() {
  return (
    <section className="bg-white" style={{ color: INK, paddingTop: u(20, 0), paddingBottom: u(88, 48) }}>
      <div className="mx-auto w-full px-5 md:max-w-[calc(var(--u)*1630)] md:px-0">
        <div className="relative aspect-video w-full overflow-hidden bg-black md:aspect-[1630/725]">
          <AutoVideo
            src="/videos/avatr-07/battery.mp4"
            label="AVATR 07 battery pack safety structure"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div
          className="grid gap-6 md:grid-cols-[797fr_833fr] md:gap-0"
          style={{ border: "1px solid rgba(20,20,20,0.4)", borderTop: 0, padding: `${u(24, 20)} ${u(40, 20)} ${u(34, 24)}` }}
        >
          <ul className="flex flex-col" style={{ gap: u(34, 18), paddingLeft: u(30, 0) }}>
            {POINTS.map((p) => (
              <li key={p} className="flex items-start" style={{ fontSize: u(22, 15), lineHeight: 1.3, letterSpacing: "0.005em" }}>
                <span
                  aria-hidden
                  className="shrink-0 rounded-full bg-[#141414]/70"
                  style={{ width: u(8, 6), height: u(8, 6), marginTop: "0.55em", marginRight: u(16, 12) }}
                />
                {p}
              </li>
            ))}
          </ul>
          <div style={{ fontSize: u(16, 12.5), lineHeight: 1.45, opacity: 0.55 }}>
            {COPY.map((c, i) => (
              <p key={i} style={{ marginTop: i === 0 ? 0 : u(22, 12) }}>
                {c}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
