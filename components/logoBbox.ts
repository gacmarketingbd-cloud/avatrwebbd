import type { LogoBbox } from "./CroppedMark";

// Tight pixel bounding boxes of the artwork within each 1000x1000 source
// canvas (see CroppedMark.tsx) — shared across Header and Footer so both
// crop the same local logo/wordmark files identically.
export const LOGO_BBOX: LogoBbox = { x: 274, y: 281, w: 452, h: 437 };
export const WORDMARK_BBOX: LogoBbox = { x: 129, y: 465, w: 741, h: 70 };
// The vertical logo PNG has a small "AVATR" baked in under the icon (rows
// 675–718). This box covers only the icon glyph above it, so the header can
// animate the real wordmark in place of that baked-in text.
export const ICON_ONLY_BBOX: LogoBbox = { x: 406, y: 281, w: 189, h: 338 };
