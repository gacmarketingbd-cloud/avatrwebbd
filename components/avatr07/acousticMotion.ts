import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { refreshScrollTriggers } from "./scrollRefresh";

import { EASE_RISE } from "./motionKit";

gsap.registerPlugin(ScrollTrigger);

// Acoustic-materials entrance (main heading + the four material cards), played once. Restrained:
//   heading  fade + 14px rise
//   cards    TL and BL slide in from the left, TR and BR from the right, only 24px, staggered
//   borders  each card's 1px border is drawn into place, edge by edge clockwise (top -> right -> bottom ->
//            left), a quiet hairline wipe rather than a stroke effect
//   text     the card title appears first, its description just after
// No scale, rotation or bounce; the background photo, the second heading and the icon grid are untouched.
// While it plays, the real CSS border is made transparent and four hairline edge elements (same colour,
// same box) are drawn over it; they are removed and the real border restored at the end, so the final frame
// is exactly the static design.
const SHIFT = 24;
const CARD_AT = 0.3;
const CARD_STAGGER = 0.2;
const CARD_DURATION = 0.9;
const EDGE_DURATION = 0.32;
const EDGE_LAG = 0.2; // each following edge starts this long after the previous
const TITLE_LAG = 0.4;
const DESC_LAG = 0.58;
const TRIGGER = 0.85;

export function initAcousticIntro(section: HTMLElement) {
  const heading = section.querySelector<HTMLElement>("h2");
  const cards = [...section.querySelectorAll<HTMLElement>("[data-fx='card']")];
  if (!heading || !cards.length) return;
  let played = false;
  let disposed = false;
  const cleanups: Array<() => void> = [];

  const ctx = gsap.context(() => {
    gsap.set(heading, { autoAlpha: 0, y: 14 });
    const prepared = cards.map((card, i) => {
      const fromLeft = i % 2 === 0; // order: TL, TR, BL, BR
      const color = getComputedStyle(card).borderTopColor;
      const mk = (css: string) => {
        const e = document.createElement("span");
        e.setAttribute("aria-hidden", "true");
        e.style.cssText = `position:absolute;pointer-events:none;background:${color};${css}`;
        card.appendChild(e);
        return e;
      };
      // positioned over the 1px border (card is position:relative): corners belong to the top/bottom edges
      const top = mk("top:-1px;left:-1px;right:-1px;height:1px;transform-origin:0 50%;");
      const right = mk("top:0;bottom:0;right:-1px;width:1px;transform-origin:50% 0;");
      const bottom = mk("bottom:-1px;left:-1px;right:-1px;height:1px;transform-origin:100% 50%;");
      const left = mk("top:0;bottom:0;left:-1px;width:1px;transform-origin:50% 100%;");
      const edges = [top, right, bottom, left];
      const prevBorder = card.style.borderColor;
      card.style.borderColor = "transparent";
      gsap.set([top, bottom], { scaleX: 0 });
      gsap.set([right, left], { scaleY: 0 });
      gsap.set(card, { x: fromLeft ? -SHIFT : SHIFT });
      const t = card.querySelector("[data-fx='card-title']");
      const d = card.querySelector("[data-fx='card-desc']");
      gsap.set([t, d], { autoAlpha: 0 });
      cleanups.push(() => {
        edges.forEach((e) => e.remove());
        card.style.borderColor = prevBorder;
      });
      return { card, edges, t, d };
    });

    const play = async () => {
      if (played || disposed) return;
      played = true;
      if (document.fonts?.ready) await document.fonts.ready;
      if (disposed) return;
      ctx.add(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            cleanups.splice(0).forEach((fn) => fn()); // remove the edge elements, restore the real borders
            gsap.set([heading, ...cards, ...cards.flatMap((c) => [...c.querySelectorAll("[data-fx^='card-']")])], { clearProps: "transform,opacity,visibility" });
          },
        });
        tl.to(heading, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" }, 0);
        prepared.forEach(({ card, edges, t, d }, i) => {
          const at = CARD_AT + i * CARD_STAGGER;
          tl.to(card, { x: 0, duration: CARD_DURATION, ease: EASE_RISE }, at);
          edges.forEach((e, k) => {
            const prop = k % 2 === 0 ? { scaleX: 1 } : { scaleY: 1 };
            tl.to(e, { ...prop, duration: EDGE_DURATION, ease: "sine.inOut" }, at + 0.1 + k * EDGE_LAG);
          });
          tl.to(t, { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, at + TITLE_LAG);
          tl.to(d, { autoAlpha: 1, duration: 0.65, ease: "power2.out" }, at + DESC_LAG);
        });
      });
    };

    const evaluate = () => {
      if (!played && heading.getBoundingClientRect().top < window.innerHeight * TRIGGER) void play();
    };
    ScrollTrigger.create({ trigger: heading, start: `top ${TRIGGER * 100}%`, once: true, onEnter: play });
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    cleanups.push(() => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    });
    evaluate();
    document.fonts?.ready.then(() => {
      refreshScrollTriggers();
      evaluate();
    });
  }, section);

  return () => {
    disposed = true;
    cleanups.splice(0).forEach((fn) => fn());
    ctx.revert();
  };
}
