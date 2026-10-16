import { u } from "./scale";

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === "prev" ? "M14.5 7.5 10 12l4.5 4.5" : "M9.5 7.5 14 12l-4.5 4.5"} />
    </svg>
  );
}

// The thin circular arrow used by the HUAWEI ADS 5 and Kunlun sliders. Position it with `className`
// (it is absolutely placed, vertically centred on its relatively-positioned parent).
// `inline` places it in normal flow (for a pair under a slider) instead of absolutely over its parent; `disabled`
// dims it and ignores clicks (used by finite sliders at either end).
export default function CarouselArrow({
  dir,
  onClick,
  className,
  inline = false,
  disabled = false,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  className: string;
  inline?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`${inline ? "relative shrink-0" : "absolute top-1/2 z-10 -translate-y-1/2"} rounded-full border-[1.5px] transition duration-300 disabled:pointer-events-none disabled:opacity-30 ${className}`}
      style={{ width: u(70, 40), height: u(70, 40), padding: u(11, 6) }}
    >
      <Chevron dir={dir} />
    </button>
  );
}
