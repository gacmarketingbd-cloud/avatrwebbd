import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { refreshScrollTriggers } from "./scrollRefresh";
import { buildOdometer } from "./odometer";
import { FADE_RISE, addFadeRise, hideFadeRise } from "./fadeRise";

import "./motionKit";

gsap.registerPlugin(ScrollTrigger);

// Play-once reveal for the Luxury Experience text/spec block. Everything animates TO the already laid-out
// state, so the final frame is exactly the static design (every inline style is cleared or settles on it).
//
//   title     masked reveal, left -> right (horizontal only: no bounce, rotation or scale)
//   rule      soft fade / widen (belongs to the heading)
//   subtitle  the shared fade-rise (same distance, duration and easing as every other description)
//   numbers   short vertical roll per digit, staggered
//   units +   fade in just after their own number settles ("Dual", "inch", label)
//   labels
//   dividers  drawn top -> bottom between the groups, as the first number starts
const TITLE_EASE = "power2.inOut";
const TITLE_DURATION = 1.1;
const TITLE_SLIDE_X = -60; // glides in from the left while the mask opens
const ROLL_ROWS = 3; // a short run of neighbouring digits, not a full 0-9 pass
const ROLL_DURATION = 0.85;
const ROLL_EASE = "power3.out";
const NUMBER_STAGGER = 0.14;
const DIGIT_STAGGER = 0.05;
const TRIGGER = "top 75%";

export function initLuxuryStatsMotion(root: HTMLElement) {
  const q = <T extends HTMLElement>(sel: string) => [...root.querySelectorAll<T>(sel)];
  const title = q("[data-fx='title']");
  const rule = q("[data-fx='rule']");
  const subtitle = q("[data-fx='subtitle']");
  const specs = q("[data-fx='spec']");
  const dividers = q("[data-fx='divider']");

  const cleanups: Array<() => void> = [];
  let played = false;
  let disposed = false;

  const ctx = gsap.context(() => {
    // Hidden start states (set before first paint by the layout effect).
    gsap.set(title, { clipPath: "inset(-0.15em 100% -0.2em 0px)", x: TITLE_SLIDE_X });
    gsap.set(rule, { autoAlpha: 0, scaleX: 0.86, transformOrigin: "50% 50%" });
    hideFadeRise(subtitle);
    gsap.set(dividers, { scaleY: 0, transformOrigin: "50% 0%" });
    specs.forEach((s) => {
      gsap.set(s.querySelector("[data-fx='spec-num']"), { autoAlpha: 0 });
      gsap.set(s.querySelectorAll("[data-fx='spec-unit'], [data-fx='spec-label']"), { autoAlpha: 0, y: 6 });
    });

    const play = async () => {
      if (played || disposed) return;
      played = true;
      if (document.fonts?.ready) await document.fonts.ready;
      if (disposed) return;

      ctx.add(() => {
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          onComplete: () => {
            // Leave the static design behind: no clip, transform or opacity left on anything.
            gsap.set([title, rule, subtitle, dividers], { clearProps: "clipPath,transform,opacity,visibility" });
            specs.forEach((s) => gsap.set(s.querySelectorAll("[data-fx]"), { clearProps: "transform,opacity,visibility" }));
          },
        });

        // 1. Heading
        tl.to(title, { clipPath: "inset(-0.15em 0% -0.2em 0px)", x: 0, duration: TITLE_DURATION, ease: TITLE_EASE }, 0);
        tl.to(rule, { autoAlpha: 1, scaleX: 1, duration: 0.8 }, 0.25);

        // 2. Description
        addFadeRise(tl, subtitle, 0.35);

        // 3/4. Numbers roll; units + label follow each number; 5. dividers draw as the numbers begin.
        const numbersAt = 0.35 + FADE_RISE.stagger + 0.25;
        tl.to(dividers, { scaleY: 1, duration: 0.8, ease: "power2.inOut", stagger: 0.14 }, numbersAt + 0.1);
        specs.forEach((spec, i) => {
          const num = spec.querySelector<HTMLElement>("[data-fx='spec-num']")!;
          const after = spec.querySelectorAll("[data-fx='spec-unit'], [data-fx='spec-label']");
          const start = numbersAt + i * NUMBER_STAGGER;
          const odo = buildOdometer(num, { rowsBefore: ROLL_ROWS, exactAlign: true });
          if (!odo) {
            tl.to(num, { autoAlpha: 1, duration: 0.5 }, start);
            tl.to(after, { autoAlpha: 1, y: 0, duration: 0.5 }, start + 0.45);
            return;
          }
          const origColor = num.style.color;
          num.style.color = "transparent"; // real text hidden; the overlay is the visible roll
          tl.to(num, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, start);
          odo.strips.forEach((strip, d) => {
            // Moved by unrounded `top` and painted in the page (no layer, page-wide hooks overridden): the settled
            // digits are laid out and rasterised like the real number that replaces them (see exactAlign in odometer.ts).
            tl.fromTo(
              strip,
              { top: 0 },
              { top: -odo.rows[d] * odo.rowH, duration: ROLL_DURATION, ease: ROLL_EASE, force3D: false, autoRound: false, onStart: () => undefined, onComplete: () => undefined },
              start + d * DIGIT_STAGGER
            );
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
          tl.to(after, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.06 }, settled - 0.1);
        });
      });
    };

    const st = ScrollTrigger.create({ trigger: root, start: TRIGGER, once: true, onEnter: play });
    if (st.progress > 0) void play(); // already past the trigger at load (reload mid-page)
    // Position-based fallback: a trigger passed during a fast scroll still plays the reveal.
    const evaluate = () => {
      if (!played && root.getBoundingClientRect().top < window.innerHeight * 0.75) void play();
    };
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    cleanups.push(() => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    });
    document.fonts?.ready.then(() => {
      refreshScrollTriggers();
      evaluate();
    });
  }, root);

  return () => {
    disposed = true;
    cleanups.forEach((fn) => fn());
    ctx.revert();
  };
}
