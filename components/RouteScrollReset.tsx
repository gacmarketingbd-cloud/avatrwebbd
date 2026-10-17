"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Every NEW page navigation starts at the top of the new page.
//
// Why it is needed: the App Router only scrolls to the top when the first element of the new page is outside the
// viewport. Every page here starts with a fixed header (always inside the viewport), so Next decided there was
// nothing to scroll and AVATR 07 opened at whatever scroll position the previous page had (and html's
// `scroll-behavior: smooth` would have turned any later correction into a visible glide).
//
// This runs in a layout effect on the pathname change, i.e. as part of the route commit and before the browser
// paints the new page, so there is no visible jump. It deliberately does NOT act on:
//   * the first render (nothing to reset),
//   * browser Back / Forward (popstate): restoring the previous position there is the expected behaviour,
//   * URLs with a #hash: in-page anchors scroll to their target as usual.
export default function RouteScrollReset() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);
  const poppedAt = useRef(-Infinity);

  useEffect(() => {
    // Shared with PageTopReset and the top-of-page motion gate (scrollRefresh): from now on a page mount means a
    // client-side navigation, and the time of the last Back/Forward. (Deliberately no GSAP import here: loading
    // ScrollTrigger in the root layout stalled lazy image requests after a mid-page reload.)
    (window as Window & { __avatrHydrated?: boolean }).__avatrHydrated = true;
    const onPop = () => {
      poppedAt.current = performance.now();
      (window as Window & { __avatrPoppedAt?: number }).__avatrPoppedAt = poppedAt.current;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useLayoutEffect(() => {
    if (previous.current === null) {
      previous.current = pathname;
      return;
    }
    if (previous.current === pathname) return;
    previous.current = pathname;
    if (performance.now() - poppedAt.current < 1500) return; // history navigation: leave the browser's restore alone
    if (window.location.hash) return; // in-page anchor: let it scroll to its target
    const root = document.documentElement;
    const before = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto"; // jump, never a smooth glide up from the old position
    window.scrollTo(0, 0);
    root.style.scrollBehavior = before;
  }, [pathname]);

  return null;
}
