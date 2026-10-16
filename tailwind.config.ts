import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        avatr: ["var(--font-avatr)", "sans-serif"],
      },
      // Shared typography scale — use these across all sections so
      // headings, nav, body and CTA sizing stay consistent site-wide.
      fontSize: {
        nav: ["14px", { lineHeight: "1", letterSpacing: "0.06em" }],
        label: ["13px", { lineHeight: "1", letterSpacing: "0.04em" }],
        body: ["15px", { lineHeight: "1.6", letterSpacing: "0.01em" }],
        tagline: ["16px", { lineHeight: "1.4", letterSpacing: "0.02em" }],
        btn: ["14px", { lineHeight: "1", letterSpacing: "0.03em" }],
        eyebrow: ["13px", { lineHeight: "1", letterSpacing: "0.12em" }],
        h2: ["30px", { lineHeight: "1.15" }],
        "h2-lg": ["44px", { lineHeight: "1.15" }],
        h1: ["42px", { lineHeight: "1.05" }],
        "h1-lg": ["68px", { lineHeight: "1.05" }],
      },
      colors: {
        avatr: {
          black: "#000000",
          white: "#ffffff",
        },
      },
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [],
};

export default config;
