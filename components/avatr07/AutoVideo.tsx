"use client";

import { useEffect, useRef } from "react";

// Muted, looping, inline background video for the Phase 3 sections. The file is served untouched
// (no re-encode). It only plays while on screen (and while `active`, for stacked slide videos), and
// not at all under prefers-reduced-motion (the first frame shows instead), so off-screen 4K clips
// never decode in the background.
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
    if (onScreen.current && wanted.current) void v.play().catch(() => {});
    else v.pause();
  };

  useEffect(() => {
    wanted.current = active;
    sync();
  }, [active]);

  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen.current = e.isIntersecting;
        sync();
      },
      { threshold: 0.15 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="auto"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
    />
  );
}
