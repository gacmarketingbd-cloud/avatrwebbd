type Odometer = { overlay: HTMLElement; strips: HTMLElement[]; rowH: number; rows: number[] };

type Options = {
  // Draw each digit exactly where the real glyph sits, and paint the strips in the page (no compositor layer). Without it a cell inherits `text-align` from its ancestors, so
  // inside a centred block (`text-center`) every digit is centred in its cell, which is 3px wider than the glyph (the
  // left padding), and lands 1.5px to the right of the real text; the roll then snaps back by that much when the real
  // number replaces the overlay. Off by default so sections not yet verified keep their current behaviour.
  exactAlign?: boolean;
  // Number of digit rows that roll past before the final digit. Leave undefined for a
  // full 0-9 pass then on to the final digit (used by the large spec numbers).
  rowsBefore?: number;
};

// Overlays are attached together at the end of the current turn (a microtask, so before the next paint) rather than
// one by one: every number measures its glyphs with Range.getBoundingClientRect(), and appending an overlay between two
// measurements would force a fresh layout of the page for each number. Measure all, then write all.
const pending: Array<[HTMLElement, HTMLElement]> = [];
let attachQueued = false;
function queueAttach(host: HTMLElement, overlay: HTMLElement) {
  pending.push([host, overlay]);
  if (attachQueued) return;
  attachQueued = true;
  queueMicrotask(() => {
    attachQueued = false;
    for (const [h, o] of pending.splice(0)) h.appendChild(o);
  });
}

// Builds an overlay of per-digit vertical strips on top of a number. The real text stays
// in place (only made transparent by the caller) so layout, semantics and the final frame
// are untouched; the caller removes the overlay once the roll settles. Non-digit characters
// (e.g. the decimal point in "0.61") are drawn as static cells so the number reads whole.
export function buildOdometer(numEl: HTMLElement, opts: Options = {}): Odometer | null {
  const textNode = numEl.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return null;
  // Read the text node itself, not textContent: textContent would also include the digits of any
  // overlay already attached, which would push the character offsets past the real text.
  const text = textNode.textContent ?? "";
  if (!text) return null;

  const host = numEl.getBoundingClientRect();
  // exactAlign: rows are a whole number of layout units (1/64 px), so the final row sits at exactly 0 after the roll.
  const rowH = opts.exactAlign ? Math.round(host.height * 64) / 64 : host.height;
  const overlay = document.createElement("span");
  overlay.setAttribute("aria-hidden", "true");
  // Explicit colour: the real text underneath is made transparent during the roll.
  overlay.style.cssText = `position:absolute;inset:0;pointer-events:none;color:${getComputedStyle(numEl).color};`;

  const strips: HTMLElement[] = [];
  const rows: number[] = [];
  const range = document.createRange();
  const pad = 3;

  [...text].forEach((ch, i) => {
    range.setStart(textNode, i);
    range.setEnd(textNode, i + 1);
    const r = range.getBoundingClientRect();
    const digit = Number(ch);
    const isDigit = ch.trim() !== "" && !Number.isNaN(digit);

    const col = document.createElement("span");
    col.style.cssText = `position:absolute;top:0;left:${r.left - host.left - pad}px;width:${
      r.width + pad * 2
    }px;height:${rowH}px;overflow:hidden;`;
    const strip = document.createElement("span");
    // exactAlign: no layer hint, and the strip is moved by `top` (callers animate top, not y). It is painted into the
    // page and its last frame is a plain layout position, so the settled digits are laid out and rasterised exactly
    // like the real number they hand over to, at any device pixel ratio. (A transform, even a 2D one, rounds the glyph
    // baseline differently from layout at fractional/HiDPI ratios: a half-pixel step at the swap.) The column clips the
    // strip, so the per-frame layout stays inside it.
    strip.style.cssText = opts.exactAlign ? "display:block;position:relative;top:0;" : "display:block;will-change:transform;";

    const cellStyle = `display:block;height:${rowH}px;line-height:${rowH}px;padding-left:${pad}px;white-space:nowrap;${opts.exactAlign ? "text-align:left;" : ""}`;
    const addCell = (label: string) => {
      const cell = document.createElement("span");
      cell.textContent = label;
      cell.style.cssText = cellStyle;
      strip.appendChild(cell);
    };

    if (!isDigit) {
      addCell(ch); // static glyph (decimal point, etc.)
      col.appendChild(strip);
      overlay.appendChild(col);
      return;
    }

    if (opts.rowsBefore === undefined) {
      // One full 0-9 pass then on to the final digit.
      const count = 10 + digit + 1;
      for (let n = 0; n < count; n++) addCell(String(n % 10));
      rows.push(count - 1);
    } else {
      // A short run of neighbouring digits ending on the final one.
      const before = opts.rowsBefore;
      for (let n = 0; n <= before; n++) addCell(String((((digit - before + n) % 10) + 10) % 10));
      rows.push(before);
    }
    col.appendChild(strip);
    overlay.appendChild(col);
    strips.push(strip);
  });

  queueAttach(numEl, overlay);
  return { overlay, strips, rowH, rows };
}
