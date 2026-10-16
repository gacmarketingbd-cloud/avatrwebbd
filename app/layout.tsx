import type { Metadata } from "next";
import { avatrFont } from "./fonts";
import "./globals.css";
import RouteScrollReset from "@/components/RouteScrollReset";

export const metadata: Metadata = {
  title: "AVATR Bangladesh",
  description: "AVATR 07 and AVATR 11 — Intelligent electric vehicles in Bangladesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${avatrFont.variable} font-avatr antialiased`}>
        <RouteScrollReset />
        {children}
      </body>
    </html>
  );
}
