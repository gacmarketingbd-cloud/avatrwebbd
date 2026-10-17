import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { refreshScrollTriggers } from "./scrollRefresh";

gsap.registerPlugin(ScrollTrigger);

// The page's standard Apple-style staged reveal, as a reusable helper. Each step fades its elements in while
// rising a few px (and, for images, a hairline 0.985 -> 1 scale). It is a plain CSS transition on opacity +
// translate3d/scale, so the browser's compositor thread runs it and it stays smooth even if the main thread is
// busy (a JavaScript tween steps on the main thread, and any hitch there shows up as shaking against page scroll).
//
//  * the final box of every element is already laid out (only opacity/transform ever change: no layout shift)
//  * elements are promoted to their own layer BEFORE the reveal starts, so nothing re-rasterises when it begins
//  * runs once; a ScrollTrigger plus a position check (a fast scroll can't skip it), with a `played` latch
//  * inline styles are cleared when everything has settled, so the final frame is exactly the static design
//  * a step with `move: false` animates opacity only (for elements that carry their own CSS transform)
const REVEAL_EASE = "cubic-bezier(0.25, 0.46, 0.45, 0.94)"; // power2.out
const REVEAL_MS = 1000;

type RevealStep = {
  els: (HTMLElement | null | undefined)[];
  delay: number; // ms after the trigger
  y?: number; // px the element starts below its place
  scale?: number; // start scale (images only)
  duration?: number; // ms
  move?: boolean; // false = no transform (opacity only unless `fade` is also false)
  opacityFrom?: number; // start opacity (default 0); a 'slightly reduced' start for images that resolve into focus
  fade?: boolean; // false = do not touch opacity (e.g. only the inner image scales while its frame fades)
  filter?: string; // start filter (e.g. 'grayscale(0.5) contrast(0.85)') that resolves to `none`
};

export function initCssReveal(
  section: HTMLElement,
  trigger: HTMLElement | null,
  steps: RevealStep[],
  opts: { triggerAt?: number; onDone?: () => void; gate?: Promise<unknown> } = {},
) {
  const triggerAt = opts.triggerAt ?? 0.8; // the trigger element's top edge is this far down the screen
  const prepared = steps.map((s) => ({ ...s, els: s.els.filter(Boolean) as HTMLElement[], move: s.move !== false, fade: s.fade !== false }));
  const all = prepared.flatMap((s) => s.els);
  if (!trigger || !all.length) return;

  let played = false;
  let disposed = false;
  let timer = 0;
  let cleanupListeners: () => void = () => {};

  const from = (s: (typeof prepared)[number]) => `translate3d(0, ${s.y ?? 0}px, 0)${s.scale ? ` scale(${s.scale})` : ""}`;
  const clear = () => {
    for (const el of all) {
      el.style.transition = "";
      el.style.opacity = "";
      el.style.filter = "";
      el.style.transform = "";
      el.style.transformOrigin = "";
      el.style.willChange = "";
      el.style.backfaceVisibility = "";
    }
  };

  for (const s of prepared) {
    for (const el of s.els) {
      if (s.fade) el.style.opacity = String(s.opacityFrom ?? 0);
      if (s.filter) el.style.filter = s.filter;
      if (s.move) {
        el.style.transform = from(s);
        el.style.transformOrigin = "50% 50%";
      }
      el.style.willChange = [s.move && "transform", s.fade && "opacity", s.filter && "filter"].filter(Boolean).join(", ");
      el.style.backfaceVisibility = "hidden";
    }
  }

  // `gate`: do not start until this promise settles (a later stage of a hierarchy waits for the earlier one, so
  // even a fast scroll that satisfies both triggers at once still reveals them in order).
  const play = () => {
    if (played || disposed) return;
    played = true;
    void (opts.gate ?? Promise.resolve()).then(start);
  };
  const start = () => {
    if (disposed) return;
    void section.offsetHeight; // commit the hidden state before flipping every target with its own delay
    requestAnimationFrame(() => {
      if (disposed) return;
      let end = 0;
      for (const s of prepared) {
        const d = s.duration ?? REVEAL_MS;
        end = Math.max(end, s.delay + d);
        for (const el of s.els) {
          el.style.transition = [s.fade && "opacity", s.move && "transform", s.filter && "filter"]
            .filter(Boolean)
            .map((p) => `${p} ${d}ms ${REVEAL_EASE} ${s.delay}ms`)
            .join(", ");
          if (s.fade) el.style.opacity = "1";
          if (s.filter) el.style.filter = "none";
          if (s.move) el.style.transform = "translate3d(0, 0, 0)";
        }
      }
      timer = window.setTimeout(() => {
        if (disposed) return;
        clear();
        opts.onDone?.();
      }, end + 80);
    });
  };

  const ctx = gsap.context(() => {
    const evaluate = () => {
      if (!played && trigger.getBoundingClientRect().top < window.innerHeight * triggerAt) play();
    };
    ScrollTrigger.create({ trigger, start: `top ${triggerAt * 100}%`, once: true, onEnter: play });
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
    window.clearTimeout(timer);
    cleanupListeners();
    ctx.revert();
    clear();
  };
}
