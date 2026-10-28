"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./motionKit";
import camping from "../../avatr 07 page/9 Modes/Camping Mode.jpg";
import carWash from "../../avatr 07 page/9 Modes/Car Wash Mode.jpg";
import child from "../../avatr 07 page/9 Modes/Child Mode.jpg";
import fireplace from "../../avatr 07 page/9 Modes/Fireplace Mode.jpg";
import karaoke from "../../avatr 07 page/9 Modes/Karaoke Mode.jpg";
import movie from "../../avatr 07 page/9 Modes/Movie Mode.jpg";
import pet from "../../avatr 07 page/9 Modes/Pet Mode.jpg";
import rest from "../../avatr 07 page/9 Modes/Rest Mode.jpg";
import temperature from "../../avatr 07 page/9 Modes/Temperature Maintain Mode.jpg";
import { INK, TAN, u } from "./scale";

// Cyclic order, left to right as in the reference (Karaoke, Fireplace, Child, Car Wash, Camping),
// continued round the loop. Labels are the image file names.
const MODES = [
  { name: "Karaoke Mode", image: karaoke },
  { name: "Fireplace Mode", image: fireplace },
  { name: "Child Mode", image: child },
  { name: "Car Wash Mode", image: carWash },
  { name: "Camping Mode", image: camping },
  { name: "Temperature Maintain Mode", image: temperature },
  { name: "Rest Mode", image: rest },
  { name: "Pet Mode", image: pet },
  { name: "Movie Mode", image: movie },
] as const;

const N = MODES.length;
const START = 2; // Child Mode in the middle, as in the reference

// Orbit geometry (all lengths in card widths so the whole ring scales with the card).
const STEP = (28 * Math.PI) / 180; // angle between neighbouring cards on the ring
const RY = 2.226; // vertical radius: how far the ring curves away from the front card

// Entrance ("the nine modes assemble into the ring"): the final orbit positions are never redesigned. For the
// short intro every card is simply drawn a little closer to the centre, a touch smaller and a touch dimmer, and
// eases out to its normal place, the front card first and each ring step after it a beat later. These factors
// are applied inside the SAME render() that writes the carousel transform, so there is a single writer per card
// (nothing stacks or fights with the drag/inertia transforms) and once the intro ends they are exactly 1.
const INTRO = { pull: 0.7, scale: 0.94, opacity: 0.55, duration: 0.7, stagger: 0.06, total: 0.7 + 0.06 * 3.2 };
const introEase = gsap.parseEase("power2.out");
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Phase 3 · 4b — the nine in-car modes as an endless orbit. The cards sit on one ring that curves
// away from the viewer: the front card is largest, its neighbours step down in size and drop
// along the arc, and the far side of the ring fades out behind the "9" anchor. A continuous
// position `pos` (in cards) drives everything; dragging changes it directly, release flings and
// snaps it to a whole card with a decelerating tween. There is no first or last card.
export default function ModesCarousel() {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const nine = useRef<HTMLSpanElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);

  // (a layout effect so the intro's starting state is in place before the first paint)
  useLayoutEffect(() => {
    const el = stage.current;
    const nineEl = nine.current;
    const captionEl = caption.current;
    if (!el) return;
    const state = { pos: START };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intro = { t: reduced ? INTRO.total : 0 }; // seconds into the intro; >= total means finished
    let interactive = reduced;
    let cw = 292;
    let spacing = 409; // px between neighbouring card centres on the ring's front
    let tween: gsap.core.Tween | null = null;

    const render = () => {
      const rx = spacing / Math.sin(STEP);
      for (let i = 0; i < N; i++) {
        const card = cards.current[i];
        if (!card) continue;
        // signed distance from the front card, wrapped into [-N/2, N/2)
        const d = ((((i - state.pos) % N) + N + N / 2) % N) - N / 2;
        const a = d * STEP;
        const x = rx * Math.sin(a);
        const y = RY * cw * (1 - Math.cos(a));
        const s = Math.max(0, 0.5 + 0.5 * Math.cos(1.4 * a));
        const ad = Math.abs(d);
        let o = (1 - 0.4 * smooth(0.4, 2.2, ad)) * (1 - smooth(2.4, 3.2, ad));
        let px = x;
        let py = y;
        let ps = s;
        if (intro.t < INTRO.total) {
          const p = introEase(Math.min(1, Math.max(0, (intro.t - INTRO.stagger * Math.min(ad, 3.2)) / INTRO.duration)));
          const pull = lerp(INTRO.pull, 1, p);
          px *= pull;
          py *= pull;
          ps *= lerp(INTRO.scale, 1, p);
          o *= lerp(INTRO.opacity, 1, p);
        }
        card.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0) scale(${ps.toFixed(4)})`;
        card.style.opacity = o.toFixed(3);
        card.style.zIndex = String(Math.round(s * 100));
        card.style.pointerEvents = o < 0.05 ? "none" : "auto";
        card.dataset.d = d.toFixed(3);
      }
    };

    const measure = () => {
      const w = el.clientWidth;
      cw = Math.min(292, Math.max(156, w * (292 / 1920)));
      const r = Math.min(1, Math.max(0, (w - 390) / 710)); // phones: tight ring, desktop: the reference's 1.4 cards
      spacing = cw * (1 + 0.4 * r);
      el.style.setProperty("--cw", `${cw}px`);
      render();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const settle = (target: number, speed = 1) => {
      tween?.kill();
      const dist = Math.abs(target - state.pos);
      tween = gsap.to(state, {
        pos: target,
        duration: Math.min(1.5, (0.55 + 0.14 * dist) / speed),
        ease: "power3.out",
        onUpdate: render,
      });
    };

    // ---- pointer drag (mouse, touch and pen share one path) ----
    let drag: { x: number; pos: number; moved: boolean; id: number } | null = null;
    let samples: { t: number; pos: number }[] = [];

    const down = (e: PointerEvent) => {
      if (!interactive || (e.pointerType === "mouse" && e.button !== 0)) return; // not until the intro has finished
      tween?.kill();
      drag = { x: e.clientX, pos: state.pos, moved: false, id: e.pointerId };
      samples = [{ t: performance.now(), pos: state.pos }];
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 5) drag.moved = true;
      state.pos = drag.pos - dx / spacing;
      const now = performance.now();
      samples.push({ t: now, pos: state.pos });
      while (samples.length > 2 && now - samples[0].t > 90) samples.shift();
      render();
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const wasDrag = drag.moved;
      drag = null;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      el.style.cursor = "";
      if (!wasDrag) {
        // a plain click on a side card brings it to the front
        // (pointer capture retargets the event to the stage, so look under the pointer instead)
        const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-card]");
        const d = hit ? parseFloat(hit.dataset.d ?? "0") : 0;
        settle(Math.round(state.pos + d));
        return;
      }
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = (last.t - first.t) / 1000;
      const v = dt > 0.01 ? (last.pos - first.pos) / dt : 0; // cards per second
      const fling = Math.max(-8, Math.min(8, v)) * 0.16;
      settle(Math.round(state.pos + fling));
    };
    const key = (e: KeyboardEvent) => {
      if (!interactive) return;
      if (e.key === "ArrowLeft") settle(Math.round(state.pos) - 1);
      else if (e.key === "ArrowRight") settle(Math.round(state.pos) + 1);
      else return;
      e.preventDefault();
    };

    // ---- entrance, played once when the ring genuinely enters the viewport ----
    const stopIntro: Array<() => void> = [];
    if (!reduced) {
      gsap.set([nine.current, caption.current], { opacity: 0 });
      gsap.set(nine.current, { scale: 0.92, y: 10, transformOrigin: "50% 60%" });
      gsap.set(caption.current, { y: 14 });
      render(); // the starting formation (cards pulled in, slightly dim)
      let played = false;
      const play = () => {
        if (played) return;
        played = true;
        gsap.to(intro, {
          t: INTRO.total,
          duration: INTRO.total,
          ease: "none",
          onUpdate: render,
          onComplete: () => {
            intro.t = INTRO.total;
            render();
            interactive = true; // the carousel is now fully live
          },
        });
        // the 9 once the ring is nearly settled, then the supporting text as one block just after it
        gsap.to(nine.current, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.55, onComplete: () => gsap.set(nine.current, { clearProps: "transform,transformOrigin,opacity" }) });
        gsap.to(caption.current, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.85, onComplete: () => gsap.set(caption.current, { clearProps: "transform,opacity" }) });
      };
      const evaluate = () => {
        if (!played && el.getBoundingClientRect().top < window.innerHeight * 0.8) play();
      };
      const st = ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: play });
      window.addEventListener("scroll", evaluate, { passive: true });
      window.addEventListener("resize", evaluate);
      evaluate();
      stopIntro.push(() => {
        st.kill();
        window.removeEventListener("scroll", evaluate);
        window.removeEventListener("resize", evaluate);
      });
    }

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("keydown", key);
    const noDrag = (e: Event) => e.preventDefault();
    el.addEventListener("dragstart", noDrag);

    return () => {
      stopIntro.forEach((fn) => fn());
      gsap.killTweensOf([intro, nineEl, captionEl]);
      tween?.kill();
      ro.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("keydown", key);
      el.removeEventListener("dragstart", noDrag);
    };
  }, []);

  return (
    <section className="bg-white" style={{ paddingTop: u(27, 0), paddingBottom: u(120, 64) }}>
      <div
        ref={stage}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="In-car modes. Drag, swipe or use the arrow keys."
        className="relative mx-auto w-full cursor-grab select-none overflow-hidden outline-none [touch-action:pan-y]"
        style={{ height: "calc(var(--cw, 292px) * 2.4)", maxWidth: 1920 }}
      >
        {/* The anchor: sits inside the ring, under the front card. */}
        <div
          className="pointer-events-none absolute inset-x-0 flex flex-col items-center text-center"
          style={{ top: "calc(var(--cw, 292px) * 1.4)", color: INK }}
        >
          <span
            ref={nine}
            className="font-normal"
            style={{ color: INK, fontSize: "calc(var(--cw, 292px) * 0.66)", lineHeight: 0.9, letterSpacing: "0.01em" }}
          >
            9
          </span>
          <p ref={caption} style={{ marginTop: "calc(var(--cw, 292px) * 0.07)", fontSize: u(22, 15), lineHeight: 1.35 }}>
            in-car Modes to Cover
            <br />
            everyday scenario
          </p>
        </div>

        {MODES.map((m, i) => {
          const words = m.name.split(" ");
          const tail = words.pop(); // "Mode"
          return (
            <div
              key={m.name}
              ref={(n) => {
                cards.current[i] = n;
              }}
              data-card
              className="absolute left-1/2 top-0 overflow-hidden bg-black will-change-transform"
              style={{
                width: "var(--cw, 292px)",
                marginLeft: "calc(var(--cw, 292px) / -2)",
                aspectRatio: `${822} / ${1032}`,
                transformOrigin: "50% 50%",
              }}
            >
              <Image
                src={m.image}
                alt={m.name}
                fill
                quality={100}
                sizes="(min-width: 1920px) 292px, 16vw"
                draggable={false}
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 top-0"
                style={{ height: "46%", background: "linear-gradient(to bottom, rgba(0,0,0,0.38), rgba(0,0,0,0))" }}
              />
              <p
                className="absolute font-normal text-white"
                style={{
                  left: "calc(var(--cw, 292px) * 0.085)",
                  top: "calc(var(--cw, 292px) * 0.09)",
                  maxWidth: "80%",
                  fontSize: "calc(var(--cw, 292px) * 0.115)",
                  lineHeight: 1.22,
                }}
              >
                {words.join(" ")}
                <br />
                {tail}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

