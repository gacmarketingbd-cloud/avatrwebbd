import { TAN } from "./scale";

// Golden-ratio overlay, drawn as its own layer. The viewBox is the photo's own
// coordinate space (1920 x 772 — the golden ratio image at a 1920px width) and
// the SVG fills the photo box, so every element stays locked to the car.
// Geometry was measured from the Illustrator master: 3 guide lines that run
// the full height of the visible frame, and 7 circles (r=76) on one baseline.
// Every stroke sets pathLength=1 with dasharray 1, so a reveal animation only
// has to tween `stroke-dashoffset` from 1 to 0 on `[data-gr-line]` /
// `[data-gr-circle]` — no geometry changes needed. Layers:
// [data-layer="golden-ratio-lines"] and [data-layer="golden-ratio-circles"].
const STROKE = {
  stroke: TAN,
  strokeWidth: 1.3,
  fill: "none",
  pathLength: 1,
  strokeDasharray: 1,
} as const;

// Frame-edge to frame-edge in the master (frame y 0..727 = box y 3.5..730.5).
const LINES = [
  { id: "diag-down", x1: 557.5, y1: 3.5, x2: 1487, y2: 730.5 },
  // Authored bottom-left -> top-right so its draw-in starts from the lower side.
  { id: "diag-up", x1: 469, y1: 730.5, x2: 1596, y2: 3.5 },
  { id: "vertical", x1: 1256.5, y1: 3.5, x2: 1256.5, y2: 730.5 },
];

const CIRCLE_XS = [556, 709, 861, 1014, 1167, 1261, 1414];
const CIRCLE_Y = 483.5;
const CIRCLE_R = 76;

export default function GoldenRatioLines() {
  return (
    <svg
      viewBox="0 0 1920 772"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <g data-layer="golden-ratio-lines" opacity={0.75}>
        {LINES.map((l) => (
          <line key={l.id} data-gr-line={l.id} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} {...STROKE} />
        ))}
      </g>
      <g data-layer="golden-ratio-circles" opacity={0.75}>
        {CIRCLE_XS.map((cx, i) => (
          <circle key={cx} data-gr-circle={i + 1} cx={cx} cy={CIRCLE_Y} r={CIRCLE_R} {...STROKE} />
        ))}
      </g>
    </svg>
  );
}
