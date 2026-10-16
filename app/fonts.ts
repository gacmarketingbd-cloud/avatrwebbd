import localFont from "next/font/local";

export const avatrFont = localFont({
  src: [
    {
      path: "../AVATRFont/AVATRFont/AVATRFont-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../AVATRFont/AVATRFont/AVATRFont-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../AVATRFont/AVATRFont/AVATRFont-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-avatr",
  display: "swap",
});
