import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./motionKit";

gsap.registerPlugin(ScrollTrigger);

// Simple, elegant heading reveal, played once when the heading enters the viewport:
//   - starts RISE px lower, fully transparent
//   - rises into its final position while fading 0 -> 1 (smooth ease-out, no overshoot)
//   - a very subtle letter-spacing settle (slightly open -> the heading's real tracking)
// No rotation, no scale, no per-character effect. Everything animates *to* the heading's normal
// laid-out state and all inline styles are restored afterwards, so the final frame is exactly the
// static design.
const RISE = 18; // px the heading starts below its final position
const DURATION = 0.75; // seconds
const EASE = "power3.out";
const TRACKING_OPEN = 0.014; // em of extra letter-spacing at the start, settling to the real value
const TRIGGER = 0.88; // heading top edge reaches 88% down the screen

export function initHeadingReveal(heading: HTMLElement) {
  let started = false;
  let disposed = false;
  const finalTracking = heading.style.letterSpacing; // what React set inline, e.g. "0.005em"
  const finalTrackingEm = parseFloat(finalTracking) || 0;
  // Declared before gsap.context(): the callback runs immediately and assigns it.
  let cleanupListeners: () => void = () => {};

  const ctx = gsap.context((self) => {
    // Hidden start state, set before first paint by the layout effect.
    gsap.set(heading, { y: RISE, autoAlpha: 0 });
    heading.style.letterSpacing = `${finalTrackingEm + TRACKING_OPEN}em`;

    const play = () => {
      if (started || disposed) return;
      started = true;
      self.add(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            // Back to the exact static styles: drop the transform/opacity and restore the tracking.
            gsap.set(heading, { clearProps: "transform,opacity,visibility" });
            heading.style.letterSpacing = finalTracking;
          },
        });
        tl.to(heading, { y: 0, autoAlpha: 1, duration: DURATION, ease: EASE }, 0);
        const track = { v: finalTrackingEm + TRACKING_OPEN };
        tl.to(
          track,
          {
            v: finalTrackingEm,
            duration: DURATION,
            ease: EASE,
            onUpdate: () => {
              heading.style.letterSpacing = `${track.v.toFixed(4)}em`;
            },
          },
          0
        );
      });
    };

    // Decided from the heading's own position (scroll, resize, load), so a trigger that has been
    // passed — however fast — always plays the reveal; the heading can never stay hidden.
    const evaluate = () => {
      if (!started && !disposed && heading.getBoundingClientRect().top < window.innerHeight * TRIGGER) play();
    };
    ScrollTrigger.create({ trigger: heading, start: `top ${TRIGGER * 100}%`, once: true, onEnter: play });
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
  }, heading);

  return () => {
    disposed = true;
    cleanupListeners();
    ctx.revert();
    heading.style.letterSpacing = finalTracking;
  };
}
