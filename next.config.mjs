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
  },
};

export default nextConfig;
