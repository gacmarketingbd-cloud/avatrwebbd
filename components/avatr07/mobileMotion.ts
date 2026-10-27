import { gsap } from "gsap";
import { initCssReveal } from "./cssReveal";

// Phones (and small touch tablets) get their own, simpler entrance animations for the sections from Luxury Experience
// down; desktop keeps the full GSAP timelines untouched.
//
// Why: a GSAP timeline is stepped by JavaScript on the page's main thread. On a phone that thread is regularly busy
// for hundreds of ms at a time (photo decoding, video start-up, hydration), and while it is the page keeps scrolling
// on the compositor with a frozen snapshot of the animation: number rolls stuck half-way, text still hidden. The
// mobile versions below are plain CSS transitions on opacity + a small translateY (initCssReveal), which the
// compositor runs by itself: once started they always reach the final frame, however busy the main thread is.
//
// Rules on mobile:
//   * the page's default (CSS) state is the final, visible design; a section only receives its hidden start state
//     when its trigger has been set up, and only if it is still below the screen at that moment (anything already
//     in view is simply left as it is, so nothing visible ever disappears)
//   * opacity + small rise only: no clip-path masks, no number rolls, no pinning or scrubbing, no nested movement
//   * if setting a section up fails for any reason, it stays in its final visible state (see initCssReveal)
// Must match the media query in globals.css (stable layers off, no start-up hiding on mobile).
export const MOBILE_QUERY = "(max-width: 767px), (pointer: coarse) and (max-width: 1023px)";

type Cleanup = (() => void) | void | undefined;

// Runs `desktop` or `mobile` for the current viewport and swaps them (reverting the other) if it changes, e.g. on
// rotation. Returns the cleanup for a layout effect.
export function byViewport(desktop: () => Cleanup, mobile: () => Cleanup) {
  const mm = gsap.matchMedia();
  mm.add({ mobile: MOBILE_QUERY, any: "all" }, (c) => {
    const stop = c.conditions?.mobile ? mobile() : desktop();
    return () => stop?.();
  });
  return () => mm.revert();
}

type Steps = Parameters<typeof initCssReveal>[2];
type Opts = Parameters<typeof initCssReveal>[3];

// A reveal that is skipped (final state kept) when its trigger is already on screen or above it.
function reveal(section: HTMLElement, trigger: HTMLElement | null, steps: Steps, opts?: Opts) {
  if (!trigger || trigger.getBoundingClientRect().top < window.innerHeight) {
    opts?.onDone?.();
    return;
  }
  return initCssReveal(section, trigger, steps, opts);
}

const all = (root: ParentNode, sel: string) => [...root.querySelectorAll<HTMLElement>(sel)];
const one = (root: ParentNode, sel: string) => root.querySelector<HTMLElement>(sel);
const RISE = 14; // px
const SMALL = 8; // px, for captions under a figure

// Figures (number + its units, then the caption under it), staggered top to bottom. Replaces the number roll.
function figureSteps(specs: HTMLElement[], at: number, stagger: number): Steps {
  return specs.flatMap((s, i) => [
    { els: [one(s, "[data-fx='spec-num']"), ...all(s, "[data-fx='spec-unit']")], delay: at + i * stagger, y: 12, duration: 800 },
    { els: all(s, "[data-fx='spec-label']"), delay: at + i * stagger + 180, y: SMALL, duration: 700 },
  ]);
}

// Luxury Experience: heading, rule, description, then 35.4 / 15.6 / 6.7 with their units and labels.
export function initLuxuryStatsMobile(root: HTMLElement) {
  return reveal(
    root,
    one(root, "[data-fx='title']"),
    [
      { els: all(root, "[data-fx='title']"), delay: 0, y: RISE, duration: 1000 },
      { els: all(root, "[data-fx='rule']"), delay: 250, move: false, duration: 800 },
      { els: all(root, "[data-fx='subtitle']"), delay: 350, y: RISE, duration: 900 },
      ...figureSteps(all(root, "[data-fx='spec']"), 750, 160),
    ],
    { triggerAt: 0.8 },
  );
}

// Rear Cabin measurements (the photo never animates).
export function initStatRollMobile(root: HTMLElement) {
  return reveal(root, root, figureSteps(all(root, "[data-fx='spec']"), 0, 140), { triggerAt: 0.9 });
}

// Panoramic sunroof copy: line 1, then line 2.
export function initSunroofCopyMobile(root: HTMLElement) {
  const lines = all(root, "[data-line]");
  return reveal(root, lines[0] ?? root, lines.map((l, i) => ({ els: [l], delay: i * 220, y: RISE, duration: 900 })), { triggerAt: 0.85 });
}

// Meridian sound system: title (with the dark gradient deepening behind it), then the figures.
export function initMeridianTextMobile(section: HTMLElement) {
  const title = one(section, "h2");
  return reveal(
    section,
    title,
    [
      { els: [title], delay: 0, y: RISE, duration: 950 },
      { els: [one(section, "[data-fx='deepen']")], delay: 0, move: false, opacityFrom: 0.82, duration: 1400 },
      ...figureSteps(all(section, "[data-fx='spec']"), 280, 120),
    ],
    { triggerAt: 0.88 },
  );
}

// Meridian materials: heading, then the three cards (each card moves as one piece, its text inside does not move);
// and, separately, the algorithms heading and its items.
export function initAcousticMobile(section: HTMLElement) {
  const heading = one(section, "h2:not([data-fx])");
  const stopCards = reveal(
    section,
    heading,
    [
      { els: [heading], delay: 0, y: RISE, duration: 900 },
      ...all(section, "[data-fx='card']").map((c, i) => ({ els: [c], delay: 300 + i * 200, y: 16, duration: 900 })),
    ],
    { triggerAt: 0.85 },
  );
  const algoHeading = one(section, "[data-fx='algo-heading']");
  const stopAlgos = reveal(
    section,
    algoHeading,
    [
      { els: [algoHeading], delay: 0, y: RISE, duration: 1000 },
      ...all(section, "[data-fx='algo']").map((a, i) => ({ els: [a], delay: 400 + i * 200, y: 12, duration: 950 })),
    ],
    { triggerAt: 0.8 },
  );
  return () => {
    stopCards?.();
    stopAlgos?.();
  };
}

// Ambient lighting: heading, description, specs; then the gradient in "Ambient" starts flowing (a CSS animation of
// background-position, see .ambient-flow in globals.css; the static design already shows the gradient).
export function initAmbientLightingMobile(section: HTMLElement) {
  const flowing = all(section, "[data-fx='ambient-fill'], [data-fx='ambient-glow']");
  const flow = () => flowing.forEach((el) => el.classList.add("ambient-flow"));
  const heading = one(section, "h2");
  const stop = reveal(
    section,
    heading,
    [
      { els: [heading], delay: 0, y: RISE, duration: 1100 },
      { els: [one(section, "h2 + p")], delay: 450, y: RISE, duration: 900 },
      ...all(section, "[data-fx='spec']").map((s, i) => ({ els: [s], delay: 800 + i * 180, y: 12, duration: 850 })),
    ],
    { triggerAt: 0.85, onDone: flow },
  );
  return () => {
    stop?.();
    flowing.forEach((el) => el.classList.remove("ambient-flow"));
  };
}

// Flexible storage: the text panel fades in (no clip-path opening), then heading and copy.
export function initStorageTextMobile(section: HTMLElement) {
  const panel = one(section, "[data-fx='panel']");
  return reveal(
    section,
    panel,
    [
      { els: [panel], delay: 0, move: false, duration: 1000 },
      { els: [one(section, "h2")], delay: 300, y: RISE, duration: 900 },
      { els: [one(section, "h2 + p")], delay: 600, y: RISE, duration: 850 },
    ],
    { triggerAt: 0.88 },
  );
}

// FHD interior mirror image panel: the same soft resolve as desktop (fade + 0.985 -> 1), as a CSS transition.
export function initInteriorMirrorMobile(panel: HTMLElement) {
  return reveal(panel, panel, [{ els: [panel], delay: 0, scale: 0.985, duration: 1000 }], { triggerAt: 0.85 });
}
