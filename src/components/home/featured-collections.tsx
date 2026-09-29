import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { collections } from "@/lib/site-content";
import { SectionHeading } from "./section-heading";

export function FeaturedCollections() {
  return (
    <section className="container-page section-y">
      <SectionHeading eyebrow="Explore" title="The Collections" />
      <ul className="grid grid-cols-2 gap-x-1 gap-y-8 md:gap-x-2 lg:grid-cols-4">
        {collections.map((collection) => (
          <li key={collection.slug}>
            <Link href={`/collections/${collection.slug}`} className="group block">
              <div className="media-frame aspect-portrait">
                <Image
                  src={collection.image}
                  alt=""
                  fill
                  sizes="(min-width: 64rem) 25vw, 50vw"
                  className="transition-transform duration-(--animate-duration-slow) group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-center justify-between gap-2 px-1 pt-3 md:px-0">
                <h3 className="type-title-s">{collection.title}</h3>
                <ArrowRightIcon className="shrink-0 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
