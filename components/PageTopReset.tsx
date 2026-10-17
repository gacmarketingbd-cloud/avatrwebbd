"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Rendered as the FIRST child of a page, so its layout effect runs before any section on that page arms its scroll
// animation. On a client-side navigation (e.g. landing page -> AVATR 07) the new page mounts while the window still
// holds the previous page's scroll position; RouteScrollReset only puts it back to the top in a later commit, by which
// time the sections near the top had already measured themselves as "passed" and played off-screen. Resetting here,
// first, means every section measures against the top of the page. It does nothing on the initial document load
// (the browser's own restore applies, e.g. a reload mid-page), on Back/Forward, or for #hash URLs: the same cases
// RouteScrollReset leaves alone.
//
// ScrollTrigger caches the scroll position until it sees a scroll event, and a refresh restores that cached value:
// left alone, the first refresh on the new page would put the window back at the previous page's position for a
// moment, and the sections near the top would play there. clearScrollMemory() drops that cache.
export default function PageTopReset() {
  useLayoutEffect(() => {
    const w = window as Window & { __avatrHydrated?: boolean; __avatrPoppedAt?: number };
    if (!w.__avatrHydrated) return; // initial document load
    if (performance.now() - (w.__avatrPoppedAt ?? -Infinity) < 1500) return; // history navigation
    if (window.location.hash) return;
    if (window.scrollY === 0) return;
    const root = document.documentElement;
    const before = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = before;
    ScrollTrigger.clearScrollMemory();
  }, []);
  return null;
}
