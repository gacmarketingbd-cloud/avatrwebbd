import Image from "next/image";
import heroImage from "../Landing page/landing page visual.webp";

// Visual-only hero. The source is 6336x2688 (wider than any viewport), so `object-cover` is height-driven on
// desktop: the painted photo is ~2.36x the viewport height wide, which is what `sizes` has to describe.
export default function Hero() {
  return (
    <section className="relative h-svh w-full overflow-hidden bg-black">
      <Image
        src={heroImage}
        alt="AVATR 07"
        fill
        priority
        quality={95}
        sizes="max(100vw, 236vh)"
        className="object-cover object-[70%_center] md:object-center"
      />
    </section>
  );
}
