"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// The landing hero line, with a cinematic horizon light-sweep: the sentence starts dim, a soft band travels left to
// right (power2.inOut, ~1.6s) and the text resolves to full white behind it, as one continuous reveal. When the band
// reaches HORIZON that word gets a soft glow that settles back within ~0.6s. Nothing moves: only the opacity mask
// (see .hero-copy in globals.css) and the glow change. The server markup already carries the dim starting state
// (data-sweep="pending"), so there is no flash of the finished text; the attribute and every inline style are removed
// at the end, leaving exactly the static heading. Plays once, when the heading is on screen. Skipped under
// prefers-reduced-motion (the CSS drops the mask there).
const DURATION = 1.6;
const START_DELAY = 0.35; // s after the heading is visible
const BAND_RATIO = 0.3; // soft band width as a fraction of the text width

const GLOW =
  "0 0 calc(16px * var(--glow, 0)) rgba(255,255,255,calc(0.55 * var(--glow, 0))), 0 0 calc(5px * var(--glow, 0)) rgba(255,255,255,calc(0.4 * var(--glow, 0)))";

export default function HeroCopy() {
  const heading = useRef<HTMLHeadingElement>(null);
  const word = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const h = heading.current;
    const w = word.current;
    if (!h || !w || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      h?.removeAttribute("data-sweep");
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
      h.style.removeProperty("--sweep-x");
      h.style.removeProperty("--sweep-band");
      w.style.removeProperty("--glow");
      w.style.removeProperty("text-shadow");
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
      const left = text.left - box.left;
      const band = Math.max(80, text.width * BAND_RATIO);
      const wr = w.getBoundingClientRect();
      const wordCentre = wr.left + wr.width / 2 - box.left;

      const from = left - band / 2;
      const to = left + text.width + band / 2;
      const sweep = { x: from };
      h.style.setProperty("--sweep-band", `${band}px`);
      h.style.setProperty("--sweep-x", `${from}px`);
      w.style.textShadow = GLOW;
      w.style.setProperty("--glow", "0");

      let glowed = false;
      tl = gsap.timeline({ delay: START_DELAY, onComplete: finish });
      tl.to(sweep, {
        x: to,
        duration: DURATION,
        ease: "power2.inOut",
        onUpdate: () => {
          h.style.setProperty("--sweep-x", `${sweep.x}px`);
          if (!glowed && sweep.x >= wordCentre) {
            glowed = true;
            const glow = { v: 0 };
            const apply = () => w.style.setProperty("--glow", glow.v.toFixed(3));
            gsap
              .timeline()
              .to(glow, { v: 1, duration: 0.2, ease: "power2.out", onUpdate: apply })
              .to(glow, { v: 0, duration: 0.4, ease: "power2.inOut", onUpdate: apply });
          }
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
      gsap.killTweensOf([w]);
      finish();
    };
  }, []);

  return (
    <h1
      ref={heading}
      data-sweep="pending"
      style={{ "--sweep-x": "-2000px", "--sweep-band": "300px" } as React.CSSProperties}
      className="hero-copy absolute inset-x-0 bottom-[clamp(2.25rem,7.5svh,6rem)] mx-auto max-w-[min(90%,34rem)] text-balance pl-[calc(0.5rem+0.16em)] pr-2 text-center text-[clamp(1.125rem,1.7vw,2.125rem)] font-light uppercase leading-[1.35] tracking-[0.16em] text-white md:max-w-none md:whitespace-nowrap"
    >
      Welcome to a New <span ref={word}>Horizon</span> of Perfection
    </h1>
  );
}
