import Image from "next/image";
import Link from "next/link";
import { heroImages } from "@/lib/site-content";

export function Hero() {
  return (
    <section className="relative h-[82svh] min-h-[32rem] lg:h-[calc(100svh-8rem)] lg:min-h-[40rem]">
      <div className="grid h-full md:grid-cols-2">
        <div className="media-frame">
          <Image
            src={heroImages.primary}
            alt="Model in a belted camel coat on stone steps"
            fill
            preload
            sizes="(min-width: 48rem) 50vw, 100vw"
            className="object-[center_20%]"
          />
        </div>
        <div className="media-frame hidden md:block">
          <Image
            src={heroImages.secondary}
            alt="Model in a long pale-blue coat in a cathedral square"
            fill
            sizes="50vw"
            className="object-[center_30%]"
          />
        </div>
      </div>

      <div className="on-image absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 via-black/20 to-transparent">
        <div className="container-page flex flex-col items-center pt-32 pb-10 text-center lg:pb-16">
          <p className="type-caption mb-3">Autumn–Winter 2026</p>
          <h1 className="type-display mb-8">The Quiet Season</h1>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link href="/collections/women" className="btn btn-secondary">
              Shop Women
            </Link>
            <Link href="/collections/men" className="btn btn-secondary">
              Shop Men
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
