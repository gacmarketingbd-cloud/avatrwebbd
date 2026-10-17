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
