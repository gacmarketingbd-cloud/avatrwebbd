// TEMPORARY mobile debugging switch (not part of the final version).
//
// On phones (< 768px) the `mm` query parameter chooses which entrance animations from Luxury Experience downward run;
// every other one takes the existing reduced-motion path, i.e. the section renders directly in its final state, and
// its permanent layer hints are dropped too (data-mm-off, see globals.css) so the base page is completely plain.
//   /avatr-07?mm=none              nothing animates
//   /avatr-07?mm=lux               only Luxury Experience
//   /avatr-07?mm=lux,seat,sunroof  ...and so on (groups below; "later" = every section after Meridian materials)
// Without `mm`, or on desktop, everything behaves exactly as before.
const LATER = ["ambient", "storage", "mirror", "harmony", "modes", "huawei", "taihang", "braking", "kunlun"];
export type MotionGroup = "lux" | "seat" | "sunroof" | "meridian" | "materials" | (typeof LATER)[number];

export function motionOff(group: MotionGroup, el?: HTMLElement | null) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (!window.matchMedia("(max-width: 767px)").matches) return false;
  const v = new URLSearchParams(window.location.search).get("mm");
  if (v === null) return false;
  const on = v.split(",").flatMap((g) => (g === "later" ? LATER : [g]));
  if (on.includes(group)) return false;
  (el?.closest("section") ?? el)?.setAttribute("data-mm-off", "");
  return true;
}
