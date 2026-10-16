import Image from "next/image";
import heroImage from "../Landing page/landing page visual.webp";

// Image hero with a single line of copy at the bottom centre. The source is 6336x2688 (wider than any viewport), so `object-cover` is height-driven on
// desktop: the painted photo is ~2.36x the box height wide, which is what `sizes` has to describe.
//
// From `md` up the photo sits in a box inset 5% top and bottom (its dark sky / floor edges feather into the black
// section), which zooms the scene out slightly so both cars keep comfortable space either side. The two cars
// span source x 1131-5348, i.e. their centre is 71px right of the image centre; shifting the image left by that
// much (2.4svh at this scale) centres the pair, so the left and right margins match at any desktop aspect ratio.
export default function Hero() {
  return (
    <section className="relative h-svh w-full overflow-hidden bg-black">
      <div
        className="absolute inset-0 md:inset-y-[5%] md:[mask-image:linear-gradient(to_bottom,transparent,#000_9%,#000_91%,transparent)]"
      >
        <Image
          src={heroImage}
          alt="AVATR 07"
          fill
          priority
          quality={95}
          sizes="max(100vw, 212vh)"
          className="object-cover object-[70%_center] md:object-[calc(50%_-_2.4svh)_center]"
        />
      </div>

      {/* Very soft shade beneath the copy so it stays readable on the lighter floor reflections. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/45 via-black/15 to-transparent"
      />

      <h1 className="absolute inset-x-0 bottom-[clamp(2.25rem,7.5svh,6rem)] mx-auto max-w-[min(90%,34rem)] text-balance pl-[calc(0.5rem+0.16em)] pr-2 text-center text-[clamp(1.125rem,1.7vw,2.125rem)] font-light uppercase leading-[1.35] tracking-[0.16em] text-white md:max-w-none md:whitespace-nowrap">
        Welcome to a New Horizon of Perfection
      </h1>
    </section>
  );
}
