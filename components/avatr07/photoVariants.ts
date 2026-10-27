"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { MOBILE_QUERY } from "./mobileMotion";

// Sections that switch between several photos of one view (colours, cockpit trims, tabs, slides) stack every
// version and cross-fade the selected one. Rendering them all from the start made a phone download every hidden
// version (about 2.8 MB on this page) in the same queue as the photos the viewer is scrolling towards, so those
// arrived late. This keeps the hidden versions out of the page until they are cheap to fetch:
//
//   * desktop: every version is added right after the page starts (as before; nothing visible changes)
//   * phones: only the selected photo at first; the others are added once the section is on screen AND every photo
//     on or just below the screen has finished downloading, or at once when the viewer picks another version
//   * a newly picked photo replaces the shown one only once it has loaded (the current photo stays until then, so a
//     slow connection never shows an empty frame); a failed download switches too, so a tap is never ignored
//
// Same files, same sizes, same quality: only the moment the hidden versions are requested changes.
const QUIET_CHECK_MS = 500;

// Is any visible photo on screen or within ~1.5 screens below it still downloading? (Hidden stacked versions carry
// aria-hidden and do not count.)
function photosPendingNearby() {
  const vh = window.innerHeight;
  for (const img of document.querySelectorAll<HTMLImageElement>("main img")) {
    if (img.complete || img.getAttribute("aria-hidden") === "true") continue;
    const r = img.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh * 2.5 && r.width > 0) return true;
  }
  return false;
}

export function usePhotoVariants<T>(initial: T, area: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(initial); // the selected version (controls, captions)
  const [shown, setShown] = useState(initial); // the version whose photo is painted on top
  const [warm, setWarm] = useState(false); // every version is in the page
  const loaded = useRef(new Set<T>([initial])); // the first photo is shown from the start (it may finish before hydration)
  const activeRef = useRef(initial);

  useEffect(() => {
    if (warm) return;
    if (!window.matchMedia(MOBILE_QUERY).matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- desktop: add every version once the page has started, as before
      setWarm(true);
      return;
    }
    const el = area.current;
    if (!el) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(timer);
      if (!e.isIntersecting) return;
      const check = () => {
        if (!photosPendingNearby()) setWarm(true);
      };
      check();
      timer = window.setInterval(check, QUIET_CHECK_MS);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [warm, area]);

  const select = (id: T) => {
    activeRef.current = id;
    setActive(id);
    setWarm(true);
    if (loaded.current.has(id)) setShown(id);
  };

  // spread onto each version's <Image>: it has arrived (or definitely failed), so it may be shown
  const track = (id: T) => {
    const done = () => {
      loaded.current.add(id);
      if (activeRef.current === id) setShown(id);
    };
    return { onLoad: done, onError: done };
  };

  return { active, shown, select, track, mounted: (id: T) => warm || id === active || id === shown };
}
