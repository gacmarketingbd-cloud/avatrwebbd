import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { refreshScrollTriggers } from "./scrollRefresh";
import { EASE_RISE } from "./motionKit";

gsap.registerPlugin(ScrollTrigger);

// FHD digital interior mirror image panel: a soft "resolve into view", played once when the image enters the
// viewport. Opacity 0 -> 1 does the work, with an almost imperceptible 0.985 -> 1 scale about the centre.
// No vertical slide, bounce, blur or rotation; the text panel beside it is never touched. The tween clears all
// inline styles when it settles, so the final frame is exactly the static design.
//
// Trigger: fires once (ScrollTrigger `once` plus a `played` latch shared with a position check), so scrolling
// back and forth around the start point can never replay, reverse or restart it.
const FROM = { autoAlpha: 0, scale: 0.985 };
const DURATION = 1.0;
const TRIGGER = 0.85; // the image's top edge is 15% up from the bottom of the screen

export function initInteriorMirrorReveal(panel: HTMLElement) {
  let played = false;
  let disposed = false;
  let cleanupListeners: () => void = () => {};

  // `self`, not `ctx`: play() can run synchronously from the first evaluate() below (when the image is already
  // past the trigger at load, e.g. a reload mid-page), before `const ctx` has been assigned.
  const ctx = gsap.context((self) => {
    gsap.set(panel, { ...FROM, transformOrigin: "50% 50%" });

    const play = () => {
      if (played || disposed) return;
      played = true;
      self.add(() => {
        gsap.to(panel, {
          autoAlpha: 1,
          scale: 1,
          duration: DURATION,
          ease: EASE_RISE,
          onComplete: () => gsap.set(panel, { clearProps: "transform,transformOrigin,opacity,visibility" }),
        });
      });
    };

    const evaluate = () => {
      if (!played && panel.getBoundingClientRect().top < window.innerHeight * TRIGGER) play();
    };
    ScrollTrigger.create({ trigger: panel, start: `top ${TRIGGER * 100}%`, once: true, onEnter: play });
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    cleanupListeners = () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
    evaluate();
    document.fonts?.ready.then(() => {
      refreshScrollTriggers();
      evaluate();
    });
  }, panel);

  return () => {
    disposed = true;
    cleanupListeners();
    ctx.revert();
  };
}
