import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FADE_RISE, addFadeRise, hideFadeRise } from "./fadeRise";

import "./motionKit";

gsap.registerPlugin(ScrollTrigger);

// Cockpit headline + subcopy entrance: the Futuristic Design fade-rise (same distance, duration,
// easing, stagger and playback speed — all from fadeRise.ts). The headline rises from below while
// fading in and the subcopy follows one FADE_RISE.stagger later. Plays once per page load, when the
// text enters the viewport. Only these two lines move; the selectors, images and layout never do,
// and every inline style is cleared afterwards so the final frame is exactly the static design.
const TRIGGER = 0.9; // headline top edge reaches 90% down the screen ("enters the viewport")

// The subcopy ("Surround ambient lighting") is small, light-weight text, so it needs a steadier
// move: animate ONLY `y` (18px) and plain `opacity` (no scale, no visibility toggle, nothing that
// touches size, tracking, line-height, width or position), and force GSAP to use translate3d for
// the whole move so the text sits on its own GPU layer from the first frame to the last. The CSS
// side (will-change + backface-visibility) is on the element in CockpitFeature.tsx, and nothing
// else in CSS transforms this element (see scripts/test-cockpit-subcopy.mjs).
const SUBCOPY = { y: 18, force3D: true, opacityOnly: true } as const;

// will-change + backface-visibility: present for the whole entrance so the text sits on its own
// compositing layer from the first frame to the last; removed afterwards because a permanent layer
// snaps the text to whole pixels and would change how it renders at rest.
function setLayerHints(el: HTMLElement, on: boolean) {
  el.style.willChange = on ? "transform, opacity" : "";
  el.style.backfaceVisibility = on ? "hidden" : "";
  el.style.setProperty("-webkit-backface-visibility", on ? "hidden" : "");
}

export function initCockpitText(headline: HTMLElement, subcopy: HTMLElement) {
  const lines = [headline, subcopy];
  let started = false;
  let disposed = false;
  // Declared before gsap.context(): the callback runs immediately and assigns it.
  let cleanupListeners: () => void = () => {};

  const ctx = gsap.context((self) => {
    // Hidden start state, set before first paint by the layout effect.
    hideFadeRise(headline);
    hideFadeRise(subcopy, SUBCOPY);
    setLayerHints(subcopy, true); // own compositing layer for the whole entrance

    const play = () => {
      if (started || disposed) return;
      started = true;
      self.add(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(lines, { clearProps: "transform,opacity,visibility" });
            setLayerHints(subcopy, false); // back to exactly the static rendering
          },
        });
        tl.timeScale(FADE_RISE.timeScale);
        addFadeRise(tl, headline, 0);
        addFadeRise(tl, subcopy, FADE_RISE.stagger, SUBCOPY);
      });
    };

    // Decided from the headline's own position (scroll, resize, load), so a trigger that has been
    // passed — however fast — always plays the entrance; the text can never stay hidden.
    const evaluate = () => {
      if (!started && !disposed && headline.getBoundingClientRect().top < window.innerHeight * TRIGGER) play();
    };
    ScrollTrigger.create({ trigger: headline, start: `top ${TRIGGER * 100}%`, once: true, onEnter: play });
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    evaluate(); // already beyond the trigger at load (e.g. reload mid-page)
    document.fonts?.ready.then(() => {
      ScrollTrigger.refresh();
      evaluate();
    });

    cleanupListeners = () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, headline);

  return () => {
    disposed = true;
    cleanupListeners();
    ctx.revert();
    setLayerHints(subcopy, false);
  };
}
