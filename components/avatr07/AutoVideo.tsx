"use client";

import { useEffect, useRef } from "react";

// Muted, looping, inline background video for the Phase 3 sections. The file is served untouched (no re-encode).
//
// Loading is staged so the ten clips never compete with the hero and the first animations on a cold cache:
//   1. nothing at all until the viewer is within ~4 screens of its section (the element has no `src`, so no request
//      is made);
//   2. then `src` is set with preload="metadata" (dimensions, duration, the index of the file);
//   3. within ~1.5 screens the preload is raised to "auto" so the first frames are buffered well before it is seen.
// By the time a clip scrolls in it is ready and shows its first frame, so the staging is invisible. Playback only runs
// while it is on screen (and while `active`, for stacked slide videos), and not at all under prefers-reduced-motion
// (the first frame shows instead), so off-screen 4K clips never decode in the background. The distance is measured
// from the video's whole section, not the video itself: a clip clipped away inside a belt or stack (e.g. the cards
// waiting off to the side of HarmonySpace) never counts as intersecting on its own, yet must be ready before it is
// dragged in.
const FAR_MARGIN = "400% 0px";
const NEAR_MARGIN = "150% 0px";

export default function AutoVideo({
  src,
  className,
  label,
  active = true,
}: {
  src: string;
  className?: string;
  label?: string;
  active?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const onScreen = useRef(false);
  const wanted = useRef(active);

  const sync = () => {
    const v = ref.current;
    if (!v) return;
    if (onScreen.current && wanted.current) {
      // Start playing only once enough is buffered to keep going: decoding frames while the file is still arriving
      // makes both the video and the page stutter (and starts the clip with a visible hitch).
      if (v.readyState >= 3) void v.play().catch(() => {});
      else {
        v.addEventListener(
          "canplay",
          () => {
            if (onScreen.current && wanted.current) void v.play().catch(() => {});
          },
          { once: true },
        );
      }
    } else v.pause();
  };

  useEffect(() => {
    wanted.current = active;
    sync();
  }, [active]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const observers: IntersectionObserver[] = [];

    const attach = () => {
      if (!v.getAttribute("src")) {
        v.preload = "metadata";
        v.src = src;
      }
    };
    const far = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        far.disconnect();
        attach();
      },
      { rootMargin: FAR_MARGIN },
    );
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        attach();
        v.preload = "auto";
      },
      { rootMargin: NEAR_MARGIN },
    );
    const host = v.closest("section") ?? v;
    far.observe(host);
    near.observe(host);
    observers.push(far, near);

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const play = new IntersectionObserver(
        ([e]) => {
          onScreen.current = e.isIntersecting;
          sync();
        },
        { threshold: 0.15 },
      );
      play.observe(v);
      observers.push(play);
    }
    return () => observers.forEach((io) => io.disconnect());
  }, [src]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
    />
  );
}
