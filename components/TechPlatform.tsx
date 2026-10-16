"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import platformImg from "../Landing page/Intelligent electric vehicle platform.jpg";
import flexibleImg from "../Landing page/Flexible platform for multiple vehicle models.jpg";
import convergeImg from "../Landing page/and converge infrastructure.jpg";

const SLIDES = [
  {
    title: "All new generation",
    heading: "Intelligent electric vehicle platform",
    desc: null as string | null,
    image: platformImg,
  },
  {
    title: "Flexibility",
    heading: "Flexible platform for multiple vehicle models",
    desc: "Full coverage and high compatibility",
    image: flexibleImg,
  },
  {
    title: "Cutting edge technology",
    heading: "and converge infrastructure",
    desc: "Efficient and secure information",
    image: convergeImg,
  },
];

const SLIDE_W = 64; // vw, width of the active card
const GAP = 32; // px, gap between cards

// Swiper's loop mode requires the real (non-cloned) slide count to be
// comfortably above `slidesPerView + slidesPerGroup + 1` (centeredSlides
// adds that +1). With slidesPerView:'auto' that threshold is only an
// estimate based on measured pixel widths, and our 3 real slides sit right
// at the edge of it — Swiper's own clone bookkeeping (loopCreate/loopFix)
// intermittently ends up one clone short on one side after a slide change,
// which is what produced the blank column. Rendering each slide several
// times gives Swiper a real (not cloned) slide to show on every side at
// all times, so the fragile edge-case clone math is never what's on screen.
const REPEAT = 4;
const RENDER_SLIDES = Array.from({ length: SLIDES.length * REPEAT }, (_, i) => SLIDES[i % SLIDES.length]);

// swiper.realIndex is derived from Swiper's internal loop-clone bookkeeping,
// which (per the REPEAT note above) can end up desynced from which slide is
// actually centered on screen. Reading the content index straight off the
// DOM slide Swiper currently considers active sidesteps that bookkeeping
// entirely, so the "active" card highlighted here always matches what the
// user visually sees centered.
function activeContentIndex(swiper: SwiperType): number {
  const activeSlide = swiper.slides?.[swiper.activeIndex] as HTMLElement | undefined;
  const raw = activeSlide?.dataset.contentIndex;
  return raw !== undefined ? Number(raw) : 0;
}

export default function TechPlatform() {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  // Force a layout-accurate re-centering once the browser has actually
  // settled the vw-based auto widths (Swiper's first pass runs before that,
  // which can start the loop mis-centered).
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const swiper = swiperRef.current as (SwiperType & { loopCreate: (i?: number, initial?: boolean) => void }) | null;
      if (!swiper) return;
      swiper.loopCreate(0, true);
      swiper.update();
      swiper.slideToLoop(0, 0, false);
      setActiveIndex(activeContentIndex(swiper));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section id="tech" className="w-full scroll-mt-14 bg-white py-16 md:scroll-mt-[72px] md:py-24">
      <div className="relative">
        <Swiper
          modules={[]}
          loop
          loopAdditionalSlides={SLIDES.length}
          centeredSlides
          slidesPerView="auto"
          spaceBetween={GAP}
          speed={550}
          grabCursor
          watchSlidesProgress
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setActiveIndex(activeContentIndex(swiper));
          }}
          onSlideChange={(swiper) => setActiveIndex(activeContentIndex(swiper))}
          className="tech-swiper"
        >
          {RENDER_SLIDES.map((slide, i) => {
            const contentIndex = i % SLIDES.length;
            return (
              <SwiperSlide
                key={i}
                style={{ width: `${SLIDE_W}vw` }}
                className="!h-auto"
                data-content-index={contentIndex}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-black sm:aspect-[4/3] md:aspect-[8/5]">
                  <div
                    className={`relative h-full w-full transition-opacity duration-500 ease-out ${
                      contentIndex === activeIndex ? "opacity-100" : "opacity-40"
                    }`}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.heading}
                      fill
                      draggable={false}
                      className="pointer-events-none object-cover"
                      sizes={`${SLIDE_W}vw`}
                      priority={i < SLIDES.length}
                    />
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Text + arrows: positioned to match the (always-centered) active card's bounds */}
        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 z-10 -translate-x-1/2"
          style={{ width: `${SLIDE_W}vw` }}
        >
          <div className="absolute inset-x-0 top-[10%] flex justify-center px-6">
            {SLIDES.map((slide, i) => (
              <div
                key={slide.heading}
                className={`absolute flex w-full max-w-lg flex-col items-center text-center transition-opacity duration-500 ease-out ${
                  i === activeIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <p className="text-nav tracking-wide text-white/70">{slide.title}</p>
                <h2 className="mt-2 text-xl font-normal text-white md:text-3xl">{slide.heading}</h2>
                {slide.desc && <p className="mt-2 text-tagline text-white/80">{slide.desc}</p>}
                <a
                  href="#"
                  className="pointer-events-auto mt-4 text-nav tracking-wide text-white/85 hover:text-white transition-colors"
                >
                  Find More &gt;
                </a>
              </div>
            ))}
          </div>

          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => swiperRef.current?.slidePrev()}
            className="pointer-events-auto absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-white/70 transition-colors hover:text-white md:left-5"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <polyline points="15 6 9 12 15 18" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => swiperRef.current?.slideNext()}
            className="pointer-events-auto absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-white/70 transition-colors hover:text-white md:right-5"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-2 md:mt-8">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.heading}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => swiperRef.current?.slideToLoop(i)}
            className={`h-[2px] transition-all duration-300 ${
              i === activeIndex ? "w-8 bg-black" : "w-4 bg-black/25 hover:bg-black/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
