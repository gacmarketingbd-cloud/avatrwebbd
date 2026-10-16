import type { CSSProperties } from "react";

// The AVATR 07 layout was designed on a 1920px artboard. Every metric is
// authored in artboard pixels and scaled by --u (1 artboard px at 1920 wide,
// capped there), with a floor so small screens keep readable, touch-friendly
// sizes instead of a shrunken desktop layout.
export const ROOT_SCALE = { "--u": "calc(min(100vw, 1920px) / 1920)" } as CSSProperties;

export const TAN = "#b09078";
export const INK = "#141414";

export const u = (n: number, min?: number) =>
  min === undefined ? `calc(var(--u) * ${n})` : `max(${min}px, calc(var(--u) * ${n}))`;
