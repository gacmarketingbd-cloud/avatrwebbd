import localFont from "next/font/local";

// The AVATR font, served as WOFF2 subsets (AVATRFont/web/). Each is ~18 KB instead of the ~2.9 MB master TTF in
// AVATRFont/AVATRFont/: every non-CJK glyph, the kerning/tabular/ligature tables and the TrueType hinting are kept,
// only the ~7,000 CJK glyphs this English-only site never shows are dropped. Rendered side by side with the TTFs the
// two are pixel-identical (all three weights, 12-72px, tabular figures, tracking, kerning). Regenerate from the master
// TTFs with harfbuzz subsetting (keep every cmap entry below U+2E80) if a new weight or script is ever needed.
export const avatrFont = localFont({
  src: [
    {
      path: "../AVATRFont/web/AVATRFont-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../AVATRFont/web/AVATRFont-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../AVATRFont/web/AVATRFont-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-avatr",
  display: "swap",
});
