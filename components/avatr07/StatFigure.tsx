import { u } from "./scale";

// Number + small unit over a caption, used by the Phase 2 image sections (white on photography).
// Sizes are passed in so each section keeps the Phase 1 stat scale it belongs to.
export default function StatFigure({
  value,
  unit,
  label,
  numberSize,
  unitSize,
  labelSize,
}: {
  value: string;
  unit?: string;
  label: string;
  numberSize: [number, number];
  unitSize: [number, number];
  labelSize: [number, number];
}) {
  return (
    <div data-fx="spec" className="flex flex-col items-center text-center text-white">
      <p className="flex items-baseline whitespace-nowrap" style={{ lineHeight: 1.1 }}>
        <span data-fx="spec-num" className="relative font-normal" style={{ fontSize: u(...numberSize) }}>
          {value}
        </span>
        {unit && (
          <span data-fx="spec-unit" className="ml-[0.25em]" style={{ fontSize: u(...unitSize) }}>
            {unit}
          </span>
        )}
      </p>
      <p data-fx="spec-label" style={{ fontSize: u(...labelSize), lineHeight: 1.3, marginTop: u(-1, 2) }}>{label}</p>
    </div>
  );
}
