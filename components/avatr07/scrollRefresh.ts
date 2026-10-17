import { ScrollTrigger } from "gsap/ScrollTrigger";

// Every motion module re-measures its triggers once the web font has loaded (text reflows, so positions move). There
// are about twenty of them and `document.fonts.ready` resolves for all of them in the same turn, which used to run
// ScrollTrigger.refresh() - a full re-measure of every trigger on the page, with forced layout - twenty times in a row.
// This coalesces those calls into one refresh at the end of the turn, after every module has created its triggers.
let queued = false;

export function refreshScrollTriggers() {
  if (queued) return;
  queued = true;
  queueMicrotask(() => {
    queued = false;
    ScrollTrigger.refresh();
  });
}

// Whether "this block is already past its trigger" can be trusted right now. Used by the two blocks nearest the
// hero (Futuristic Design, Golden Ratio), which a first visit could otherwise mark as played before the viewer ever
// reaches them. False while the page is hidden or being prerendered (no real viewport yet), while a stylesheet is
// still loading (the hero has no height yet, so everything below it measures near the top), and while the viewer is
// at the very top of the page: the hero fills the first screen, so neither block can be on screen there.
export function triggerPositionsTrustworthy() {
  if (document.visibilityState !== "visible") return false;
  if ((document as Document & { prerendering?: boolean }).prerendering) return false;
  if (window.scrollY < 2) return false;
  return [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].every((l) => l.sheet !== null);
}

// Per-section gate around triggerPositionsTrustworthy(). When the page was reached by a client-side navigation (the
// document was already hydrated, e.g. landing page -> AVATR 07), the sections can initialise while the window still
// holds the previous page's scroll position: RouteScrollReset / PageTopReset return it to the top a moment later, and
// on a first visit (route code still downloading) that moment can come after the sections have measured themselves.
// Until the window has been seen back at the top (or ~1.2s have passed, e.g. a Back navigation that restores a
// position) nothing is judged as passed. `onSettle` re-runs the caller's check once the wait is over.
export function createTriggerGate(onSettle: () => void) {
  const clientNav = !!(window as Window & { __avatrHydrated?: boolean }).__avatrHydrated;
  let settled = !clientNav;
  let timer = 0;
  if (!settled) timer = window.setTimeout(() => {
    settled = true;
    onSettle();
  }, 1200);
  const gate = () => {
    if (!settled) {
      if (window.scrollY >= 2) return false;
      settled = true;
      window.clearTimeout(timer);
    }
    return triggerPositionsTrustworthy();
  };
  return { gate, dispose: () => window.clearTimeout(timer) };
}
