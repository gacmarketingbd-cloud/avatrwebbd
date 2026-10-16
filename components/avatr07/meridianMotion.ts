import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./motionKit";

gsap.registerPlugin(ScrollTrigger);

// Meridian sound-system text: a restrained, Apple-like entrance, played once.
//   title    fades in while rising 14px (one block, no per-character motion)
//   values   25 / 7.1.4 / 2016w / 24: subtle 12px rise + fade, staggered left -> right (no roll or count)
//   labels   each a beat after its own value: fade + 8px rise
//   gradient the dark gradient under the car deepens very slightly (0.82 -> 1 of its own opacity) as the text
//            appears; the final state is the existing design, so the car itself is never noticeably darkened
// Only opacity and `y` are animated; layout, type and spacing never change, and all inline styles are cleared
// at the end so the final frame is exactly the static design.
const TITLE = { y: 14, duration: 0.95, ease: "power2.out" };
const VALUE = { y: 12, duration: 0.8, ease: "power2.out" };
const LABEL = { y: 8, duration: 0.7, ease: "power2.out" };
const VALUE_AT = 0.28; // first value starts this long after the title
const VALUE_STAGGER = 0.12;
const LABEL_LAG = 0.16; // label starts this long after its value
const GRADIENT_FROM = 0.82;
const TRIGGER = 0.88; // fires when the title's top edge is 12% up from the bottom of the screen

export function initMeridianText(section: HTMLElement) {
  const title = section.querySelector<HTMLElement>("h2");
  const gradient = section.querySelector<HTMLElement>("[data-fx='deepen']");
  const specs = [...section.querySelectorAll<HTMLElement>("[data-fx='spec']")];
  if (!title) return;
  const values = specs.map((s) => s.querySelector<HTMLElement>("[data-fx='spec-num']")!);
  const labels = specs.map((s) => s.querySelector<HTMLElement>("[data-fx='spec-label']")!);
  // `after` = optional units (none here, but kept for any spec that has one)
  const units = specs.flatMap((s) => [...s.querySelectorAll<HTMLElement>("[data-fx='spec-unit']")]);

  let played = false;
  let disposed = false;
  let cleanupListeners: () => void = () => {};

  const ctx = gsap.context(() => {
    gsap.set(title, { autoAlpha: 0, y: TITLE.y });
    gsap.set([...values, ...units], { autoAlpha: 0, y: VALUE.y });
    gsap.set(labels, { autoAlpha: 0, y: LABEL.y });
    if (gradient) gsap.set(gradient, { opacity: GRADIENT_FROM });

    const play = async () => {
      if (played || disposed) return;
      played = true;
      if (document.fonts?.ready) await document.fonts.ready;
      if (disposed) return;
      ctx.add(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set([title, ...values, ...units, ...labels], { clearProps: "transform,opacity,visibility" });
            if (gradient) gsap.set(gradient, { clearProps: "opacity" });
          },
        });
        tl.to(title, { autoAlpha: 1, y: 0, duration: TITLE.duration, ease: TITLE.ease }, 0);
        if (gradient) tl.to(gradient, { opacity: 1, duration: 1.4, ease: "sine.inOut" }, 0.1);
        specs.forEach((spec, i) => {
          const at = VALUE_AT + i * VALUE_STAGGER;
          tl.to([values[i], ...spec.querySelectorAll("[data-fx='spec-unit']")], { autoAlpha: 1, y: 0, duration: VALUE.duration, ease: VALUE.ease }, at);
          tl.to(labels[i], { autoAlpha: 1, y: 0, duration: LABEL.duration, ease: LABEL.ease }, at + LABEL_LAG);
        });
      });
    };

    const evaluate = () => {
      if (!played && title.getBoundingClientRect().top < window.innerHeight * TRIGGER) void play();
    };
    ScrollTrigger.create({ trigger: title, start: `top ${TRIGGER * 100}%`, once: true, onEnter: play });
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
