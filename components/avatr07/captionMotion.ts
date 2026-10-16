import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./motionKit";

gsap.registerPlugin(ScrollTrigger);

// Caption reveal for the three-image mosaic. Only the caption text moves (never the images, the
// black scrims, the type or the spacing). Each caption block is `overflow: hidden` and ends at the
// image's bottom edge, so its lines rise out of the lower edge of the image, title first and the
// subcopy a beat after it.
//
// Order: 1 LED Star-Ring Taillights (rear)  ->  2 The UFO-Inspired Front Face  ->  3 FHD Electronic
// Exterior Mirrors. Each caption is triggered by ITS OWN image entering the viewport. When several
// are triggered together (desktop, where the tiles share a row) they play in the order above, one
// GAP apart; a caption whose image enters on its own never waits for one that has not entered yet.
const ORDER = ["rear", "front", "mirror"] as const;
type Id = (typeof ORDER)[number];

const GAP = 0.3; // seconds between one caption starting and the next (when triggered together)
const DURATION = 0.75; // each line's rise
const LINE_STAGGER = 0.12; // subcopy starts this long after its title
const EASE = "power3.out";
const START_Y = 260; // % of the line's own height: far enough down to sit fully below the clipped edge
// A caption triggers as soon as its own text block (the clipped box at the foot of its image) is 8% of the
// screen height inside the viewport, i.e. the moment it can be seen, not when the whole tile is in view.
const TRIGGER = 0.92;

export function initMosaicCaptions(section: HTMLElement) {
  const tiles = Object.fromEntries(
    ORDER.map((id) => [id, section.querySelector<HTMLElement>(`[data-tile='${id}']`)])
  ) as Record<Id, HTMLElement | null>;
  const capBox = (id: Id) => tiles[id]?.querySelector<HTMLElement>("h3")?.parentElement ?? tiles[id];
  const lines = (id: Id) =>
    [...(tiles[id]?.querySelectorAll<HTMLElement>("[data-fx='cap-inner']") ?? [])];

  let disposed = false;
  const started = new Set<Id>();
  let batch: Id[] = [];
  let flushQueued = false;
  let lastStart = -Infinity; // gsap time (seconds) at which the most recent caption began
  // Declared before gsap.context(): the callback runs immediately and assigns it.
  let cleanupListeners: () => void = () => {};

  const ctx = gsap.context((self) => {
    // Hidden start state, set before first paint: lines sit below the clipped edge, invisible.
    ORDER.forEach((id) => gsap.set(lines(id), { yPercent: START_Y, autoAlpha: 0 }));

    const play = (id: Id, delay: number) => {
      self.add(() => {
        const tl = gsap.timeline({
          delay,
          // Leave clean, static styles behind once settled.
          onComplete: () => gsap.set(lines(id), { clearProps: "transform,opacity,visibility" }),
        });
        lines(id).forEach((el, i) => {
          tl.to(el, { yPercent: 0, autoAlpha: 1, duration: DURATION, ease: EASE }, i * LINE_STAGGER);
        });
      });
    };

    // Tiles triggered in the same tick are sorted into the fixed order, then started one GAP apart.
    const flush = () => {
      flushQueued = false;
      if (disposed) return;
      const now = gsap.ticker.time;
      batch.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
      for (const id of batch) {
        const startAt = Math.max(now, lastStart + GAP);
        lastStart = startAt;
        play(id, startAt - now);
      }
      batch = [];
    };

    const ready = (id: Id) => {
      if (disposed || started.has(id) || !tiles[id]) return;
      started.add(id);
      batch.push(id);
      if (!flushQueued) {
        flushQueued = true;
        // Wait one frame so captions triggered by the same scroll step are ordered together.
        requestAnimationFrame(flush);
      }
    };

    // Every tile decides from its own position (scroll, resize, load), so a trigger that has been
    // passed — however quickly — always reveals its caption; nothing can stay hidden.
    const evaluate = () => {
      if (disposed) return;
      ORDER.forEach((id) => {
        const box = capBox(id);
        if (box && !started.has(id) && box.getBoundingClientRect().top < window.innerHeight * TRIGGER) ready(id);
      });
    };

    ORDER.forEach((id) => {
      const box = capBox(id);
      if (box) ScrollTrigger.create({ trigger: box, start: `top ${TRIGGER * 100}%`, once: true, onEnter: () => ready(id) });
    });
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    evaluate(); // already beyond a trigger at load (e.g. reload mid-page)
    document.fonts?.ready.then(() => {
      ScrollTrigger.refresh();
      evaluate();
    });

    cleanupListeners = () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, section);

  return () => {
    disposed = true;
    cleanupListeners();
    ctx.revert();
  };
}
