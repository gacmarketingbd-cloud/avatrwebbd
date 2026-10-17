"use client";

import { useLayoutEffect } from "react";

// Pairs with the inline script in app/layout.tsx and the `html.motion-pending [data-motion]` rule in globals.css.
//
// While a page is still loading, the animated AVATR 07 sections are kept invisible (visibility only: their boxes and
// the page height are untouched) so a slow first visit never shows them in their finished state before the motion code
// has armed them. This is rendered after every animated section, so its layout effect runs after theirs: by then each
// section has applied its start state (hidden / clipped / offset elements), and lifting the flag here, in the same
// commit and before the browser paints, hands control to those start states and to ScrollTrigger. Nothing animates
// differently; the only change is that the un-armed, finished-looking frame is never painted.
export default function MotionReady() {
  useLayoutEffect(() => {
    document.documentElement.classList.remove("motion-pending");
  }, []);
  return null;
}
