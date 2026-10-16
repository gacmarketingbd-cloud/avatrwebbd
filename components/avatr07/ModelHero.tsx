import Image from "next/image";
import hero from "../../avatr 07 page/07 page hero image.webp";

export default function ModelHero() {
  return (
    <section className="relative h-svh w-full overflow-hidden bg-black">
      <Image
        src={hero}
        alt="AVATR 07 on a coastal plaza"
        fill
        priority
        quality={100}
        sizes="100vw"
        className="object-cover object-[38%_center] md:object-center"
      />

      {/* Top scrim so the fixed header stays legible: strongest at the very
          top, gone by ~22% of the hero height. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[22%]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.28) 40%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0) 100%)",
        }}
      />
    </section>
  );
}
