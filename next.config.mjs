/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Next 16 coerces an unlisted `quality` down to the nearest allowed
    // value (default allowlist is just [75]) — the hero needs 95 to avoid
    // visible softening on its large cinematic image; 75 stays the default
    // for every other image in the site.
    // 100 is used for the AVATR 07 page, where every supplied image is shown
    // at near-lossless quality (see the image-quality rule in claude.md).
    qualities: [75, 95, 100],
    // One step above Next's default 3840 cap: the landing hero is a 6336px-wide photo painted ~2.4x the viewport
    // height wide, so a 1920x1080 @2x display needs ~5100px to stay crisp. (Finer steps between the defaults were
    // tried and rejected: an image served close to its painted width is measurably softer after the browser
    // downscale than one served a step larger, and image quality outranks the ~1 MB it saved.)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840, 5120],
  },
};

export default nextConfig;
