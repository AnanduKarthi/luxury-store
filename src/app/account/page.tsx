import type { Metadata } from "next";
import Link from "next/link";
import { DetailList, memberSince } from "@/components/account/detail-list";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My account | Luxury Store",
  robots: { index: false },
};

export default async function AccountPage() {
  const { user } = await requireSession("/account");

  return (
    <div className="flex flex-col gap-12">
      <section aria-labelledby="account-details-heading">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="account-details-heading" className="type-title-s">
            Account details
          </h2>
          <Link href="/account/details" className="type-cta link-underline">
            Edit
          </Link>
        </div>
        <DetailList
          items={[
            { label: "Name", value: user.name },
            { label: "Email", value: user.email },
          ]}
        />
      </section>

      <section aria-labelledby="membership-heading">
        <h2 id="membership-heading" className="type-title-s mb-4">
          Membership
        </h2>
        <DetailList items={[{ label: "Member since", value: memberSince.format(user.createdAt) }]} />
      </section>
    </div>
  );
}
