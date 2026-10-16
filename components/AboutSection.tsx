"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import aboutImage from "../Landing page/About us.webp";
import { initCssReveal } from "./avatr07/cssReveal";

export default function AboutSection() {
  const section = useRef<HTMLElement>(null);
  const group = useRef<HTMLDivElement>(null);

  // Calm entrance for the text only (the image and overlay are untouched): label, headline, link, sentence each
  // fade 0 -> 1 while rising 10px, power2.out, 150ms apart (about 1.1s in total). Plays once, when the text enters the
  // viewport. Compositor-driven CSS transitions via cssReveal; skipped under prefers-reduced-motion.
  useLayoutEffect(() => {
    const el = section.current;
    const g = group.current;
    if (!el || !g || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const steps = (Array.from(g.children) as HTMLElement[]).map((child, i) => ({ els: [child], delay: i * 150, y: 10, duration: 650 }));
    return initCssReveal(el, g, steps, { triggerAt: 0.8 });
  }, []);

  return (
    <section
      ref={section}
      id="about"
      className="relative w-full scroll-mt-14 aspect-[3/4] sm:aspect-[16/10] md:scroll-mt-[72px] md:aspect-video overflow-hidden bg-black"
    >
      <Image
        src={aboutImage}
        alt="AVATR interior — emotional intelligence, motion in delight"
        fill
        className="object-cover"
        quality={95}
        sizes="(max-width: 639px) 250vw, (max-width: 767px) 118vw, 106vw"
      />

      {/* Cinematic overlay: a soft top-to-bottom shade plus a centre-focused pool of darkness behind the text. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 58% 40% at 50% 27%, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.1) 62%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* Text sits high, over the dark backdrop of the photo, clear of the car body. */}
      <div ref={group} className="absolute inset-x-0 top-[12%] flex flex-col items-center px-6 text-center">
        <span className="text-[clamp(0.8125rem,0.95vw,1.125rem)] leading-none tracking-[0.34em] text-white/85">
          AVATR
        </span>
        <h2 className="mt-[clamp(0.75rem,1.1vw,1.375rem)] max-w-[min(92%,24ch)] text-balance text-[clamp(1.25rem,1.85vw,2.25rem)] font-normal uppercase leading-[1.15] tracking-[0.03em] text-white md:max-w-none md:whitespace-nowrap">
          Emotional Intelligence, Motion in Delight
        </h2>
        <a
          href="#"
          className="mt-[clamp(0.875rem,1.4vw,1.75rem)] text-[clamp(0.875rem,0.95vw,1.125rem)] leading-none tracking-wide text-white/90 transition-colors hover:text-white"
        >
          About us &gt;
        </a>
        <p className="mt-[clamp(1.5rem,2.4vw,3rem)] max-w-[min(92%,32rem)] text-balance text-[clamp(0.8125rem,0.95vw,1.125rem)] leading-[1.6] tracking-[0.01em] text-white/80 md:max-w-none md:whitespace-nowrap">
          With forward-looking design and warm technology, it continuously creates
          future-leading travel experiences for users.
        </p>
      </div>
    </section>
  );
}
