"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import AutoVideo from "./AutoVideo";
import CarouselArrow from "./CarouselArrow";
import { INK, u } from "./scale";
import { motionOff } from "./mobileMotionSwitch";
import { initHarmonyReveal } from "./harmonyMotion";

const OTA_NOTE = "*The actual commercial release timeline of specific features is subject to OTA";

const SLIDES = [
  {
    title: "HarmonySpace Desktop Renewal",
    video: "/videos/avatr-07/harmonyspace-1.mp4",
    label: "HarmonySpace desktop renewal",
    body: "Smart interactions, simplified hierarchy; Free customization, seamless control; Exquisite visuals, refined elegance. A renewed desktop, an extraordinary experience",
  },
  {
    title: "Themed Space",
    video: "/videos/avatr-07/harmonyspace-2.mp4",
    label: "HarmonySpace themed space",
    body: "Harmonizing 'imagery, light, sound, and color' across multiple dimensions to create immersive thematic experiences, making every HarmonySpace cockpit a personalized fashion statement from vision to hearing",
  },
  {
    title: "Phone Link",
    video: "/videos/avatr-07/harmonyspace-3.mp4",
    label: "HarmonySpace phone link",
    body: "Seamless screen mirroring for Android/HarmonyOS/iOS, shattering ecosystem barriers and unlocking borderless connectivity",
  },
  {
    title: "Light in Motion",
    video: "/videos/avatr-07/harmonyspace-4.mp4",
    label: "HarmonySpace light in motion",
    body: "Ambient lighting now fluidly mirrors on-screen colors with no more jarring transitions. Like cinematic camera movements, the seamless glow melts away fatigue",
  },
] as const;

// Phase 3 · 4 — HarmonySpace 5. Heading + a horizontal slider of video cards. Geometry follows the
// reference (1920 artboard): first card starts at x147, cards are 857px wide with a 26px gap, and at
// the end of the track the last card stops 32px from the right edge. The belt moves by transform only:
// arrows glide one card per click, and mouse/touch drag follows the pointer and settles on a card on release.
export default function HarmonySpace() {
  const viewport = useRef<HTMLDivElement>(null); // clips the belt; the drag surface
  const belt = useRef<HTMLDivElement>(null); // the cards: the ONLY thing that moves, by translate3d(x) alone
  const section = useRef<HTMLElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [revealed, setRevealed] = useState(false); // the entrance has finished (or is skipped): videos may start

  // ONE controller for every movement (arrows, drag release, resize): `pos.x` is the belt's offset in px
  // (0 .. max). Only one tween ever exists; a new one kills the previous, and arrow clicks are ignored while a
  // glide is running so two transitions can never fight. Nothing but transform is written to the belt.
  const pos = useRef({ x: 0 });
  const tween = useRef<gsap.core.Tween | null>(null);
  const busy = useRef(false);
  const drag = useRef<{ x0: number; start: number; moved: boolean; samples: { t: number; x: number }[]; id: number } | null>(null);

  const geometry = useCallback(() => {
    const v = viewport.current;
    const b = belt.current;
    if (!v || !b) return { stops: [0], max: 0 };
    const cs = getComputedStyle(b);
    const pad = parseFloat(cs.paddingLeft) || 0;
    const cards = [...b.querySelectorAll<HTMLElement>("article")];
    const last = cards[cards.length - 1];
    const content = last.offsetLeft + last.offsetWidth + (parseFloat(cs.paddingRight) || 0);
    const max = Math.max(0, Math.round(content - v.clientWidth));
    const raw = cards.map((a) => Math.max(0, Math.min(max, Math.round(a.offsetLeft - pad))));
    // the last cards can clamp to (almost) the same end position: keep one stop there, not a tiny extra click
    return { stops: raw.filter((s, i) => i === raw.length - 1 || raw[i + 1] - s >= 24), max };
  }, []);

  const render = (x: number, moving: boolean) => {
    const b = belt.current;
    if (!b) return;
    b.style.transform = x === 0 && !moving ? "" : `translate3d(${(-x).toFixed(3)}px, 0, 0)`;
  };
  const hint = (on: boolean) => {
    const b = belt.current;
    if (!b) return;
    b.style.willChange = on ? "transform" : "";
    b.style.backfaceVisibility = on ? "hidden" : "";
  };
  const syncEdges = useCallback(() => {
    const { max } = geometry();
    const next = { start: pos.current.x <= 2, end: pos.current.x >= max - 2 };
    setEdge((e) => (e.start === next.start && e.end === next.end ? e : next));
  }, [geometry]);

  const glide = (target: number, duration: number, ease: string) => {
    tween.current?.kill();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    busy.current = true;
    hint(true);
    const done = () => {
      pos.current.x = target; // lands on a whole pixel: no sub-pixel micro-adjustment
      render(target, false);
      hint(false);
      busy.current = false;
      syncEdges();
    };
    if (reduced || duration <= 0) return done();
    tween.current = gsap.to(pos.current, { x: target, duration, ease, overwrite: true, onUpdate: () => render(pos.current.x, true), onComplete: done });
  };

  // One card per click, to the same stop positions a drag-and-release settles on.
  const step = (dir: 1 | -1) => {
    if (busy.current || drag.current) return; // never start a second transition before the first one ends
    const { stops } = geometry();
    const here = pos.current.x;
    const target = dir === 1 ? stops.find((s) => s > here + 4) : [...stops].reverse().find((s) => s < here - 4);
    if (target !== undefined) glide(target, 1.0, "power2.inOut");
  };

  useEffect(() => {
    const onResize = () => {
      const { max } = geometry();
      tween.current?.kill();
      busy.current = false;
      hint(false);
      pos.current.x = Math.max(0, Math.min(max, Math.round(pos.current.x)));
      render(pos.current.x, false);
      syncEdges();
    };
    syncEdges();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      tween.current?.kill();
    };
  }, [geometry, syncEdges]);

  // Staged fade-up reveal (heading, then the first card, then the second), once, when the section properly
  // enters the viewport. Skipped under prefers-reduced-motion.
  useLayoutEffect(() => {
    const el = section.current;
    if (!el) return;
    if (motionOff("harmony", el)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced motion: show the final state at once; intentionally unchanged
      setRevealed(true);
      return;
    }
    return initHarmonyReveal(el, () => setRevealed(true));
  }, []);

  // Drag / swipe (mouse, touch and pen share this path). The belt follows the pointer one-to-one (with a soft
  // resistance past either end); on release it glides to the nearest stop, aware of the release velocity.
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const v = viewport.current;
    if (!v || (e.pointerType === "mouse" && e.button !== 0)) return;
    tween.current?.kill();
    busy.current = false;
    hint(true);
    drag.current = { x0: e.clientX, start: pos.current.x, moved: false, samples: [{ t: performance.now(), x: pos.current.x }], id: e.pointerId };
    v.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const v = viewport.current;
    if (!d || !v || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x0;
    if (!d.moved && Math.abs(dx) < 4) return;
    if (!d.moved) {
      d.moved = true;
      v.style.cursor = "grabbing";
      v.style.userSelect = "none";
    }
    const { max } = geometry();
    let x = d.start - dx;
    if (x < 0) x *= 0.35;
    else if (x > max) x = max + (x - max) * 0.35;
    pos.current.x = x;
    render(x, true);
    const now = performance.now();
    d.samples.push({ t: now, x });
    while (d.samples.length > 2 && now - d.samples[0].t > 100) d.samples.shift();
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const v = viewport.current;
    if (!d || !v || e.pointerId !== d.id) return;
    drag.current = null;
    if (v.hasPointerCapture(e.pointerId)) v.releasePointerCapture(e.pointerId);
    v.style.cursor = "";
    v.style.userSelect = "";
    if (!d.moved) {
      hint(false);
      return;
    }
    const { stops, max } = geometry();
    const a = d.samples[0];
    const b = d.samples[d.samples.length - 1];
    const vel = b.t > a.t ? ((b.x - a.x) / (b.t - a.t)) * 1000 : 0; // px/s, + = belt moving left
    const projected = Math.max(0, Math.min(max, pos.current.x + vel * 0.18));
    const target = stops.reduce((best, s) => (Math.abs(s - projected) < Math.abs(best - projected) ? s : best), stops[0]);
    glide(target, 0.8, "power3.out");
  };

  return (
    <section ref={section} className="bg-white pt-[48px] md:pt-[clamp(70px,6vw,120px)] pb-[56px] md:pb-[clamp(56px,4.2vw,80px)]">
      <div className="flex flex-col items-center px-5 text-center" style={{ color: INK }}>
        <h2 className="font-normal" style={{ fontSize: u(58, 28), lineHeight: 1.15, letterSpacing: "0.005em" }}>
          HarmonySpace 5
        </h2>
        <p style={{ marginTop: u(26, 12), fontSize: u(22, 15), lineHeight: 1.4, letterSpacing: "0.01em" }}>
          The pinnacle of intelligent interaction across all scenarios
        </p>
      </div>

      {/* The viewport clips and takes the drag; the belt inside is the only moving part (transform alone). */}
      <div
        ref={viewport}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onDragStart={(e) => e.preventDefault()}
        role="group"
        aria-roledescription="carousel"
        aria-label="HarmonySpace features"
        className="cursor-grab overflow-hidden [touch-action:pan-y]"
        style={{
          marginTop: u(96, 36),
          // Room (cancelled by the negative margin, so the layout is unchanged) for the cards' small rise during
          // the reveal: their translated position then stays inside the viewport instead of being clipped.
          paddingBottom: 24,
          marginBottom: -24,
        }}
      >
        <div
          ref={belt}
          data-fx="belt"
          className="relative flex"
          style={{ gap: u(26, 12), paddingLeft: u(147, 20), paddingRight: u(32, 20) }}
        >
        {SLIDES.map((s, i) => (
          <article
            key={s.title}
            className="flex w-[84vw] shrink-0 flex-col md:w-[calc(var(--u)*857)]"
            style={{ color: INK }}
          >
            {/* The article is the static layout box (final size reserved from the start); only this inner wrapper is
                ever animated by the reveal, so layout and animation transforms never share an element. */}
            <div data-fx="card-inner" className="flex flex-1 flex-col">
            <div className="relative aspect-video w-full bg-black">
              {/* The first two videos wait for the reveal to finish before they start playing: a video that begins
                  decoding while its layer is moving is a source of micro-judder. */}
              <AutoVideo src={s.video} label={s.label} active={revealed || i > 1} className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div
              className="flex-1"
              style={{
                border: "1px solid rgba(20,20,20,0.4)",
                borderTop: 0,
                padding: `${u(24, 16)} ${u(26, 16)} ${u(28, 18)}`,
              }}
            >
              <h3 className="font-normal" style={{ fontSize: u(34, 22), lineHeight: 1.2, letterSpacing: "0.005em" }}>
                {s.title}
                {/* footnote mark raised above the cap line */}
                <span style={{ position: "relative", top: "-0.34em" }}>*</span>
              </h3>
              <p style={{ marginTop: u(16, 10), fontSize: u(17, 12.5), lineHeight: 1.4 }}>{s.body}</p>
              <p style={{ marginTop: u(22, 12), fontSize: u(12, 10.5), lineHeight: 1.4, opacity: 0.8 }}>{OTA_NOTE}</p>
            </div>
            </div>
          </article>
        ))}
        </div>
      </div>

      {/* Navigation: its own clean space under the cards (never over them), close enough to read as theirs. */}
      <div data-fx="arrows" className="flex items-center justify-center" style={{ marginTop: u(48, 36), gap: u(56, 28) }}>
        <CarouselArrow dir="prev" inline disabled={edge.start} onClick={() => step(-1)} className="border-[#141414] text-[#141414] hover:bg-black/5" />
        <CarouselArrow dir="next" inline disabled={edge.end} onClick={() => step(1)} className="border-[#141414] text-[#141414] hover:bg-black/5" />
      </div>
    </section>
  );
}
