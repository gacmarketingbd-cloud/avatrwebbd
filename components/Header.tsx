"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logoMark from "../AVATR_Brand English LOGO_White_RGB.png";
import wordmark from "../AVATR_Brand English WORDMARK_White_RGB.png";
import { CroppedMark } from "./CroppedMark";
import { ICON_ONLY_BBOX, LOGO_BBOX, WORDMARK_BBOX } from "./logoBbox";

// Left group: the models. AVATR 07 has a page; AVATR 11 has no route yet, so it is shown but inert (no href, not
// clickable) rather than pointing at a fake page. Right group: the corporate links; "News" has no target yet either.
type NavItem = { label: string; href?: string };
const MODEL_LINKS: NavItem[] = [{ label: "AVATR 07", href: "/avatr-07" }, { label: "AVATR 11" }];
const SITE_LINKS: NavItem[] = [
  { label: "About us", href: "/#about" },
  { label: "News" },
  { label: "Design", href: "/#design" },
  { label: "Tech", href: "/#tech" },
];

// One nav entry: a client-side Next <Link> when it has a route (so it works from every page without a full
// reload), otherwise an inert, non-interactive label. The entry for the page you are on gets a subtle underline.
function NavEntry({
  item,
  pathname,
  className,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  className: string;
  onClick?: () => void;
}) {
  if (!item.href) {
    return (
      <span aria-disabled="true" className={`${className} cursor-default opacity-50`}>
        {item.label}
      </span>
    );
  }
  const active = pathname === item.href;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`${className} ${active ? "underline decoration-white/60 decoration-1 underline-offset-[10px]" : ""}`}
    >
      {item.label}
    </Link>
  );
}

// Desktop logo, reproducing avatr.com/en: at rest the icon sits above a
// small "AVATR" (the vertical lockup). That small text *is* the horizontal
// wordmark — on hover the icon lifts and fades while the wordmark lifts the
// same distance and grows ~2.18x into the header's horizontal logo, ending
// centered. Everything is positioned inside one fixed wrapper that never
// moves or resizes. Geometry comes from the vertical-logo PNG itself
// (icon rows 281–618, baked-in text rows 675–718, text 453px wide).
const LOGO_WRAPPER_WIDTH = 160;
const LOGO_WRAPPER_HEIGHT = 72;
const ICON_HEIGHT = 44;
const WORDMARK_HOVER_HEIGHT = 12;

const lockupScale = ICON_HEIGHT / ICON_ONLY_BBOX.h;
const ICON_TEXT_GAP = (675 - (ICON_ONLY_BBOX.y + ICON_ONLY_BBOX.h)) * lockupScale;
const wordmarkHoverWidth = (WORDMARK_BBOX.w / WORDMARK_BBOX.h) * WORDMARK_HOVER_HEIGHT;
const WORDMARK_REST_SCALE = (453 * lockupScale) / wordmarkHoverWidth;
const wordmarkRestHeight = WORDMARK_HOVER_HEIGHT * WORDMARK_REST_SCALE;
const lockupHeight = ICON_HEIGHT + ICON_TEXT_GAP + wordmarkRestHeight;
const lockupTop = (LOGO_WRAPPER_HEIGHT - lockupHeight) / 2;
const ICON_CENTER_Y = lockupTop + ICON_HEIGHT / 2;
const WORDMARK_CENTER_Y = lockupTop + ICON_HEIGHT + ICON_TEXT_GAP + wordmarkRestHeight / 2;
const HOVER_LIFT = WORDMARK_CENTER_Y - LOGO_WRAPPER_HEIGHT / 2;
const LOGO_EASE = "cubic-bezier(0.42, 0, 0, 1)";

const NAV_CLASS = "text-nav text-white/80 hover:text-white transition-colors";

export default function Header() {
  const [hovered, setHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.7);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const solid = hovered || scrolled;

  return (
    <header
      className="fixed top-0 left-0 z-50 w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Mobile: fixed legibility scrim (no hover interaction on touch);
          switches to a solid bar once scrolled past the hero. */}
      <div
        className={`pointer-events-none absolute inset-0 transition-colors duration-300 ease-in-out md:hidden ${
          scrolled || menuOpen ? "bg-black" : "bg-gradient-to-b from-black/45 to-transparent"
        }`}
      />

      {/* Desktop: solid black on hover or once scrolled past the hero, fully
          transparent only at the very top. */}
      <div
        className={`pointer-events-none absolute inset-0 hidden md:block transition-colors duration-300 ease-in-out ${
          solid ? "bg-black" : "bg-transparent"
        }`}
      />

      <div className="relative flex items-center justify-between px-4 py-3 md:h-[72px] md:px-8 md:py-0">
        {/* Left: the models only. */}
        <nav aria-label="Models" className="hidden md:flex items-center gap-8">
          {MODEL_LINKS.map((link) => (
            <NavEntry key={link.label} item={link} pathname={pathname} className={NAV_CLASS} />
          ))}
        </nav>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="relative z-10 flex h-5 w-5 flex-col items-center justify-center md:hidden"
        >
          <span
            className={`absolute block h-px w-5 bg-white transition-transform duration-300 ease-in-out ${
              menuOpen ? "rotate-45" : "-translate-y-[3px]"
            }`}
          />
          <span
            className={`absolute block h-px w-5 bg-white transition-transform duration-300 ease-in-out ${
              menuOpen ? "-rotate-45" : "translate-y-[3px]"
            }`}
          />
        </button>

        {/* The logo is absolutely centred on the viewport (left 50% / translateX -50%), independent of the two side
            groups, so it can never drift when they differ in width. Its hover animation is unchanged. */}
        <Link
          href="/"
          aria-label="AVATR home"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          {/* Mobile: static vertical mark, sized up to match the enlarged desktop scale */}
          <span className="block md:hidden">
            <CroppedMark src={logoMark} bbox={LOGO_BBOX} heightPx={34} alt="AVATR" priority />
          </span>

          <span
            className="relative hidden overflow-hidden md:block"
            style={{ width: LOGO_WRAPPER_WIDTH, height: LOGO_WRAPPER_HEIGHT }}
          >
            <span
              className="absolute left-1/2"
              style={{
                top: ICON_CENTER_Y,
                opacity: hovered ? 0 : 1,
                transform: `translate(-50%, -50%) translateY(${hovered ? -HOVER_LIFT : 0}px)`,
                transition: `transform 300ms ${LOGO_EASE}, opacity 300ms ${LOGO_EASE}`,
              }}
            >
              <CroppedMark src={logoMark} bbox={ICON_ONLY_BBOX} heightPx={ICON_HEIGHT} alt="AVATR" priority />
            </span>
            <span
              className="absolute left-1/2"
              style={{
                top: WORDMARK_CENTER_Y,
                transform: `translate(-50%, -50%) translateY(${hovered ? -HOVER_LIFT : 0}px) scale(${
                  hovered ? 1 : WORDMARK_REST_SCALE
                })`,
                transition: `transform 300ms ${LOGO_EASE}`,
              }}
            >
              <CroppedMark src={wordmark} bbox={WORDMARK_BBOX} heightPx={WORDMARK_HOVER_HEIGHT} alt="" />
            </span>
          </span>
        </Link>

        {/* Right: the corporate links, then the existing search + language. */}
        <div className="flex items-center gap-8">
          <nav aria-label="Site" className="hidden md:flex items-center gap-8">
            {SITE_LINKS.map((link) => (
              <NavEntry key={link.label} item={link} pathname={pathname} className={NAV_CLASS} />
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button type="button" aria-label="Search" className="text-white/80 hover:text-white">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <span className="hidden md:inline text-label text-white/80">EN</span>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 top-0 flex flex-col items-center justify-center gap-8 bg-black transition-opacity duration-300 ease-in-out md:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {[...MODEL_LINKS, ...SITE_LINKS].map((link) => (
          <NavEntry
            key={link.label}
            item={link}
            pathname={pathname}
            onClick={() => setMenuOpen(false)}
            className="text-2xl font-light tracking-wide text-white/90 transition-colors hover:text-white"
          />
        ))}
      </div>
    </header>
  );
}
