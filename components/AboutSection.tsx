import Image from "next/image";
import aboutImage from "../Landing page/About us.webp";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative w-full scroll-mt-14 aspect-[3/4] sm:aspect-[16/10] md:scroll-mt-[72px] md:aspect-video overflow-hidden bg-black"
    >
      <Image
        src={aboutImage}
        alt="AVATR interior — emotional intelligence, motion in delight"
        fill
        className="object-cover"
        sizes="100vw"
      />

      {/* Cinematic overlay: a soft top-to-bottom shade plus a centre-focused pool of darkness behind the text. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 62% 48% at 50% 50%, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.08) 38%, rgba(0,0,0,0.1) 62%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <span className="text-[clamp(0.8125rem,1.05vw,1.25rem)] leading-none tracking-[0.34em] text-white/85">
          AVATR
        </span>
        <h2 className="mt-[clamp(0.875rem,1.5vw,1.75rem)] max-w-[min(92%,22ch)] text-balance text-[clamp(1.75rem,3.7vw,4.25rem)] font-normal uppercase leading-[1.12] tracking-[0.02em] text-white">
          Emotional Intelligence, Motion in Delight
        </h2>
        <a
          href="#"
          className="mt-[clamp(1.125rem,2vw,2.25rem)] text-[clamp(0.9375rem,1.1vw,1.3125rem)] leading-none tracking-wide text-white/90 transition-colors hover:text-white"
        >
          About us &gt;
        </a>
        <p className="mt-[clamp(1.75rem,3.6vw,4.25rem)] max-w-[min(92%,44rem)] text-balance text-[clamp(0.875rem,1.05vw,1.25rem)] leading-[1.6] tracking-[0.01em] text-white/80">
          With forward-looking design and warm technology, it continuously creates
          future-leading travel experiences for users.
        </p>
      </div>
    </section>
  );
}
