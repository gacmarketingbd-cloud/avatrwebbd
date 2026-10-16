import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// HarmonySpace 5: a staged, Apple-style fade-up reveal, played once, only when the section properly enters
// the viewport:
//   1. heading + subtitle (one group)  fade + 14px rise
//   2. first card (left)               fade + 20px rise, a beat after the heading
//   3. second card (right)             the same, clearly staggered after the first
//   4. the arrows                      a quiet fade, once both cards are in
//
// The movement is a plain CSS transition on opacity + translate3d, NOT a JavaScript (GSAP) tween. A transition
// on those two properties is run by the browser's compositor thread, so it stays perfectly smooth even if the
// main thread is busy (page scroll handlers, two 1080p videos starting up, image decoding, ...). A JS tween is
// stepped on the main thread, and any hitch there shows up as the card stuttering against the page scroll,
// which is the "shake while appearing" this replaces. Easing is the Apple-style cubic-bezier(0.22, 1, 0.36, 1)
// (a soft power-out); no bounce or overshoot.
//
// Only the inner wrapper of each card moves (the article stays the static layout box). Cards 3 and 4 sit off
// to the right of the slider and are not staged. Inline styles are cleared when everything has settled, so the
// final frame is exactly the static design.
const TRIGGER = 0.75; // heading top edge 25% up from the bottom of the screen: the whitespace above has been scrolled through
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DURATION = 1000; // ms
const GROUP_Y = 14;
const CARD_Y = 20;
const CARD_AT = 450;
const CARD_STAGGER = 600; // the first card has settled before the second one starts

export function initHarmonyReveal(section: HTMLElement, onDone?: () => void) {
  const group = [section.querySelector<HTMLElement>("h2"), section.querySelector<HTMLElement>("h2 + p")].filter(Boolean) as HTMLElement[];
  // Animate the INNER wrapper of each card; the article itself (the layout box) is never transformed.
  const cards = [...section.querySelectorAll<HTMLElement>("article")].slice(0, 2).map((a) => a.querySelector<HTMLElement>("[data-fx='card-inner']") ?? a);
  const arrows = section.querySelector<HTMLElement>("[data-fx='arrows']");
  const trigger = group[0];
  if (!trigger || !cards.length) return;
  const arrowsDelay = CARD_AT + (cards.length - 1) * CARD_STAGGER + 700;

  let played = false;
  let disposed = false;
  let finishTimer = 0;
  let cleanupListeners: () => void = () => {};
  const all = [...group, ...cards, ...(arrows ? [arrows] : [])];

  const clear = () => {
    for (const el of all) {
      el.style.transition = "";
      el.style.opacity = "";
      el.style.transform = "";
      el.style.willChange = "";
      el.style.backfaceVisibility = "";
    }
  };

  // Hidden start state. The cards get their own compositing layer BEFORE the reveal starts, so nothing
  // re-rasterises (the shake) when it begins.
  for (const [el, y] of [...group.map((g) => [g, GROUP_Y] as const), ...cards.map((c) => [c, CARD_Y] as const)]) {
    el.style.opacity = "0";
    el.style.transform = `translate3d(0, ${y}px, 0)`;
    el.style.willChange = "transform, opacity";
    el.style.backfaceVisibility = "hidden";
  }
  if (arrows) arrows.style.opacity = "0";

  const play = () => {
    if (played || disposed) return;
    played = true;
    void section.offsetHeight; // commit the hidden state before flipping every target with its own delay
    requestAnimationFrame(() => {
      if (disposed) return;
      const run = (el: HTMLElement, delay: number, move: boolean) => {
        el.style.transition = `opacity ${DURATION}ms ${EASE} ${delay}ms${move ? `, transform ${DURATION}ms ${EASE} ${delay}ms` : ""}`;
        el.style.opacity = "1";
        if (move) el.style.transform = "translate3d(0, 0, 0)";
      };
      group.forEach((g) => run(g, 0, true));
      cards.forEach((c, i) => run(c, CARD_AT + i * CARD_STAGGER, true));
      if (arrows) run(arrows, arrowsDelay, false);
      const total = Math.max(CARD_AT + (cards.length - 1) * CARD_STAGGER, arrows ? arrowsDelay : 0) + DURATION + 80;
      finishTimer = window.setTimeout(() => {
        if (disposed) return;
        clear();
        onDone?.(); // now the videos in the revealed cards can start
      }, total);
    });
  };

  const ctx = gsap.context(() => {
    const evaluate = () => {
      if (!played && trigger.getBoundingClientRect().top < window.innerHeight * TRIGGER) play();
    };
    ScrollTrigger.create({ trigger, start: `top ${TRIGGER * 100}%`, once: true, onEnter: play });
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
    window.clearTimeout(finishTimer);
    cleanupListeners();
    ctx.revert();
    clear();
  };
}
