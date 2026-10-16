"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// The landing hero line, with a cinematic horizon light-sweep. The sentence starts dim; a soft opacity band travels
// left to right (power2.inOut, ~2.7s) and resolves the text to full white behind it as one continuous reveal
// (see .hero-copy in globals.css). A small warm golden flare (bright core, thin horizontal streak, soft elliptical
// halo) is a SEPARATE layer riding the same position, so it neither touches the text layout nor gets masked. It
// enters just outside the left edge, widens/brightens briefly as it crosses HORIZON (which also takes a soft glow
// that settles in ~0.6s), then slips away beyond the last word. Only opacity masks, transforms and the temporary
// glow change; nothing is left behind: the attribute, inline styles and the flare are removed at the end, so the
// resting text is exactly the plain white heading. Plays once, when the heading is on screen; skipped under
// prefers-reduced-motion.
const DURATION = 2.7;
const START_DELAY = 0.35; // s after the heading is visible
const BAND_RATIO = 0.22; // soft reveal band width as a fraction of the text width

const GLOW =
  "0 0 calc(16px * var(--glow, 0)) rgba(255,255,255,calc(0.5 * var(--glow, 0))), 0 0 calc(5px * var(--glow, 0)) rgba(255,240,205,calc(0.35 * var(--glow, 0)))";

const SIZE = "text-[clamp(1.125rem,1.7vw,2.125rem)]";

export default function HeroCopy() {
  const wrap = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const flare = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const streak = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wr = wrap.current;
    const h = heading.current;
    const w = word.current;
    const f = flare.current;
    const haloEl = halo.current;
    const streakEl = streak.current;
    const coreEl = core.current;
    if (!wr || !h || !w || !f || !haloEl || !streakEl || !coreEl) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      h.removeAttribute("data-sweep");
      f.style.display = "none";
      return;
    }

    // (Re)arm the dim starting state: a Strict Mode re-run of this effect must not start from the finished text.
    h.setAttribute("data-sweep", "pending");
    h.style.setProperty("--sweep-x", "-2000px");
    f.style.display = "";
    gsap.set(f, { opacity: 0 });

    let tl: gsap.core.Timeline | null = null;
    let started = false;
    let disposed = false;

    const finish = () => {
      h.removeAttribute("data-sweep");
      h.style.removeProperty("--sweep-x");
      h.style.removeProperty("--sweep-band");
      w.style.removeProperty("--glow");
      w.style.removeProperty("text-shadow");
      f.style.display = "none";
      f.style.removeProperty("transform");
      f.style.removeProperty("opacity");
      f.style.removeProperty("will-change");
      [haloEl, streakEl, coreEl].forEach((el) => {
        el.style.removeProperty("transform");
        el.style.removeProperty("opacity");
      });
    };

    const play = async () => {
      if (started || disposed) return;
      started = true;
      await document.fonts?.ready;
      if (disposed) return;

      const wrapBox = wr.getBoundingClientRect();
      const box = h.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(h);
      const text = range.getBoundingClientRect();
      const left = text.left - box.left; // text edges in the heading's own coordinates (the mask's)
      const band = Math.max(80, text.width * BAND_RATIO);
      const wordBox = w.getBoundingClientRect();
      const wordCentre = wordBox.left + wordBox.width / 2 - box.left;
      const offset = box.left - wrapBox.left; // heading -> wrapper (the flare's coordinates)

      const from = left - band / 2;
      const to = left + text.width + band / 2;
      const sweep = { x: from };
      h.style.setProperty("--sweep-band", `${band}px`);
      h.style.setProperty("--sweep-x", `${from}px`);
      w.style.textShadow = GLOW;
      w.style.setProperty("--glow", "0");
      f.style.willChange = "transform, opacity";
      gsap.set(f, { x: from + offset, opacity: 0 });

      // brief widening / brightening of the flare as it crosses HORIZON
      const boost = { v: 0 };
      const applyBoost = () => {
        gsap.set(haloEl, { scaleX: 1 + 0.55 * boost.v, scaleY: 1 + 0.25 * boost.v, opacity: 1 + 0.35 * boost.v });
        gsap.set(streakEl, { scaleX: 1 + 0.5 * boost.v });
        gsap.set(coreEl, { scale: 1 + 0.35 * boost.v });
      };

      let reached = false;
      tl = gsap.timeline({ delay: START_DELAY, onComplete: finish });
      tl.to(
        sweep,
        {
          x: to,
          duration: DURATION,
          ease: "power2.inOut",
          onUpdate: () => {
            h.style.setProperty("--sweep-x", `${sweep.x}px`);
            gsap.set(f, { x: sweep.x + offset });
            if (!reached && sweep.x >= wordCentre) {
              reached = true;
              const glow = { v: 0 };
              const applyGlow = () => w.style.setProperty("--glow", glow.v.toFixed(3));
              gsap
                .timeline()
                .to(glow, { v: 1, duration: 0.2, ease: "power2.out", onUpdate: applyGlow })
                .to(glow, { v: 0, duration: 0.4, ease: "power2.inOut", onUpdate: applyGlow });
              gsap
                .timeline()
                .to(boost, { v: 1, duration: 0.35, ease: "power2.out", onUpdate: applyBoost })
                .to(boost, { v: 0, duration: 0.5, ease: "power2.inOut", onUpdate: applyBoost });
            }
          },
        },
        0,
      );
      // the flare fades in as it enters and out as it leaves
      tl.fromTo(f, { opacity: 0 }, { opacity: 1, duration: DURATION * 0.14, ease: "power1.out" }, 0);
      tl.to(f, { opacity: 0, duration: DURATION * 0.16, ease: "power1.in" }, DURATION * 0.84);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect();
          void play();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(h);

    return () => {
      disposed = true;
      io.disconnect();
      tl?.kill();
      gsap.killTweensOf([w, f, haloEl, streakEl, coreEl]);
      finish();
    };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-x-0 bottom-[clamp(2.25rem,7.5svh,6rem)]">
      <h1
        ref={heading}
        data-sweep="pending"
        style={{ "--sweep-x": "-2000px", "--sweep-band": "300px" } as React.CSSProperties}
        className={`hero-copy mx-auto max-w-[min(90%,34rem)] text-balance pl-[calc(0.5rem+0.16em)] pr-2 text-center ${SIZE} font-light uppercase leading-[1.35] tracking-[0.16em] text-white md:max-w-none md:whitespace-nowrap`}
      >
        Welcome to a New <span ref={word}>Horizon</span> of Perfection
      </h1>

      {/* The travelling flare: its own layer, centred on its origin point, screen-blended so it only adds light. */}
      <div
        ref={flare}
        aria-hidden
        className={`pointer-events-none absolute left-0 top-1/2 h-0 w-0 ${SIZE}`}
        style={{ opacity: 0, mixBlendMode: "screen" }}
      >
        {/* soft warm elliptical halo */}
        <div
          ref={halo}
          className="absolute left-1/2 top-1/2 h-[2.6em] w-[7.5em] -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(closest-side, rgba(255,196,96,0.34) 0%, rgba(255,176,70,0.15) 48%, rgba(255,160,50,0) 100%)" }}
        />
        {/* thin horizontal streak */}
        <div
          ref={streak}
          className="absolute left-1/2 top-1/2 h-[0.14em] w-[9em] -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(closest-side, rgba(255,236,184,0.85) 0%, rgba(255,208,118,0.4) 45%, rgba(255,190,90,0) 100%)" }}
        />
        {/* small bright yellow-white core */}
        <div
          ref={core}
          className="absolute left-1/2 top-1/2 h-[0.62em] w-[0.62em] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(255,251,238,1) 0%, rgba(255,232,170,0.85) 38%, rgba(255,205,110,0) 100%)" }}
        />
      </div>
    </div>
  );
}
