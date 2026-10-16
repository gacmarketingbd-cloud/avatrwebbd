"use client";

import { Fragment, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import zeroGravity from "../../avatr 07 page/Front‑Row Dual Zero‑Gravity Seats.webp";
import nappa from "../../avatr 07 page/NAPPA-Top-Layer-Leather.webp";
import health from "../../avatr 07 page/Health-focused-cabin-built-to-C-GCAP-five-star-standards.webp";
import { INK, u } from "./scale";


// Copy for tabs 2 and 3 is placeholder until the real text is supplied.
const TABS = [
  {
    id: "seats",
    title: "Front-Row Dual Zero-Gravity Seats",
    image: zeroGravity,
    alt: "AVATR 07 front-row zero-gravity seat reclined",
    copy: ["16-way electric adjustment, one-touch 120° zero-gravity recline Heating, ventilation, and SPA-inspired 8-point massage for all seats"],
  },
  { id: "nappa", title: "NAPPA Top-Layer Leather", image: nappa, alt: "AVATR 07 NAPPA leather seat detail",
    copy: [
      "NAPPA top-layer leather seats, delicate pearlescent finish, with hues shifting under light",
      "Dinamica® microfiber suede roof lining, soft and skin-friendly, with an exceptional design quality",
      "Luxurious 10-square-meter full soft-touch upholstery, luxurious by every touch and feel",
    ],
  },
  {
    id: "health",
    title: "C-GCAP Five-Star Cabin",
    image: health,
    alt: "Child resting in the AVATR 07 rear seat",
    copy: [
      "Microfiber suede roof lining with OEKO-TEX Standard 100 certification, infant-grade healthy material.",
      "Genuine Leather, selected premium top-grain hide. Naturally rich in supple and firm collagen fibers, it offers a comfortable skin-friendly touch.",
      "Meticulously crafted with NAPPA artistry and innovative water-based polyurethane dispersion technology, it perfectly recreates the natural texture of authentic leather.",
      "720° soundproof armor built into the car body, with 133 acoustic treatments creating a serene sanctuary within the vehicle.",
    ],
  },
] as const;

const FADE = "opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)";

// Phase 2 · 2 — seating-material feature: a centred photo (1250px wide on the artboard, narrower on short
// viewports so photo + tabs + description are visible together), a three-tab row of equal-width columns, and a
// centred description. The active tab's dark underline is as wide as its title's widest line and shares the
// title's horizontal centre; the thin grey separator spans the whole column.
export default function SeatingFeature() {
  const [active, setActive] = useState(0);
  const titles = useRef<(HTMLSpanElement | null)[]>([]);
  const [widths, setWidths] = useState<number[]>([]);

  // Width of each title's widest line (a Range over the text spans the lines), so the underline follows the
  // title even when it wraps. Re-measured on resize.
  useLayoutEffect(() => {
    const measure = () =>
      setWidths(
        titles.current.map((el) => {
          if (!el) return 0;
          const r = document.createRange();
          r.selectNodeContents(el);
          return Math.round(r.getBoundingClientRect().width);
        }),
      );
    measure();
    const ro = new ResizeObserver(measure);
    titles.current.forEach((el) => el && ro.observe(el));
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="bg-white px-5" style={{ paddingTop: u(60, 36), paddingBottom: u(70, 36) }}>
      <div className="mx-auto w-full lg:max-w-[min(calc(var(--u)*1250),calc((100svh-72px-var(--u)*212-30px)/0.5530))]">
        <div className="relative aspect-[3000/1659] w-full overflow-hidden">
          {TABS.map((t, i) => (
            <Image
              key={t.id}
              src={t.image}
              alt={i === active ? t.alt : ""}
              aria-hidden={i !== active}
              fill
              quality={100}
              sizes="(min-width: 1920px) 1250px, (min-width: 1024px) 65vw, 100vw"
              className="object-cover"
              style={{ opacity: i === active ? 1 : 0, transition: FADE, zIndex: i === active ? 1 : 0 }}
            />
          ))}
        </div>

        <div role="tablist" aria-label="Seating features" className="grid grid-cols-1 lg:grid-cols-3" style={{ marginTop: u(32, 20) }}>
          {TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`seat-tab-${t.id}`}
              aria-selected={i === active}
              aria-controls="seat-panel"
              onClick={() => setActive(i)}
              className="relative flex items-center justify-center px-4 text-center transition-opacity duration-300 lg:min-h-[calc(var(--u)*70)]"
              style={{
                color: INK,
                fontSize: u(20, 14),
                lineHeight: 1.35,
                paddingTop: u(14, 12),
                paddingBottom: u(26, 16),
                opacity: i === active ? 1 : 0.7,
                borderBottom: "1px solid rgba(20,20,20,0.16)",
              }}
            >
              <span ref={(n) => { titles.current[i] = n; }} className="block lg:whitespace-nowrap">
                {t.title}
              </span>
              <span
                aria-hidden
                className="absolute bottom-[-1px] left-1/2 h-[2px] origin-center transition-transform duration-500"
                style={{ background: INK, width: widths[i] || "60%", marginLeft: widths[i] ? -widths[i] / 2 : "-30%", transform: `scaleX(${i === active ? 1 : 0})` }}
              />
            </button>
          ))}
        </div>

        {/* All three descriptions share one grid cell, so the block is as tall as the longest and nothing below it
            jumps when the tab changes; only the active one is visible. */}
        <div
          id="seat-panel"
          role="tabpanel"
          aria-labelledby={`seat-tab-${TABS[active].id}`}
          className="relative left-1/2 grid -translate-x-1/2 text-center"
          style={{ marginTop: u(26, 20), width: `min(${u(1380)}, calc(100vw - 40px))`, color: INK, fontSize: u(16, 13), lineHeight: 1.5, letterSpacing: "0.01em" }}
        >
          {TABS.map((t, i) => (
            <div key={t.id} aria-hidden={i !== active} style={{ gridArea: "1 / 1", opacity: i === active ? 1 : 0, transition: FADE, pointerEvents: i === active ? "auto" : "none" }}>
              {t.copy.map((line) => (
                <p key={line}>
                  {line.split("®").map((part, k) => (
                    <Fragment key={k}>
                      {k > 0 && <sup style={{ fontSize: "0.6em", lineHeight: 0 }}>®</sup>}
                      {part}
                    </Fragment>
                  ))}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
