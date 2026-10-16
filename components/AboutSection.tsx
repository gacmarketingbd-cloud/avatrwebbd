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

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/60" />

      <div className="absolute inset-x-0 top-8 flex flex-col items-center px-4 text-center md:top-14">
        <span className="text-eyebrow tracking-[0.3em] text-white/80">AVATR</span>
        <h2 className="mt-2 max-w-3xl text-xl font-bold uppercase tracking-wide text-white md:mt-3 md:text-3xl">
          Emotional Intelligence, Motion in Delight
        </h2>
        <a
          href="#"
          className="mt-3 text-nav tracking-wide text-white/85 hover:text-white transition-colors md:mt-4"
        >
          About us &gt;
        </a>
      </div>

      <p className="absolute inset-x-0 bottom-8 px-4 text-center text-body text-white/80 md:bottom-12">
        With forward-looking design and warm technology, it continuously creates
        future-leading travel experiences for users.
      </p>
    </section>
  );
}
