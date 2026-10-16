import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { EASE_RISE } from "./motionKit";

gsap.registerPlugin(ScrollTrigger);

// "Exclusive 6 sound effect algorithms" entrance, played once: the heading fades in with a 14px rise, then the six
// items (RE-Q, Digital Precision, Horizon, Perfect Balance, True time, Intelli-Q) activate one after another in
// reading order. Each item is one unit: the icon fades in with a very subtle 0.94 -> 1 scale, and its title +
// description follow a beat later, rising 12px. No bounce, rotation or large zoom; the layout never changes and
// every inline style is cleared at the end so the final frame is exactly the static design.
const HEADING = { y: 14, duration: 1.0 };
const ITEM_AT = 0.4;
const ITEM_STAGGER = 0.2;
const ICON = { scale: 0.94, duration: 0.95 };
const TEXT_LAG = 0.18; // text starts this long after its icon
const TEXT = { y: 12, duration: 0.95 };
const EASE = EASE_RISE;
// Fires only when this block's heading has reached 75% down the screen (its icon grid is then on screen
// too), never while the block is still far below the fold. There is no exit animation.
const TRIGGER = 0.75;

export function initAlgorithmIntro(section: HTMLElement) {
  const heading = section.querySelector<HTMLElement>("[data-fx='algo-heading']");
  const items = [...section.querySelectorAll<HTMLElement>("[data-fx='algo']")];
  if (!heading || !items.length) return;
  const icons = items.map((it) => it.querySelector<HTMLElement>("img")!);
  const texts = items.map((it) => it.querySelector<HTMLElement>("[data-fx='algo-text']")!);
  let played = false;
  let disposed = false;
  let cleanupListeners: () => void = () => {};

  const ctx = gsap.context(() => {
    gsap.set(heading, { autoAlpha: 0, y: HEADING.y });
    gsap.set(icons, { autoAlpha: 0, scale: ICON.scale, transformOrigin: "50% 50%" });
    gsap.set(texts, { autoAlpha: 0, y: TEXT.y });

    const play = async () => {
      if (played || disposed) return;
      played = true;
      if (document.fonts?.ready) await document.fonts.ready;
      if (disposed) return;
      ctx.add(() => {
        const tl = gsap.timeline({
          onComplete: () => gsap.set([heading, ...icons, ...texts], { clearProps: "transform,opacity,visibility" }),
        });
        tl.to(heading, { autoAlpha: 1, y: 0, duration: HEADING.duration, ease: EASE }, 0);
        items.forEach((_, i) => {
          const at = ITEM_AT + i * ITEM_STAGGER;
          tl.to(icons[i], { autoAlpha: 1, scale: 1, duration: ICON.duration, ease: EASE }, at);
          tl.to(texts[i], { autoAlpha: 1, y: 0, duration: TEXT.duration, ease: EASE }, at + TEXT_LAG);
        });
      });
    };

    const evaluate = () => {
      if (!played && heading.getBoundingClientRect().top < window.innerHeight * TRIGGER) void play();
    };
    ScrollTrigger.create({ trigger: heading, start: `top ${TRIGGER * 100}%`, once: true, onEnter: play });
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
  }, section);

  return () => {
    disposed = true;
    cleanupListeners();
    ctx.revert();
  };
}
