import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildOdometer } from "./odometer";
import { FADE_RISE, TOP_SPEED, addFadeRise, hideFadeRise } from "./fadeRise";

import "./motionKit";

gsap.registerPlugin(ScrollTrigger);

// Coordinated, play-once reveal for the Futuristic Design section.
// Everything animates *to* the section's normal, already-laid-out state, so the
// final frame is exactly the static design. Nothing here changes layout.
//
//   title      masked reveal + slide, straight right -> left on one horizontal axis
//   rule       soft fade / widen (belongs to the heading)
//   subtitle   fade + small rise
//   numbers    vertical odometer roll per digit, staggered
//   labels     fade in just after their number settles
//   awards     rise 18px + scale .92 -> 1, staggered; captions just after
const EASE_OUT = "power2.out"; // softer landing than power3 for the fades
// Heading: ease-in-out so it neither lurches into motion nor stops abruptly.
const TITLE_EASE = "power2.inOut";
const ROLL_EASE = "power3.out"; // gentler than power4: less abrupt at the start, still settles softly
const ROLL_DURATION = 1.7;
const NUMBER_STAGGER = 0.22;
const DIGIT_STAGGER = 0.07;
// Whole sequence is played at this speed (<1 = slower).
const TIME_SCALE = FADE_RISE.timeScale; // shared with every text block that reuses the fade-rise
// The lower half (numbers, labels, awards) runs this much faster than the heading and
// description, which keep the slower TIME_SCALE pace. 1 = same pace, 1.3 = 30% quicker.
const LOWER_SPEED = 1.3;
// Same idea for the top half (heading, rule, description). TOP_SPEED lives in fadeRise.ts.
const g = 1 / TOP_SPEED; // applied to every duration / offset in the top half
const f = 1 / LOWER_SPEED; // applied to every duration / stagger / offset in the lower half
// Heading starts this far to the right and glides in while the mask opens.
const TITLE_SLIDE_X = 90;

export function initSpecsIntroMotion(root: HTMLElement) {
  const q = <T extends HTMLElement>(sel: string) => [...root.querySelectorAll<T>(sel)];
  const title = q("[data-fx='title']");
  const rule = q("[data-fx='rule']");
  const subtitle = q("[data-fx='subtitle']");
  const specs = q("[data-fx='spec']");
  const awards = q("[data-fx='award']");

  const cleanups: Array<() => void> = [];
  let played = false;

  const ctx = gsap.context(() => {
    // ---- Hidden start states (set before first paint via layout effect) ----
    // Horizontal only: no y, no rotation, no scale -> one straight axis, right to left.
    gsap.set(title, { clipPath: "inset(-0.15em 0px -0.2em 100%)", x: TITLE_SLIDE_X });
    gsap.set(rule, { autoAlpha: 0, scaleX: 0.86, transformOrigin: "50% 50%" });
    hideFadeRise(subtitle);
    specs.forEach((s) => {
      gsap.set(s.querySelector("[data-fx='spec-value']"), { autoAlpha: 0 });
      gsap.set(s.querySelector("[data-fx='spec-label']"), { autoAlpha: 0, y: 6 });
    });
    awards.forEach((a) => {
      gsap.set(a.querySelector("img"), { autoAlpha: 0, y: 18, scale: 0.92, transformOrigin: "50% 50%" });
      gsap.set(a.querySelector("[data-fx='award-cap']"), { autoAlpha: 0, y: 6 });
    });

    const play = async () => {
      if (played) return;
      played = true;
      if (document.fonts?.ready) await document.fonts.ready;

      ctx.add(() => {
        const tl = gsap.timeline({
          defaults: { ease: EASE_OUT },
          // Leave the static design behind: no clip, transform, opacity or layer hint left on anything.
          onComplete: () =>
            gsap.set(
              [
                ...title, ...rule, ...subtitle,
                ...specs.flatMap((s) => [s.querySelector("[data-fx='spec-value']"), s.querySelector("[data-fx='spec-label']")]),
                ...awards.flatMap((a) => [a.querySelector("img"), a.querySelector("[data-fx='award-cap']")]),
              ],
              { clearProps: "clipPath,transform,opacity,visibility" }
            ),
        });
        tl.timeScale(TIME_SCALE);

        // 1. Heading — masked reveal right -> left, slight upward settle.
        tl.to(title, { clipPath: "inset(-0.15em 0px -0.2em 0%)", x: 0, duration: 1.5 * g, ease: TITLE_EASE }, 0);
        tl.to(rule, { autoAlpha: 1, scaleX: 1, duration: 1 * g, ease: "power2.out" }, 0.3 * g);

        // 2. Description — fade + small rise, shortly after the heading.
        addFadeRise(tl, subtitle, FADE_RISE.stagger);

        // 3/4. Numbers roll (staggered); each label fades in as its number settles.
        const numbersAt = 1.0 * g; // follows the (now quicker) description without a dead gap
        specs.forEach((spec, i) => {
          const value = spec.querySelector<HTMLElement>("[data-fx='spec-value']")!;
          const numEl = spec.querySelector<HTMLElement>("[data-fx='spec-num']")!;
          const label = spec.querySelector<HTMLElement>("[data-fx='spec-label']")!;
          const start = numbersAt + i * NUMBER_STAGGER * f;

          const odo = buildOdometer(numEl);
          if (!odo) {
            tl.to(value, { autoAlpha: 1, duration: 0.6 * f }, start);
          } else {
            const origColor = numEl.style.color;
            numEl.style.color = "transparent"; // real text hidden; overlay is the visible roll
            tl.to(value, { autoAlpha: 1, duration: 0.3 * f, ease: "power1.out" }, start);
            odo.strips.forEach((strip, d) => {
              tl.fromTo(
                strip,
                { y: 0 },
                { y: -odo.rows[d] * odo.rowH, duration: ROLL_DURATION * f, ease: ROLL_EASE },
                start + d * DIGIT_STAGGER * f
              );
            });
            const settled = start + (odo.strips.length - 1) * DIGIT_STAGGER * f + ROLL_DURATION * f;
            tl.call(
              () => {
                numEl.style.color = origColor;
                odo.overlay.remove();
              },
              undefined,
              settled
            );
            cleanups.push(() => {
              numEl.style.color = origColor;
              odo.overlay.remove();
            });
            tl.to(label, { autoAlpha: 1, y: 0, duration: 0.7 * f }, settled - 0.35 * f);
            return;
          }
          tl.to(label, { autoAlpha: 1, y: 0, duration: 0.7 * f }, start + 0.8 * f);
        });

        // 5. Awards — rise + scale, staggered; captions just after each logo.
        const awardsAt = numbersAt + (specs.length * NUMBER_STAGGER + 0.75) * f;
        awards.forEach((a, i) => {
          const at = awardsAt + i * 0.2 * f;
          tl.to(a.querySelector("img"), { autoAlpha: 1, y: 0, scale: 1, duration: 1 * f }, at);
          tl.to(a.querySelector("[data-fx='award-cap']"), { autoAlpha: 1, y: 0, duration: 0.7 * f }, at + 0.4 * f);
        });
      });
    };

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top 75%",
      once: true,
      onEnter: play,
    });
    // Already scrolled past the start (e.g. reload mid-page): play straight away.
    if (st.progress > 0) play();

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, root);

  return () => {
    cleanups.forEach((fn) => fn());
    ctx.revert();
  };
}
