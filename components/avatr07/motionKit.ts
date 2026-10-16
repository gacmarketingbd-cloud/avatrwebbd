import { gsap } from "gsap";

// Page-wide motion defaults, imported (for its side effects) by every entrance-animation module so they all
// behave the same way:
//
//  * force3D: every x/y move is a GPU translate3d for the WHOLE tween (GSAP's default "auto" renders it in 3D
//    while moving and then drops back to 2D on the last frame, which re-rasterises the text and is the visible
//    "snap"/shake at the end of a rise). The modules clear all inline transform/opacity afterwards, so the final
//    frame is still exactly the static design.
//  * layer hints: an element gets `will-change: transform, opacity` (+ backface-visibility: hidden, the combination
//    that keeps small text steady while it moves) only while a tween on it is actually running, and loses them as
//    soon as no tween is active on it, because a permanent layer would snap the resting text to whole pixels.
//
// Shared easing so everything feels like one system: text rising/fading uses EASE_RISE; masks / panels / wipes
// use "power2.inOut". Vertical travel for text stays within MAX_RISE.
export const EASE_RISE = "power2.out";
export const MAX_RISE = 20; // px

gsap.config({ force3D: true });

const active = (el: Element, except: gsap.core.Tween) =>
  gsap.getTweensOf(el).some((t) => t !== except && t.isActive() && !t.paused());

gsap.defaults({
  onStart(this: gsap.core.Tween) {
    for (const t of this.targets()) {
      if (!(t instanceof HTMLElement) && !(t instanceof SVGElement)) continue;
      t.style.willChange = "transform, opacity";
      t.style.backfaceVisibility = "hidden";
    }
  },
  onComplete(this: gsap.core.Tween) {
    for (const t of this.targets()) {
      if (!(t instanceof HTMLElement) && !(t instanceof SVGElement)) continue;
      if (active(t, this)) continue;
      t.style.willChange = "";
      t.style.backfaceVisibility = "";
      // Settled at rest (no offset, scale, rotation or skew left): drop the transform and any fully-opaque inline
      // opacity/visibility right now, instead of leaving a lingering identity transform that keeps the text on
      // its own layer until a long timeline ends (that is what snaps the text by a pixel at the very end).
      const g = (p: string) => Number(gsap.getProperty(t, p));
      const atRest = ["x", "y", "xPercent", "yPercent", "rotation", "skewX", "skewY"].every((p) => Math.abs(g(p)) < 1e-6) && Math.abs(g("scaleX") - 1) < 1e-6 && Math.abs(g("scaleY") - 1) < 1e-6;
      if (atRest && t.style.transform) gsap.set(t, { clearProps: "transform" });
      if (atRest && t.style.opacity === "1") gsap.set(t, { clearProps: "opacity" });
      if (atRest && (t.style.visibility === "inherit" || t.style.visibility === "visible")) gsap.set(t, { clearProps: "visibility" });
    }
  },
});
