import { gsap } from "gsap";

// The Futuristic Design subcopy's entrance — "fade in while rising from below" — as shared values
// and helpers, so every text block that uses it (the Futuristic Design description, the cockpit
// headline + subcopy) gets exactly the same distance, duration, easing and stagger.
//
// Values are in the units of the Futuristic Design timeline: seconds *before* that timeline's
// `timeScale`, which is also exported so a timeline that uses them runs at the same speed.
export const TOP_SPEED = 1.3; // the Futuristic Design headline/description half runs this much quicker
const g = 1 / TOP_SPEED;

export const FADE_RISE = {
  y: 14, // px below its final position the text starts
  ease: "power2.out",
  duration: 0.9 * g, // one line's rise + fade
  stagger: 0.5 * g, // headline start -> subcopy start
  timeScale: 0.82, // playback speed of the whole timeline (<1 = slower)
} as const;

type Targets = gsap.TweenTarget;

// Optional per-call overrides. With no options the behaviour is exactly the Futuristic Design one.
type FadeRiseOptions = {
  y?: number; // starting offset in px (default FADE_RISE.y)
  force3D?: boolean; // render the transform as translate3d for the whole move (GPU layer)
  opacityOnly?: boolean; // animate `opacity` only instead of `autoAlpha` (which also toggles visibility)
};

const fade = (o: FadeRiseOptions, to: number) => (o.opacityOnly ? { opacity: to } : { autoAlpha: to });
const flags = (o: FadeRiseOptions) => (o.force3D === undefined ? {} : { force3D: o.force3D });

// Hidden start state: transparent and `y` px lower.
export const hideFadeRise = (els: Targets, o: FadeRiseOptions = {}) =>
  gsap.set(els, { ...fade(o, 0), y: o.y ?? FADE_RISE.y, ...flags(o) });

// Adds the rise + fade to `tl` at time `at`. Only `y` and opacity (or autoAlpha) are animated.
export const addFadeRise = (tl: gsap.core.Timeline, els: Targets, at: number, o: FadeRiseOptions = {}) =>
  tl.to(els, { ...fade(o, 1), y: 0, duration: FADE_RISE.duration, ease: FADE_RISE.ease, ...flags(o) }, at);
