import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { refreshScrollTriggers } from "./scrollRefresh";
import { FADE_RISE } from "./fadeRise";

import { MAX_RISE } from "./motionKit";

gsap.registerPlugin(ScrollTrigger);

// Optical Surround Ambient Lighting: a one-time entrance (heading, description, three specs) followed by a
// continuously flowing multi-colour gradient inside the single word "Ambient" while the section is on screen.
//
//   heading   masked upward reveal: clip-path + 20px rise + fade 0 -> 1; the moment it settles the gradient starts
//   subtitle  fade + 20px rise, a short beat after the heading
//   specs     21 / 249 pcs / 2800 mm rise 20px + fade, staggered left -> centre -> right (no rolling)
//   gradient  the word is text-clipped gradient (background-clip:text) at 250% width; only background-position
//             is animated, by exactly one tile width per cycle, so the loop is seamless and the colours flow
//             left -> right through the letters. A blurred copy behind it (same gradient, same motion) is the
//             matching soft glow. Cycle ~3.5 s, linear, no pause.
// The static design (no JS / reduced motion) already shows the gradient and glow, just not moving. The word's
// fill fades from white into the gradient at the start; the other words stay white. The loop pauses when the
// section is far outside the viewport. The video is never touched.
const TRIGGER = 0.85; // heading top edge 15% up from the bottom of the screen
const CYCLE = 3.5; // seconds per full loop
const TILE = 2.5; // gradient tile = 250% of the word's width (must match background-size in AmbientLighting.tsx)
const HEADING_DURATION = 1.2;
const GLOW_OPACITY = 0.55;

export function initAmbientLighting(section: HTMLElement) {
  const heading = section.querySelector<HTMLElement>("h2");
  const fill = section.querySelector<HTMLElement>("[data-fx='ambient-fill']");
  const glow = section.querySelector<HTMLElement>("[data-fx='ambient-glow']");
  const subtitle = section.querySelector<HTMLElement>("h2 + p");
  const specs = [...section.querySelectorAll<HTMLElement>("[data-fx='spec']")];
  if (!heading || !fill || !glow || !subtitle) return;

  let played = false;
  let disposed = false;
  let flow: gsap.core.Tween | null = null;
  let visible = true;
  const cleanups: Array<() => void> = [];

  const ctx = gsap.context(() => {
    gsap.set(heading, { clipPath: "inset(-0.2em 0px 100% 0px)", y: MAX_RISE, autoAlpha: 0 });
    gsap.set(subtitle, { autoAlpha: 0, y: MAX_RISE });
    gsap.set(specs, { autoAlpha: 0, y: MAX_RISE });
    gsap.set(fill, { webkitTextFillColor: "rgb(255, 255, 255)" }); // white until the gradient takes over
    gsap.set(glow, { opacity: 0 });

    // one seamless loop: shift the background by exactly one tile width (word width x TILE), left -> right
    const startFlow = () => {
      flow?.kill();
      const tile = fill.offsetWidth * TILE;
      flow = gsap.fromTo(
        [fill, glow],
        { backgroundPositionX: `${-tile}px` },
        { backgroundPositionX: "0px", duration: CYCLE, ease: "none", repeat: -1, paused: !visible },
      );
    };
    const startGradient = () => {
      if (disposed) return;
      startFlow();
      gsap.to(fill, { webkitTextFillColor: "rgba(255, 255, 255, 0)", duration: 0.9, ease: "sine.inOut" });
      gsap.to(glow, { opacity: GLOW_OPACITY, duration: 1.2, ease: "sine.inOut" });
    };

    const play = async () => {
      if (played || disposed) return;
      played = true;
      if (document.fonts?.ready) await document.fonts.ready;
      if (disposed) return;
      ctx.add(() => {
        const tl = gsap.timeline({
          onComplete: () => gsap.set([subtitle, ...specs], { clearProps: "transform,opacity,visibility" }),
        });
        tl.to(heading, { clipPath: "inset(-0.2em 0px -0.35em 0px)", y: 0, autoAlpha: 1, duration: HEADING_DURATION, ease: "power2.out" }, 0);
        tl.call(() => gsap.set(heading, { clearProps: "clipPath,transform,opacity,visibility" }), undefined, HEADING_DURATION + 0.02);
        tl.call(startGradient, undefined, HEADING_DURATION); // settled: the gradient starts immediately
        tl.to(subtitle, { autoAlpha: 1, y: 0, duration: FADE_RISE.duration * 1.1, ease: FADE_RISE.ease }, 0.5);
        specs.forEach((spec, i) => tl.to(spec, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" }, 0.85 + i * 0.2));
      });
    };

    const evaluate = () => {
      if (!played && heading.getBoundingClientRect().top < window.innerHeight * TRIGGER) void play();
    };
    ScrollTrigger.create({ trigger: heading, start: `top ${TRIGGER * 100}%`, once: true, onEnter: play });
    window.addEventListener("scroll", evaluate, { passive: true });
    const onResize = () => {
      evaluate();
      if (flow) startFlow(); // the tile width follows the word's width
    };
    window.addEventListener("resize", onResize);
    cleanups.push(() => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", onResize);
    });
    evaluate();
    document.fonts?.ready.then(() => {
      refreshScrollTriggers();
      evaluate();
    });

    // pause the continuous loop when the section is far outside the viewport
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (flow) {
          if (visible) flow.resume();
          else flow.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(section);
    cleanups.push(() => io.disconnect());
  }, section);

  return () => {
    disposed = true;
    cleanups.forEach((fn) => fn());
    flow?.kill();
    ctx.revert();
  };
}
