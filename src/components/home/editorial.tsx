import Image from "next/image";
import Link from "next/link";
import { editorial } from "@/lib/site-content";

export function EditorialSplit() {
  return (
    <section className="bg-subtle">
      <div className="container-page section-y grid-page items-center gap-y-10">
        <div className="media-frame aspect-product col-span-4 md:col-span-6">
          <Image
            src={editorial.image}
            alt="Knitwear in natural tones hanging on a rail"
            fill
            sizes="(min-width: 48rem) 50vw, 100vw"
          />
        </div>
        <div className="col-span-4 md:col-span-5 md:col-start-8">
          <p className="type-caption mb-3 text-muted">The Edit</p>
          <h2 className="type-title-l mb-6">Knitwear, Considered</h2>
          <p className="type-body-l mb-8 max-w-prose">
            Cashmere, alpaca and merino, spun in undyed tones and finished by
            hand. Pieces made to be layered through the colder months and kept
            for many seasons after.
          </p>
          <Link href="/collections/knitwear" className="type-cta link-underline">
            Discover the edit
          </Link>
        </div>
      </div>
    </section>
  );
}

export function CampaignBand() {
  return (
    <section className="relative h-[75svh] min-h-[28rem]">
      <div className="media-frame h-full">
        <Image
          src={editorial.campaign}
          alt="Man in a navy pinstripe suit fastening his jacket"
          fill
          sizes="100vw"
          className="object-[center_35%]"
        />
      </div>
      <div className="on-image absolute inset-0 flex items-end bg-linear-to-r from-black/60 via-black/25 to-transparent">
        <div className="container-page pb-10 lg:pb-16">
          <div className="max-w-md">
            <p className="type-caption mb-3">Made to Measure</p>
            <h2 className="type-display mb-6">The Art of Tailoring</h2>
            <p className="type-body-l mb-8">
              Suits cut to your measurements by our master tailors, ready in
              six weeks.
            </p>
            <Link href="/appointments" className="btn btn-secondary">
              Book an appointment
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
