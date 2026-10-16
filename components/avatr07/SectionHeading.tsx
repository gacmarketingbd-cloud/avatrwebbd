import { TAN, u } from "./scale";

// Title + hairline (+ optional subtitle) used by Futuristic Design and Luxury
// Experience. The hairline is 750 artboard px wide with a darker centre segment.
export default function SectionHeading({
  title,
  subtitle,
  subtitleSize = 32.9,
  titleSize = 90,
  ruleGap = 29,
  ruleWidth = 750,
  subtitleGap = 37,
}: {
  title: string;
  subtitle?: string;
  subtitleSize?: number;
  titleSize?: number;
  ruleGap?: number;
  ruleWidth?: number;
  subtitleGap?: number;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <h2
        data-fx="title"
        className="font-normal"
        style={{ color: TAN, fontSize: u(titleSize, titleSize > 60 ? 32 : 28), lineHeight: 1.15, letterSpacing: "0.005em" }}
      >
        {title}
      </h2>
      <div
        aria-hidden
        data-fx="rule"
        className="relative"
        style={{ marginTop: u(ruleGap, ruleGap > 20 ? 14 : 10), width: u(ruleWidth, ruleWidth > 500 ? 260 : 200), height: 1, background: "rgba(176,144,120,0.18)" }}
      >
        <span
          className="absolute left-1/2 top-0 h-px -translate-x-1/2"
          style={{ width: u(192, 70), background: TAN }}
        />
      </div>
      {subtitle && (
        <p
          data-fx="subtitle"
          className="font-normal text-[#141414]"
          style={{ marginTop: u(subtitleGap, subtitleGap > 30 ? 18 : 12), fontSize: u(subtitleSize, subtitleSize > 20 ? 15 : 14), lineHeight: 1.4, letterSpacing: "0.01em" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
