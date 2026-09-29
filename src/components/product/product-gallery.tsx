import Image from "next/image";

// Mobile: full-width swipeable strip. From lg: the first image full width,
// the remaining detail shots two-up beneath it.
export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  return (
    <div
      role="region"
      aria-label="Product images"
      tabIndex={0}
      className="bleed flex snap-x snap-mandatory scroll-px-gutter gap-1 overflow-x-auto px-gutter [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-2 lg:overflow-visible lg:px-0"
    >
      {images.map((src, i) => (
        <div
          key={src}
          className={`media-frame aspect-product w-[88%] shrink-0 snap-start md:w-[60%] lg:w-auto ${
            i === 0 ? "lg:col-span-2" : ""
          }`}
        >
          <Image
            src={src}
            alt={i === 0 ? alt : `${alt}, detail ${i}`}
            fill
            preload={i === 0}
            sizes={i === 0 ? "(min-width: 64rem) 58vw, 88vw" : "(min-width: 64rem) 29vw, 88vw"}
          />
        </div>
      ))}
    </div>
  );
}
