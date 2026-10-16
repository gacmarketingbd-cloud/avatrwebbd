import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./motionKit";

gsap.registerPlugin(ScrollTrigger);

// Sunroof copy: a LINE-based masked reveal. The text sits in its final layout from the first frame; each
// line (data-line) is wiped in left -> right by a clip-path mask, line 1 first and line 2 a short beat later,
// so the sentence is readable as soon as the wipe starts passing over it. The three highlighted figures
// (data-hl: 1.46M², 99.99%, 98.1%) are already at their final larger size; as the wipe reaches each one it
// gets a very subtle opacity + scale emphasis (0.985 -> 1.02 -> 1, centred). Only clip-path, opacity and
// transform are animated: never font-size, line-height, width, height, filters or backgrounds, so nothing
// reflows. Everything is cleared at the end so the final frame is exactly the static design.
const LINE_DURATION = 0.85;
const LINE_STAGGER = 0.22; // line 2 starts this long after line 1
const WIPE_EASE = "sine.out"; // p = sin(pi*t/2); inverted below to time each figure's emphasis
const HL_FROM = { scale: 0.985, opacity: 0.7 };
const HL_UP = 0.28;
const HL_DOWN = 0.36;
const TRIGGER = 0.85; // fires when the copy's top edge is 15% up from the bottom of the screen
// Padded vertically so ascenders, descenders and the superscript are never clipped by the mask.
const HIDDEN = "inset(-0.3em 100% -0.4em 0px)";
const SHOWN = "inset(-0.3em 0% -0.4em 0px)";

export function initSunroofCopy(root: HTMLElement) {
  const lines = [...root.querySelectorAll<HTMLElement>("[data-line]")];
  const hls = [...root.querySelectorAll<HTMLElement>("[data-hl]")];
  let played = false;
  let disposed = false;
  let cleanupListeners: () => void = () => {};

  const ctx = gsap.context(() => {
    gsap.set(lines, { clipPath: HIDDEN });
    gsap.set(hls, { ...HL_FROM, transformOrigin: "50% 50%" });

    const play = async () => {
      if (played || disposed) return;
      played = true;
      if (document.fonts?.ready) await document.fonts.ready;
      if (disposed) return;
      ctx.add(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(lines, { clearProps: "clipPath" });
            gsap.set(hls, { clearProps: "transform,opacity" });
          },
        });
        lines.forEach((line, li) => {
          const start = li * LINE_STAGGER;
          tl.to(line, { clipPath: SHOWN, duration: LINE_DURATION, ease: WIPE_EASE }, start);
          const lw = line.offsetWidth || 1;
          line.querySelectorAll<HTMLElement>("[data-hl]").forEach((hl) => {
            // time at which the wipe (sine.out) reaches the middle of this figure
            const frac = Math.min(1, Math.max(0, (hl.offsetLeft + hl.offsetWidth / 2) / lw));
            const at = start + LINE_DURATION * ((2 / Math.PI) * Math.asin(frac));
            tl.to(hl, { scale: 1.02, opacity: 1, duration: HL_UP, ease: "sine.out" }, at);
            tl.to(hl, { scale: 1, duration: HL_DOWN, ease: "sine.inOut" }, at + HL_UP);
          });
        });
      });
    };

    const evaluate = () => {
      if (!played && root.getBoundingClientRect().top < window.innerHeight * TRIGGER) void play();
    };
    ScrollTrigger.create({ trigger: root, start: `top ${TRIGGER * 100}%`, once: true, onEnter: play });
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    cleanupListeners = () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
    evaluate();
    document.fonts?.ready.then(() => {
      ScrollTrigger.refresh();
      evaluate();
    });
  }, root);

  return () => {
    disposed = true;
    cleanupListeners();
    ctx.revert();
  };
}
