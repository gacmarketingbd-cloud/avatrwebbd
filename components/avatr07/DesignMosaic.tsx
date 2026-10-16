"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import front from "../../avatr 07 page/front image.webp";
import rear from "../../avatr 07 page/rear image.webp";
import mirror from "../../avatr 07 page/FHD Electronic Exterior Mirrors.webp";
import { u } from "./scale";
import { initMosaicCaptions } from "./captionMotion";

// Desktop: large front image on the left, rear + mirror stacked on the right,
// 14px gutters. Mobile: front image full width, rear and mirror side by side.
// NOTE on `sizes` for the front image: the tile is a tall crop of a 16:9 photo
// (object-cover), so the photo is painted ~1.0x the viewport width on desktop and
// ~2.2-2.4x the tile width on mobile. `sizes` must describe the painted width of
// the photo, not the tile, or the browser downloads a file that gets upscaled.
// Bottom-left caption + scrim for the two right-hand tiles. Same treatment as the
// front-face caption (white text, black scrim strongest at the bottom, fading up to
// nothing); the scrim is a fixed ~200px band (about 45% of these tiles), so it never
// darkens the whole image. On phones these tiles are stacked full-width (like the front tile), so
// the type/padding minimums match the front-face caption exactly.
function TileCaption({ title, line }: { title: string; line?: string }) {
  // The text block is overflow-hidden and ends at the image edge, so on reveal the lines rise out of
  // the lower edge of the image (see captionMotion.ts). Layout is identical to the unclipped version.
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0"
        style={{
          height: u(200, 150),
          background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 overflow-hidden text-white"
        style={{ padding: `0 ${u(32, 20)} ${u(28, 20)}` }}
      >
        <h3 className="font-normal" style={{ fontSize: u(22, 16), lineHeight: 1.3 }}>
          <span data-fx="cap-inner" className="block">
            {title}
          </span>
        </h3>
        {line && (
          <p className="font-normal" style={{ marginTop: u(12, 5), fontSize: u(17, 12.5), lineHeight: 1.3 }}>
            <span data-fx="cap-inner" className="block">
              {line}
            </span>
          </p>
        )}
      </div>
    </>
  );
}

export default function DesignMosaic() {
  const ref = useRef<HTMLElement>(null);

  // Caption text only: rises out of each image's lower edge as that image enters the viewport, in the
  // order rear -> front -> mirror. Skipped under prefers-reduced-motion (captions simply shown).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return initMosaicCaptions(el);
  }, []);

  return (
    <section
      ref={ref}
      // Desktop height: 46.6vw (≈895px at 1920, vs the master's 1080) but never taller than
      // the viewport minus the 72px header, so images + caption fit in one view.
      className="grid grid-cols-2 bg-white md:h-[min(46.6vw,calc(100svh-72px))] md:grid-cols-[1125fr_781fr] md:grid-rows-2"
      style={{ gap: u(14, 4) }}
    >
      <figure data-tile="front" className="relative col-span-2 aspect-[4/5] overflow-hidden sm:aspect-[4/3] md:col-span-1 md:row-span-2 md:aspect-auto">
        <Image
          src={front}
          alt="AVATR 07 front face"
          fill
          quality={100}
          sizes="(min-width: 768px) 100vw, (min-width: 640px) 240vw, 225vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 34%)" }}
        />
        <figcaption
          className="absolute bottom-0 left-0 right-0 overflow-hidden text-white"
          style={{ padding: `0 ${u(32, 20)} ${u(28, 20)}` }}
        >
          <h3 className="font-normal" style={{ fontSize: u(22, 16), lineHeight: 1.3 }}>
            <span data-fx="cap-inner" className="block">
              The UFO-Inspired Front Face
            </span>
          </h3>
          <p className="font-normal" style={{ marginTop: u(12, 5), fontSize: u(17, 12.5), lineHeight: 1.3 }}>
            <span data-fx="cap-inner" className="block">
              Signature F-shaped curved light cluster 280-LED Star-Trail daytime running lights
            </span>
          </p>
        </figcaption>
      </figure>

      {/* Below md the two small tiles stack full-width (desktop/tablet keep the 2-column mosaic). */}
      <div data-tile="rear" className="relative col-span-2 aspect-[781/533] md:col-span-1 md:aspect-auto">
        <Image
          src={rear}
          alt="AVATR 07 rear"
          fill
          quality={100}
          sizes="(min-width: 768px) 41vw, 100vw"
          className="object-cover"
        />
        <TileCaption title="LED Star-Ring Taillights" line="Sleek design with refined elegance" />
      </div>
      <div data-tile="mirror" className="relative col-span-2 aspect-[781/533] md:col-span-1 md:aspect-auto">
        <Image
          src={mirror}
          alt="AVATR 07 FHD electronic exterior mirror"
          fill
          quality={100}
          sizes="(min-width: 768px) 41vw, 100vw"
          className="object-cover object-[31%_50%]"
        />
        <TileCaption
          title="FHD Electronic Exterior Mirrors"
          line="Wind-blade design reduces drag by 0.009Cd, while doubling rearview visibility for a clear view even in darkness and heavy rain."
        />
      </div>
    </section>
  );
}
