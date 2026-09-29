import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 lg:mb-10">
      <div>
        {eyebrow && <p className="type-caption mb-2 text-muted">{eyebrow}</p>}
        <h2 className="type-title-l">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="type-cta link-underline shrink-0">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
