"use client";

// TEMPORARY mobile debugging overlay (not part of the final version). Shown only with ?dbg=1 in the URL.
// A small fixed panel (no pointer events) that reports, live, what the page itself is doing on the real phone:
//   fps / longest frame, GSAP animations running + stalled, ScrollTrigger count + refreshes, window resizes (toolbar),
//   layout shift, errors/warnings, and for the screen currently in view: number-roll overlays, invisible text, and
//   images not loaded yet. If the screen looks stuck while this panel says "rolls 0 · hidden 0 · blank 0", the DOM is
//   already in its final state and the phone is not repainting it (a rendering problem, not an animation problem).
import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Stats = Record<string, string>;

export default function MobileDebugHud() {
  const [on, setOn] = useState(false);
  const [s, setS] = useState<Stats>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- temporary debug overlay, read once from the URL
    setOn(new URLSearchParams(window.location.search).get("dbg") === "1");
  }, []);

  useEffect(() => {
    if (!on) return;
    const errors: string[] = [];
    const push = (m: string) => {
      errors.unshift(m.slice(0, 90));
      errors.length = Math.min(errors.length, 3);
    };
    const onErr = (e: ErrorEvent) => push("ERR " + e.message);
    const onRej = (e: PromiseRejectionEvent) => push("REJ " + String(e.reason));
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    const origWarn = console.warn;
    const origError = console.error;
    console.warn = (...a: unknown[]) => (push("WARN " + a.map(String).join(" ")), origWarn(...a));
    console.error = (...a: unknown[]) => (push("CERR " + a.map(String).join(" ")), origError(...a));

    let resizes = 0;
    const onResize = () => resizes++;
    window.addEventListener("resize", onResize);
    let refreshes = 0;
    const onRefresh = () => refreshes++;
    ScrollTrigger.addEventListener("refresh", onRefresh);
    let cls = 0;
    let po: PerformanceObserver | undefined;
    try {
      po = new PerformanceObserver((l) => l.getEntries().forEach((e) => {
        const ls = e as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (!ls.hadRecentInput) cls += ls.value;
      }));
      po.observe({ type: "layout-shift", buffered: true });
    } catch {}

    const frames: number[] = [];
    let last = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      frames.push(t - last);
      last = t;
      if (frames.length > 300) frames.shift();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const seen = new WeakMap<gsap.core.Animation, number>();
    const vis = (r: DOMRect) => r.bottom > 40 && r.top < window.innerHeight - 40 && r.width > 4 && r.height > 4;
    const tick = () => {
      const now = performance.now();
      const recent = frames.slice(-60);
      const avg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
      const longest = frames.length ? Math.max(...frames) : 0;
      let running = 0;
      let stalled = 0;
      for (const a of gsap.globalTimeline.getChildren(false, true, true)) {
        if (a.repeat() !== 0 || a.paused() || a.progress() >= 1) continue;
        running++;
        if (!seen.has(a)) seen.set(a, now);
        const due = ((a.delay() + a.totalDuration()) / (a.timeScale() || 1)) * 1000 + 2500;
        if (now - seen.get(a)! > due && !a.scrollTrigger) stalled++;
      }
      const rolls = [...document.querySelectorAll("main [data-fx] > span[aria-hidden='true']")].filter(
        (o) => o.querySelector("span span") && vis(o.getBoundingClientRect()),
      ).length;
      const hidden = [...document.querySelectorAll<HTMLElement>("main h2, main h3, main p, main dd, main dt, main [data-fx], main [data-line]")].filter((e) => {
        if (!e.textContent?.trim() || !vis(e.getBoundingClientRect()) || e.closest("[aria-hidden='true']")) return false;
        let x: HTMLElement | null = e;
        let op = 1;
        while (x && x !== document.body) {
          const cs = getComputedStyle(x);
          if (cs.visibility === "hidden" || /inset\([^)]*100%/.test(cs.clipPath)) return true;
          op *= +cs.opacity;
          x = x.parentElement;
        }
        return op < 0.5;
      }).length;
      const blank = [...document.querySelectorAll<HTMLImageElement>("main img")].filter(
        (i) => vis(i.getBoundingClientRect()) && +getComputedStyle(i).opacity > 0.5 && !(i.complete && i.naturalWidth > 0),
      ).length;
      setS({
        mm: new URLSearchParams(window.location.search).get("mm") ?? "(all on)",
        off: String(document.querySelectorAll("[data-mm-off]").length),
        fps: avg ? (1000 / avg).toFixed(0) : "-",
        longFrame: longest.toFixed(0) + "ms",
        gsap: `${running} run / ${stalled} stalled`,
        st: `${ScrollTrigger.getAll().length} / ${refreshes} refresh`,
        resize: `${resizes} · ${window.innerHeight}px · vv ${Math.round(window.visualViewport?.height ?? 0)}`,
        cls: cls.toFixed(3),
        screen: `rolls ${rolls} · hidden ${hidden} · blank ${blank}`,
        y: String(Math.round(window.scrollY)),
        err: errors.join(" | ") || "none",
      });
    };
    const iv = window.setInterval(tick, 500);
    return () => {
      window.clearInterval(iv);
      cancelAnimationFrame(raf);
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
      window.removeEventListener("resize", onResize);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      po?.disconnect();
      console.warn = origWarn;
      console.error = origError;
    };
  }, [on]);

  if (!on) return null;
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: 4,
        bottom: 4,
        zIndex: 2147483647,
        pointerEvents: "none",
        maxWidth: "calc(100vw - 8px)",
        padding: "4px 6px",
        background: "rgba(0,0,0,0.78)",
        color: "#7CFC9A",
        font: "10px/1.35 ui-monospace, Menlo, Consolas, monospace",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      {Object.entries(s)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")}
    </div>
  );
}
