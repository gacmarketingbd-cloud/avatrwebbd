import Image, { type StaticImageData } from "next/image";

// Both local logo/wordmark PNGs are 1000x1000 canvases with the actual
// glyph sitting in a small centered region. These are the tight pixel
// bounding boxes of that artwork (measured from alpha channel), used to
// crop out the built-in padding via CSS instead of altering the source
// files.
export type LogoBbox = { x: number; y: number; w: number; h: number };

const CANVAS_SIZE = 1000;

interface CroppedMarkProps {
  src: StaticImageData;
  bbox: LogoBbox;
  heightPx: number;
  alt: string;
  priority?: boolean;
  // Only the white-on-transparent logo/wordmark files are available locally.
  // On a light background there is no dark variant to place instead, so this
  // flips it to black via a CSS filter — the artwork's shape and proportions
  // are untouched, only its color is inverted for contrast.
  invert?: boolean;
}

export function CroppedMark({ src, bbox, heightPx, alt, priority, invert }: CroppedMarkProps) {
  const scale = heightPx / bbox.h;
  const full = Math.round(CANVAS_SIZE * scale);
  const width = Math.round(bbox.w * scale);
  const left = Math.round(bbox.x * scale);
  const top = Math.round(bbox.y * scale);

  return (
    <span className="relative block overflow-hidden" style={{ width, height: heightPx }}>
      <Image
        src={src}
        alt={alt}
        width={full}
        height={full}
        priority={priority}
        className={`absolute max-w-none ${invert ? "invert" : ""}`}
        style={{ width: full, height: full, left: -left, top: -top }}
      />
    </span>
  );
}
