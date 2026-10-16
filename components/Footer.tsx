import logoMark from "../AVATR_Brand English LOGO_White_RGB.png";
import { CroppedMark } from "./CroppedMark";
import { LOGO_BBOX } from "./logoBbox";

const COLUMNS = [
  {
    title: "Models",
    links: ["AVATR 07", "AVATR 11"],
  },
  {
    title: "Discover",
    links: ["About AVATR", "Design", "Technology"],
  },
  {
    title: "Bangladesh",
    links: ["Book a Test Drive", "Contact Us", "Showroom"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms & Conditions", "Cookie Policy"],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-black/10 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 md:gap-x-12">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-eyebrow tracking-[0.15em] text-black/45">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-nav text-black/75 transition-colors hover:text-black"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-8 border-t border-black/10 pt-8 md:mt-16 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <CroppedMark src={logoMark} bbox={LOGO_BBOX} heightPx={26} alt="AVATR" invert />
            <span className="text-label tracking-wide text-black/60">AVATR Bangladesh</span>
          </div>
        </div>

        <div className="mt-6 space-y-1.5 text-label leading-relaxed text-black/35">
          <p>Authorized Distributor: [Distributor name to be provided]</p>
          <p>© {year} AVATR Bangladesh. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
