"use client";

import { useEffect } from "react";

// Prepares the photos below the fold BEFORE the viewer gets to them, without loading everything at once.
//
// Browsers only start a `loading="lazy"` image when it is a fixed distance from the viewport (~1250px on a fast
// connection) and decode it only when it is about to be painted. For the 1-2 MB photos in this page that is too
// late on a phone or a cold cache: the section scrolls in with an empty frame and the decode lands in the middle of
// a scroll. So every lazy photo goes through two stages here:
//   1. FETCH: within ~3 screens of the viewport it is switched to eager, so the browser downloads it now. At most two
//      downloads run at once, nearest photo first, so they do not fight each other or the videos.
//   2. DECODE: within ~1.3 screens, once downloaded, img.decode() is called (one at a time) so the pixels are decoded
//      off the main thread and ready when the photo is first painted.
// Nothing is resized or recompressed: the same files, at the same quality, are just requested and decoded earlier.
const FETCH_MARGIN = "300% 0px";
const DECODE_MARGIN = "130% 0px";
const MAX_FETCHES = 2;

export default function MediaAhead() {
  useEffect(() => {
    const imgs = [...document.querySelectorAll<HTMLImageElement>("main img")].filter(
      (i) => i.loading === "lazy" && !i.complete,
    );
    if (!imgs.length) return;

    const top = (i: HTMLImageElement) => i.getBoundingClientRect().top;
    const fetchQueue = new Set<HTMLImageElement>();
    let fetching = 0;
    const decodeQueue = new Set<HTMLImageElement>();
    let decoding = false;
    let disposed = false;

    const nearest = (set: Set<HTMLImageElement>) => {
      let best: HTMLImageElement | null = null;
      for (const i of set) if (!best || Math.abs(top(i)) < Math.abs(top(best))) best = i;
      return best;
    };

    const pumpDecode = () => {
      if (decoding || disposed) return;
      // only photos that are already downloaded can be decoded
      const ready = new Set([...decodeQueue].filter((i) => i.complete && i.naturalWidth > 0));
      const next = nearest(ready);
      if (!next) return;
      decodeQueue.delete(next);
      decoding = true;
      next
        .decode()
        .catch(() => undefined)
        .finally(() => {
          decoding = false;
          pumpDecode();
        });
    };

    const pumpFetch = () => {
      while (!disposed && fetching < MAX_FETCHES && fetchQueue.size) {
        const next = nearest(fetchQueue)!;
        fetchQueue.delete(next);
        if (next.complete && next.naturalWidth > 0) continue;
        fetching++;
        const done = () => {
          next.removeEventListener("load", done);
          next.removeEventListener("error", done);
          fetching--;
          pumpFetch();
          pumpDecode();
        };
        next.addEventListener("load", done);
        next.addEventListener("error", done);
        next.loading = "eager"; // starts the download now
      }
    };

    const fetchIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          fetchIO.unobserve(e.target);
          fetchQueue.add(e.target as HTMLImageElement);
        }
        pumpFetch();
      },
      { rootMargin: FETCH_MARGIN },
    );
    const decodeIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          decodeIO.unobserve(e.target);
          decodeQueue.add(e.target as HTMLImageElement);
        }
        pumpDecode();
      },
      { rootMargin: DECODE_MARGIN },
    );
    imgs.forEach((i) => {
      fetchIO.observe(i);
      decodeIO.observe(i);
    });

    return () => {
      disposed = true;
      fetchIO.disconnect();
      decodeIO.disconnect();
    };
  }, []);

  return null;
}
