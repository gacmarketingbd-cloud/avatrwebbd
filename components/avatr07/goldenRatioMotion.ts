import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { refreshScrollTriggers } from "./scrollRefresh";
import { buildOdometer } from "./odometer";

import "./motionKit";

gsap.registerPlugin(ScrollTrigger);

// Two fully INDEPENDENT, play-once, non-scrubbed timelines for the Golden Ratio Proportions block.
// The photo never moves and every element animates *to* its normal laid-out state, so the final
// frame is exactly the static design.
//
//   A. OVERLAY  starts when the photo frame reaches its trigger point. Crossing diagonals ->
//               vertical line -> the seven circles, traced live at a fixed pace.
//   B. TEXT     starts when the text block reaches its own (lower) trigger point. The heading opens
//               centre-out through a horizontal mask (scale .98 -> 1); the three ratios reveal
//               left -> right with their separators and a short digit roll.
//
// Independence rules:
//   * Neither timeline reads the other's state, waits for it, or shortens it.
//   * Scroll position/speed never scrubs, skips, completes or fast-forwards either timeline; once
//     started each one simply runs to its end at its own pace.
//   * Fast scrolling straight to the text: the text timeline starts right there (its heading opens
//     at once, so the block is never empty), while the overlay may still be finishing above.
//   * The triggers are evaluated from each block's own position on every scroll, so neither can be
//     missed (jumps, flings, reloads mid-page) — a trigger that has been passed always starts its
//     own timeline.

// ---- triggers (fraction of viewport height measured from the top) ----
const OVERLAY_AT = 0.65; // photo top edge reaches 65% down the screen
const TEXT_AT = 0.85; // text block top edge reaches 85% down the screen (needs more scroll)

// ---- overlay (starts at t = 0) ----
const LINE_EASE = "power1.inOut";
const LINE_DURATION = 1.2;
const VERTICAL_AT = 0.7;
const VERTICAL_DURATION = 0.85;
const CIRCLE_EASE = "sine.inOut";
const CIRCLES_AT = 1.3;
const CIRCLE_STAGGER = 0.24;
const CIRCLE_DURATION = 0.65;

// ---- text ----
const TITLE_DURATION = 0.9;
const TITLE_EASE = "power2.inOut";
const RATIOS_AT = 0.5; // first group starts
const RATIO_STAGGER = 0.34;
const RATIO_REVEAL = 0.6;
const SEP_DURATION = 0.35;
const ROLL_DELAY = 0.12; // value starts rolling just after its group starts revealing
const ROLL_DURATION = 0.65;
const ROLL_ROWS = 6; // "very short": only a handful of digits pass before the final one
const ROLL_DIGIT_STAGGER = 0.05;
const ROLL_EASE = "power2.out";

// NOTE: GSAP's own tween of `strokeDashoffset` on these <line>/<circle> elements does not
// interpolate here (it jumps 1 -> 0, so strokes pop in whole). Instead GSAP times a plain
// 0..1 progress value and we write the dash offset ourselves every frame, which traces the
// path smoothly. Undrawn = offset 1, drawn = offset 0 (paths use pathLength=1).
const setOffset = (el: SVGElement, v: number) => {
  el.style.strokeDashoffset = v.toFixed(4);
};

function draw(tl: gsap.core.Timeline, el: SVGElement, duration: number, ease: string, at: number) {
  const progress = { p: 1 };
  tl.to(progress, { p: 0, duration, ease, onUpdate: () => setOffset(el, progress.p) }, at);
}

export function initGoldenRatioMotion(frame: HTMLElement, text: HTMLElement) {
  const qs = <T extends Element>(root: HTMLElement, sel: string) => [...root.querySelectorAll<T>(sel)];
  const title = qs<HTMLElement>(text, "[data-fx='gr-title']");
  const groups = qs<HTMLElement>(text, "[data-fx='gr-ratio']");
  const groupTexts = groups.map((g) => g.querySelector<HTMLElement>("[data-fx='gr-text']")!);
  const lineDown = qs<SVGElement>(frame, "[data-gr-line='diag-down']");
  const lineUp = qs<SVGElement>(frame, "[data-gr-line='diag-up']");
  const vertical = qs<SVGElement>(frame, "[data-gr-line='vertical']");
  const circles = qs<SVGElement>(frame, "[data-gr-circle]");
  const strokes = [...lineDown, ...lineUp, ...vertical, ...circles];

  const cleanups: Array<() => void> = []; // restore digit colours / remove roll overlays
  let overlayStarted = false;
  let textStarted = false;
  let disposed = false; // React Strict Mode runs effects twice in dev: a disposed init must go quiet
  // Declared before gsap.context() because the context callback runs immediately and assigns it.
  let cleanupListeners: () => void = () => {};

  // `self` is the context itself. The callback below runs immediately and may already start a
  // timeline (when a block is past its trigger at load), at which point `const ctx` would not have
  // been assigned yet — hence `self`, never `ctx`, inside the callback.
  const ctx = gsap.context((self) => {
    const run = (fn: () => void) => self.add(fn);

    // ---- hidden start states (set before first paint by the layout effect) ----
    // Text block: blank, but its space stays reserved (visibility/opacity only, no layout change).
    title.forEach((el) => (el.style.clipPath = "inset(-0.15em 50% -0.2em 50%)")); // collapsed to a centre line
    gsap.set(title, { scale: 0.98, transformOrigin: "50% 50%", autoAlpha: 0 });
    groups.forEach((g, i) => {
      gsap.set(groupTexts[i], { autoAlpha: 0, clipPath: "inset(0px 100% 0px 0px)" });
      const sepEl = g.querySelector("[data-fx='gr-sep']");
      if (sepEl) gsap.set(sepEl, { scaleY: 0, transformOrigin: "50% 50%" });
    });
    // Overlay: everything undrawn. A circle's stroke begins at 3 o'clock; start at 12 o'clock.
    strokes.forEach((el) => setOffset(el, 1));
    circles.forEach((c) => {
      gsap.set(c, { rotation: -90, svgOrigin: `${c.getAttribute("cx")} ${c.getAttribute("cy")}` });
    });

    // ---------------- A. overlay timeline ----------------
    const playOverlay = () => {
      if (overlayStarted || disposed) return;
      overlayStarted = true;
      run(() => {
        const tl = gsap.timeline({ onComplete: () => strokes.forEach((el) => (el.style.strokeDashoffset = "")) });
        lineDown.forEach((el) => draw(tl, el, LINE_DURATION, LINE_EASE, 0));
        lineUp.forEach((el) => draw(tl, el, LINE_DURATION, LINE_EASE, 0));
        vertical.forEach((el) => draw(tl, el, VERTICAL_DURATION, LINE_EASE, VERTICAL_AT));
        circles.forEach((el, i) => draw(tl, el, CIRCLE_DURATION, CIRCLE_EASE, CIRCLES_AT + i * CIRCLE_STAGGER));
      });
    };

    // ---------------- B. text timeline ----------------
    const playText = () => {
      if (textStarted || disposed) return;
      textStarted = true;
      run(async () => {
        if (document.fonts?.ready) await document.fonts.ready; // digit positions need the final font
        if (disposed) return;
        const tl = gsap.timeline({
          onComplete: () => {
            // Leave clean, static styles behind once everything has settled.
            title.forEach((el) => (el.style.clipPath = ""));
            gsap.set(
              [...title, ...groupTexts, ...groups.map((g) => g.querySelector("[data-fx='gr-sep']")).filter((e): e is Element => e !== null)],
              { clearProps: "clipPath,transform,opacity,visibility" }
            );
          },
        });

        // 1. Heading — centre-out horizontal mask, slight scale, no other movement. The clip is
        // written explicitly (equal left/right insets every frame) rather than tweened as a string:
        // browsers serialise `inset(a 50% c 50%)` to three values, which makes GSAP pair the numbers
        // wrongly and open the mask lopsidedly.
        tl.set(title, { autoAlpha: 1 }, 0);
        const open = { p: 0 };
        tl.to(
          open,
          {
            p: 1,
            duration: TITLE_DURATION,
            ease: TITLE_EASE,
            onUpdate: () => {
              const side = ((1 - open.p) * 50).toFixed(3);
              title.forEach((el) => (el.style.clipPath = `inset(-0.15em ${side}% -0.2em ${side}%)`));
            },
          },
          0
        );
        tl.to(title, { scale: 1, duration: TITLE_DURATION, ease: TITLE_EASE }, 0);

        // 2. Ratios — left to right; separators draw in; values roll briefly and settle.
        groups.forEach((g, i) => {
          const start = RATIOS_AT + i * RATIO_STAGGER;
          const sep = g.querySelector<HTMLElement>("[data-fx='gr-sep']");
          const numEl = g.querySelector<HTMLElement>("[data-fx='gr-num']")!;

          if (sep) tl.to(sep, { scaleY: 1, duration: SEP_DURATION, ease: "power2.out" }, start);
          tl.to(
            groupTexts[i],
            { autoAlpha: 1, clipPath: "inset(0px 0% 0px 0px)", duration: RATIO_REVEAL, ease: "power2.inOut" },
            start
          );

          const odo = buildOdometer(numEl, { rowsBefore: ROLL_ROWS });
          if (!odo) return;
          const origColor = numEl.style.color;
          numEl.style.color = "transparent"; // real digits hidden; the overlay is the visible roll
          const restore = () => {
            numEl.style.color = origColor;
            odo.overlay.remove();
          };
          cleanups.push(restore);
          odo.strips.forEach((strip, d) => {
            tl.fromTo(
              strip,
              { y: 0 },
              { y: -odo.rows[d] * odo.rowH, duration: ROLL_DURATION, ease: ROLL_EASE },
              start + ROLL_DELAY + d * ROLL_DIGIT_STAGGER
            );
          });
          const end = start + ROLL_DELAY + (odo.strips.length - 1) * ROLL_DIGIT_STAGGER + ROLL_DURATION;
          tl.call(restore, undefined, end);
        });
      });
    };

    // ---------------- triggers: each block starts ONLY its own timeline ----------------
    // Evaluated from each block's own position (scroll, resize, load, fonts), so a trigger that has
    // been passed — however fast — always starts its timeline, and nothing else is touched.
    const evaluate = () => {
      if (disposed) return;
      if (!overlayStarted && frame.getBoundingClientRect().top < window.innerHeight * OVERLAY_AT) playOverlay();
      if (!textStarted && text.getBoundingClientRect().top < window.innerHeight * TEXT_AT) playText();
    };
    ScrollTrigger.create({ trigger: frame, start: `top ${OVERLAY_AT * 100}%`, once: true, onEnter: playOverlay });
    ScrollTrigger.create({ trigger: text, start: `top ${TEXT_AT * 100}%`, once: true, onEnter: playText });
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    evaluate(); // already beyond a trigger at load (e.g. reload mid-page)
    document.fonts?.ready.then(() => {
      refreshScrollTriggers();
      evaluate();
    });

    cleanupListeners = () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, text);

  return () => {
    disposed = true;
    cleanupListeners();
    cleanups.forEach((fn) => fn());
    ctx.revert();
    strokes.forEach((el) => (el.style.strokeDashoffset = ""));
    title.forEach((el) => (el.style.clipPath = ""));
  };
}
