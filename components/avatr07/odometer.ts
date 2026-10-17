type Odometer = { overlay: HTMLElement; strips: HTMLElement[]; rowH: number; rows: number[] };

type Options = {
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
  const rowH = host.height;
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
    strip.style.cssText = "display:block;will-change:transform;";

    const cellStyle = `display:block;height:${rowH}px;line-height:${rowH}px;padding-left:${pad}px;white-space:nowrap;`;
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
