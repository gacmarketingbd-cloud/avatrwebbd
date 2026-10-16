"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import designCenterImage from "../Landing page/Avatr Global Design Center Image.webp";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TEXT_RISE = 180; // px
const TEXT_STAGGER = 0.215; // fraction of the scroll range between line starts
// Rendered in the markup so the text is already in its hidden start state
// before GSAP runs — otherwise it paints visible, then snaps hidden.
const HIDDEN_LINE = { opacity: 0, transform: `translateY(${TEXT_RISE}px)` };

export default function DesignCenter() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageBoxRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const imageBox = imageBoxRef.current;
    const lines = textRefs.current.filter(Boolean) as HTMLParagraphElement[];
    if (!section || !imageBox || lines.length === 0) return;

    // Matches avatr.com/en (measured): no pinning. The effect is scrubbed
    // while the section scrolls in normally — it starts when the section top
    // is ~78% down the viewport and completes as it reaches the top. Text
    // lines rise 180px and fade in with staggered starts but a shared finish.
    // A short scrub smooths discrete mouse-wheel steps, and an ease-out lets
    // the motion settle into the final state instead of stopping dead.
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power1.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          end: "top top",
          scrub: 0.6,
        },
      });

      // Percentages of the section rather than vw/vh, so the end state is
      // exactly the section's box even when a vertical scrollbar narrows it.
      tl.fromTo(imageBox, { width: "62.5%", height: "64.8%" }, { width: "100%", height: "100%", duration: 1 }, 0);
      lines.forEach((line, i) => {
        const start = i * TEXT_STAGGER;
        tl.fromTo(line, { y: TEXT_RISE, opacity: 0 }, { y: 0, opacity: 1, duration: 1 - start }, start);
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="design"
      ref={sectionRef}
      className="relative h-screen w-full scroll-mt-14 overflow-hidden bg-white md:scroll-mt-[72px]"
    >
      <div
        ref={imageBoxRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        style={{ width: "62.5%", height: "64.8%" }}
      >
        <Image
          src={designCenterImage}
          alt="AVATR global design center — Munich, Germany"
          fill
          placeholder="blur"
          className="object-cover"
          // Softness cause (measured, see scripts/design-image-quality.mjs): the default quality 75 re-encoded the
          // 6000x4000 source into a 70KB, 1920px file with about half the source's fine detail. 95 keeps the detail
          // (417KB at 1920, 1.5MB at 3840). `sizes` is the width the photo is actually PAINTED at: it is object-cover
          // in a box that ends up the full section, so on tall/narrow screens the 3:2 photo is scaled by height
          // (150vh wide), not by the viewport width; max() covers both, so high-DPI and portrait screens are served
          // the right candidate (up to 3840) instead of an undersized one that the browser then enlarges.
          quality={95}
          sizes="max(100vw, 150vh)"
        />
        {/* Readability overlay: image -> this soft black radial gradient -> text. It lives inside the image box so
            it scales with the photo (no haze over the white margin early in the scroll), is strongest behind the
            centred copy (0.34) and feathers to nothing toward the edges, so the rest of the photograph stays bright.
            pointer-events-none: it never intercepts the Find More link. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 52% 40% at 50% 50%, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0.33) 22%, rgba(0,0,0,0.26) 45%, rgba(0,0,0,0.13) 70%, rgba(0,0,0,0.04) 88%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <p
          ref={(el) => {
            textRefs.current[0] = el;
          }}
          style={HIDDEN_LINE}
          className="text-xl md:text-2xl font-light text-white/90"
        >
          Munich, Germany
        </p>
        <p
          ref={(el) => {
            textRefs.current[1] = el;
          }}
          style={HIDDEN_LINE}
          className="mt-1 text-4xl md:text-6xl font-normal text-white md:mt-2"
        >
          AVATR global design center
        </p>
        <p
          ref={(el) => {
            textRefs.current[2] = el;
          }}
          style={HIDDEN_LINE}
          className="mt-2 text-base md:text-lg text-white/85 md:mt-3"
        >
          From the design frontier, with global vision
        </p>
        <p
          ref={(el) => {
            textRefs.current[3] = el;
          }}
          style={HIDDEN_LINE}
          className="pointer-events-auto mt-6 flex items-center gap-2 text-nav tracking-wide text-white/90 hover:text-white transition-colors md:mt-8"
        >
          <a href="#" className="flex items-center gap-2">
            Find More
            <svg width="10" height="16" viewBox="0 0 13 26" fill="currentColor">
              <path d="M.198 2.044V.198l11.645 11.928a1.254 1.254 0 0 1 0 1.748L.198 25.802v-1.847c0-.846.328-1.658.914-2.258l7.878-8.07a.903.903 0 0 0 0-1.255L1.112 4.303a3.236 3.236 0 0 1-.914-2.259" />
            </svg>
          </a>
        </p>
      </div>
    </section>
  );
}
