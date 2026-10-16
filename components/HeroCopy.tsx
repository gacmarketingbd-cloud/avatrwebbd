"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// The landing hero line, with a restrained "light catching polished type" reveal. The sentence starts dim; a soft
// opacity band travels left to right (power2.inOut, ~2.6s) and resolves the text to full white behind it as one
// continuous reveal. Riding the band is a narrow, feathered, pale-gold tint that exists only INSIDE the letterforms
// (the glyphs are filled with white plus that tint via background-clip: text, see .hero-copy in globals.css): no
// flare, streak, bloom or shadow is ever painted outside the letters. It warms very slightly more as it crosses
// HORIZON. When the sweep ends the attribute and every inline style are removed, leaving exactly the plain white
// heading. Plays once, when the heading is on screen; skipped under prefers-reduced-motion.
const DURATION = 2.6;
const START_DELAY = 0.35; // s after the heading is visible
const BAND_RATIO = 0.22; // soft reveal band width as a fraction of the text width
const HL_BACK = 0.07; // highlight reach behind / ahead of its centre, as a fraction of the text width
const HL_FRONT = 0.045;
const TINT = 0.3; // peak tint strength over white (pale gold)
const TINT_HORIZON = 0.42; // very slightly warmer while crossing HORIZON

export default function HeroCopy() {
  const heading = useRef<HTMLHeadingElement>(null);
  const word = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const h = heading.current;
    const w = word.current;
    if (!h || !w) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      h.removeAttribute("data-sweep");
      return;
    }

    // (Re)arm the dim starting state: a Strict Mode re-run of this effect must not start from the finished text.
    h.setAttribute("data-sweep", "pending");
    h.style.setProperty("--sweep-x", "-2000px");

    let tl: gsap.core.Timeline | null = null;
    let started = false;
    let disposed = false;

    const finish = () => {
      h.removeAttribute("data-sweep");
      ["--sweep-x", "--sweep-band", "--hl-back", "--hl-front", "--tint"].forEach((p) => h.style.removeProperty(p));
    };

    const play = async () => {
      if (started || disposed) return;
      started = true;
      await document.fonts?.ready;
      if (disposed) return;

      const box = h.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(h);
      const text = range.getBoundingClientRect();
      const left = text.left - box.left; // text edges in the heading's own coordinates
      const band = Math.max(80, text.width * BAND_RATIO);
      const wordBox = w.getBoundingClientRect();
      const wordCentre = wordBox.left + wordBox.width / 2 - box.left;
      const wordReach = wordBox.width * 0.9; // how far from the word's centre the extra warmth reaches

      const from = left - band / 2;
      const to = left + text.width + band / 2;
      const sweep = { x: from };
      h.style.setProperty("--sweep-band", `${band}px`);
      h.style.setProperty("--hl-back", `${text.width * HL_BACK}px`);
      h.style.setProperty("--hl-front", `${text.width * HL_FRONT}px`);
      h.style.setProperty("--tint", String(TINT));
      h.style.setProperty("--sweep-x", `${from}px`);

      tl = gsap.timeline({ delay: START_DELAY, onComplete: finish });
      tl.to(sweep, {
        x: to,
        duration: DURATION,
        ease: "power2.inOut",
        onUpdate: () => {
          h.style.setProperty("--sweep-x", `${sweep.x}px`);
          // a smooth bump (cosine bell) of extra warmth while the highlight is over HORIZON
          const d = Math.abs(sweep.x - wordCentre) / wordReach;
          const bell = d < 1 ? 0.5 * (1 + Math.cos(Math.PI * d)) : 0;
          h.style.setProperty("--tint", (TINT + (TINT_HORIZON - TINT) * bell).toFixed(3));
        },
      });
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
      finish();
    };
  }, []);

  return (
    <h1
      ref={heading}
      data-sweep="pending"
      style={{ "--sweep-x": "-2000px", "--sweep-band": "300px", "--hl-back": "60px", "--hl-front": "40px", "--tint": String(TINT) } as React.CSSProperties}
      className="hero-copy absolute inset-x-0 bottom-[clamp(2.25rem,7.5svh,6rem)] mx-auto max-w-[min(90%,34rem)] text-balance pl-[calc(0.5rem+0.16em)] pr-2 text-center text-[clamp(1.125rem,1.7vw,2.125rem)] font-light uppercase leading-[1.35] tracking-[0.16em] text-white md:max-w-none md:whitespace-nowrap"
    >
      Welcome to a New <span ref={word}>Horizon</span> of Perfection
    </h1>
  );
}
