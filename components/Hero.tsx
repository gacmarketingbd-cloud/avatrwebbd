import Image from "next/image";
import heroImage from "../Landing page/avatr 07 landing page hero image.webp";

export default function Hero() {
  return (
    <section className="relative h-svh w-full overflow-hidden bg-black">
      <Image
        src={heroImage}
        alt="AVATR 07"
        fill
        priority
        quality={95}
        sizes="100vw"
        className="object-cover object-[35%_center] md:object-center"
      />

      <div className="pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/40 to-transparent sm:w-1/2" />

      <div className="absolute inset-x-0 top-[38%] px-4 sm:px-8 md:px-14">
        <div className="max-w-sm sm:max-w-md md:max-w-lg">
          <h1 className="text-h1 md:text-h1-lg font-light tracking-wide text-white">
            AVATR 07
          </h1>
          <p className="mt-2 text-tagline text-white/80">
            Intelligent Electric SUV
          </p>
          <button
            type="button"
            className="mt-5 rounded-full bg-white px-7 py-3 text-btn text-black hover:bg-white/90 transition-colors md:px-8 md:py-3.5"
          >
            Find More
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 h-px w-32 -translate-x-1/2 bg-white/30 sm:bottom-8" />
    </section>
  );
}
