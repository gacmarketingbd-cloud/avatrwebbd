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
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Runs before the first paint: flags a page that is still loading so the animated sections stay unpainted until
            their motion code has armed them (see MotionReady). Not set under reduced motion (nothing animates then);
            the timer is a failsafe so a failed or very slow script can never leave them hidden. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('motion-pending');setTimeout(function(){d.classList.remove('motion-pending')},10000)}}catch(e){}",
          }}
        />
      </head>
      <body className={`${avatrFont.variable} font-avatr antialiased`}>
        <RouteScrollReset />
        {children}
      </body>
    </html>
  );
}
