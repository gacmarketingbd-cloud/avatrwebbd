import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildOdometer } from "./odometer";

import "./motionKit";

gsap.registerPlugin(ScrollTrigger);

// Play-once entrance for a row of StatFigure blocks (data-fx spec-num / spec-unit / spec-label):
//   numbers   short vertical roll through a few neighbouring digits, staggered left -> right, settling fast
//   unit +    fade in rising ~18px, just after their own number settles
//   caption
// Only the figures move; whatever sits behind them (e.g. the photo) is never touched, and every inline
// style is cleared at the end so the final frame is exactly the static design.
const ROLL_ROWS = 4;
const ROLL_DURATION = 0.75;
const ROLL_EASE = "power3.out";
const NUMBER_STAGGER = 0.12;
const DIGIT_STAGGER = 0.04;
const RISE_Y = 18;
const TRIGGER = 0.9; // fires when the figures' top edge is 10% up from the bottom of the screen

export function initStatRoll(root: HTMLElement) {
  const specs = [...root.querySelectorAll<HTMLElement>("[data-fx='spec']")];
  const cleanups: Array<() => void> = [];
  let played = false;
  let disposed = false;

  const ctx = gsap.context(() => {
    specs.forEach((s) => {
      gsap.set(s.querySelector("[data-fx='spec-num']"), { autoAlpha: 0 });
      gsap.set(s.querySelectorAll("[data-fx='spec-unit'], [data-fx='spec-label']"), { autoAlpha: 0, y: RISE_Y });
    });

    const play = async () => {
      if (played || disposed) return;
      played = true;
      if (document.fonts?.ready) await document.fonts.ready;
      if (disposed) return;
      ctx.add(() => {
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          onComplete: () => specs.forEach((s) => gsap.set(s.querySelectorAll("[data-fx]"), { clearProps: "transform,opacity,visibility" })),
        });
        specs.forEach((spec, i) => {
          const num = spec.querySelector<HTMLElement>("[data-fx='spec-num']")!;
          const after = spec.querySelectorAll("[data-fx='spec-unit'], [data-fx='spec-label']");
          const start = i * NUMBER_STAGGER;
          const odo = buildOdometer(num, { rowsBefore: ROLL_ROWS });
          if (!odo) {
            tl.to(num, { autoAlpha: 1, duration: 0.4 }, start);
            tl.to(after, { autoAlpha: 1, y: 0, duration: 0.5 }, start + 0.35);
            return;
          }
          const origColor = num.style.color;
          num.style.color = "transparent"; // real text hidden; the overlay is the visible roll
          tl.to(num, { autoAlpha: 1, duration: 0.15, ease: "power1.out" }, start);
          odo.strips.forEach((strip, d) => {
            tl.fromTo(strip, { y: 0 }, { y: -odo.rows[d] * odo.rowH, duration: ROLL_DURATION, ease: ROLL_EASE }, start + d * DIGIT_STAGGER);
          });
          const settled = start + (odo.strips.length - 1) * DIGIT_STAGGER + ROLL_DURATION;
          tl.call(
            () => {
              num.style.color = origColor;
              odo.overlay.remove();
            },
            undefined,
            settled
          );
          cleanups.push(() => {
            num.style.color = origColor;
            odo.overlay.remove();
          });
          tl.to(after, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.06 }, settled - 0.08);
        });
      });
    };

    const evaluate = () => {
      if (!played && root.getBoundingClientRect().top < window.innerHeight * TRIGGER) void play();
    };
    ScrollTrigger.create({ trigger: root, start: `top ${TRIGGER * 100}%`, once: true, onEnter: play });
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    cleanups.push(() => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    });
    evaluate(); // already beyond the trigger at load
    document.fonts?.ready.then(() => {
      ScrollTrigger.refresh();
      evaluate();
    });
  }, root);

  return () => {
    disposed = true;
    cleanups.forEach((fn) => fn());
    ctx.revert();
  };
}
