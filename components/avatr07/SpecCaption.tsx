import type { CSSProperties, ReactNode } from "react";
import { u } from "./scale";

export type SpecStat = { value: string; unit: string; label: string };
type SpecSlide = { id: string; title: string; description: string; stats: SpecStat[]; note?: string };

// One shared caption layout for the Kunlun spec cards (Quiet / Refueling / Powerful).
//
// Every text group is its own ROW (title, description, figures, disclaimer), and each row stacks the
// versions from all slides in a single grid cell, showing only the active one. A row is therefore
// always as tall as the longest version in it, at any viewport width: a slide with more copy wraps
// inside the row's reserved space, and no slide can make the card taller or shorter, or move any
// other group. Sizes, gaps and padding are shared (artboard px): padding 22/20, title 33, description
// 16, figure 42, unit 17, label 13.5, disclaimer 10.5.
const FADE = "opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)";

function Row({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="grid w-full justify-items-center" style={style}>
      {children}
    </div>
  );
}

const layer = (active: boolean): CSSProperties => ({
  gridArea: "1 / 1",
  opacity: active ? 1 : 0,
  transition: FADE,
  pointerEvents: active ? "auto" : "none",
});

export default function SpecCaption({ slides, index }: { slides: SpecSlide[]; index: number }) {
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{ padding: `${u(22, 18)} ${u(40, 20)} ${u(20, 18)}` }}
    >
      <Row>
        {slides.map((s, i) => (
          <h3
            key={s.id}
            aria-hidden={i !== index}
            className="font-normal"
            style={{ ...layer(i === index), fontSize: u(33, 22), lineHeight: 1.2, letterSpacing: "0.005em" }}
          >
            {s.title}
          </h3>
        ))}
      </Row>

      <Row style={{ marginTop: u(12, 8) }}>
        {slides.map((s, i) => (
          <p
            key={s.id}
            aria-hidden={i !== index}
            style={{ ...layer(i === index), maxWidth: u(1200, 320), fontSize: u(16, 12.5), lineHeight: 1.45, opacity: i === index ? 0.62 : 0 }}
          >
            {s.description}
          </p>
        ))}
      </Row>

      <Row style={{ marginTop: u(22, 16) }}>
        {slides.map((s, i) => (
          <dl
            key={s.id}
            aria-hidden={i !== index}
            className="flex items-start justify-center"
            style={{ ...layer(i === index), gap: u(110, 36) }}
          >
            {s.stats.map((st) => (
              <div key={st.label} className="flex flex-col items-center">
                <dd className="flex items-baseline whitespace-nowrap" style={{ lineHeight: 1.1 }}>
                  <span className="font-normal" style={{ fontSize: u(42, 30) }}>
                    {st.value}
                  </span>
                  {st.unit && (
                    <span className="ml-[0.2em]" style={{ fontSize: u(17, 12) }}>
                      {st.unit}
                    </span>
                  )}
                </dd>
                <dt style={{ maxWidth: u(300, 150), marginTop: u(8, 4), fontSize: u(13.5, 11), lineHeight: 1.35, opacity: 0.55 }}>
                  {st.label}
                </dt>
              </div>
            ))}
          </dl>
        ))}
      </Row>

      <Row style={{ marginTop: u(18, 14) }}>
        {slides.map((s, i) => (
          <p
            key={s.id}
            aria-hidden={i !== index}
            style={{ ...layer(i === index), maxWidth: u(1250, 320), fontSize: u(10.5, 10), lineHeight: 1.4, opacity: i === index ? 0.5 : 0 }}
          >
            {s.note}
          </p>
        ))}
      </Row>
    </div>
  );
}
