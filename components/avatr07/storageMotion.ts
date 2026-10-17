import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { refreshScrollTriggers } from "./scrollRefresh";

import { EASE_RISE, MAX_RISE } from "./motionKit";

gsap.registerPlugin(ScrollTrigger);

// Flexible Storage text panel: the panel "opens up" — a space-expanding entrance, played once.
//   panel     the dark band is revealed from its centre out to the left and right edges (clip-path), already at
//             its final size in the layout, so nothing shifts
//   heading   follows almost immediately: a centre-outward horizontal mask + opacity (no bounce/rotation, not
//             per character)
//   copy      the whole block fades up 18px a beat after the heading
//   figures   1.8 m / 1,325 L / 3 m² ease from slightly dimmer white to full white with a 0.98 -> 1 scale,
//             same final size; no rolling
// The clip is written explicitly each frame from a progress value (GSAP mispairs inset() shorthand values).
// Everything is cleared at the end, so the final frame is exactly the static design.
const TRIGGER = 0.88; // fires when the panel's top edge is 12% up from the bottom of the screen
const PANEL_DURATION = 1.6; // slower, smoother opening
const HEADING_AT = 0.38;
const HEADING_DURATION = 1.0;
const COPY_AT = 0.95;
const COPY_DURATION = 0.8;
const FIGURE_AT = 1.4;
const FIGURE_STAGGER = 0.14;
const FIGURE_DIM = "rgba(255, 255, 255, 0.68)";

export function initStorageText(section: HTMLElement) {
  const panel = section.querySelector<HTMLElement>("[data-fx='panel']");
  const heading = section.querySelector<HTMLElement>("h2");
  const copy = section.querySelector<HTMLElement>("h2 + p");
  const figures = [...section.querySelectorAll<HTMLElement>("[data-fx='hl']")];
  if (!panel || !heading || !copy) return;

  let played = false;
  let disposed = false;
  let cleanupListeners: () => void = () => {};

  // closed = 50% inset from each side (zero width, at the centre); open = 0%
  const panelClip = (p: number) => `inset(0px ${p}% 0px ${p}%)`;
  const headingClip = (p: number) => `inset(-0.2em ${p}% -0.3em ${p}%)`;
  const prog = { panel: 50, heading: 50 };
  const apply = () => {
    panel.style.clipPath = panelClip(prog.panel);
    heading.style.clipPath = headingClip(prog.heading);
  };

  const ctx = gsap.context(() => {
    apply();
    gsap.set(heading, { autoAlpha: 0 });
    gsap.set(copy, { autoAlpha: 0, y: MAX_RISE });
    gsap.set(figures, { color: FIGURE_DIM, scale: 0.98, transformOrigin: "50% 60%" });

    const play = async () => {
      if (played || disposed) return;
      played = true;
      if (document.fonts?.ready) await document.fonts.ready;
      if (disposed) return;
      ctx.add(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            panel.style.clipPath = "";
            heading.style.clipPath = "";
            gsap.set([heading, copy], { clearProps: "transform,opacity,visibility" });
            gsap.set(figures, { clearProps: "color,transform" });
          },
        });
        tl.to(prog, { panel: 0, duration: PANEL_DURATION, ease: "sine.inOut", onUpdate: apply }, 0);
        tl.to(prog, { heading: 0, duration: HEADING_DURATION, ease: "sine.out", onUpdate: apply }, HEADING_AT);
        tl.to(heading, { autoAlpha: 1, duration: HEADING_DURATION * 0.8, ease: EASE_RISE }, HEADING_AT);
        tl.to(copy, { autoAlpha: 1, y: 0, duration: COPY_DURATION, ease: "power2.out" }, COPY_AT);
        figures.forEach((f, i) => tl.to(f, { color: "rgb(255, 255, 255)", scale: 1, duration: 0.7, ease: EASE_RISE }, FIGURE_AT + i * FIGURE_STAGGER));
      });
    };

    const evaluate = () => {
      if (!played && panel.getBoundingClientRect().top < window.innerHeight * TRIGGER) void play();
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
  }, section);

  return () => {
    disposed = true;
    cleanupListeners();
    panel.style.clipPath = "";
    heading.style.clipPath = "";
    ctx.revert();
  };
}
