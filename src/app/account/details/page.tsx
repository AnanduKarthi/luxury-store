import type { Metadata } from "next";
import { NameForm } from "@/components/account/name-form";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account details | Luxury Store",
  robots: { index: false },
};

export default async function AccountDetailsPage() {
  const { user } = await requireSession("/account/details");

  return (
    <section aria-labelledby="details-heading">
      <h2 id="details-heading" className="type-title-s mb-2">
        Account details
      </h2>
      <p className="type-body mb-8 text-muted">Update the name we use for your account.</p>

      <NameForm name={user.name} />

      <div className="mt-10 flex flex-col gap-2">
        <p className="type-caption text-muted">Email</p>
        <p className="type-body-l border-b border-divider py-3 break-words">{user.email}</p>
        <p className="type-body text-muted">You sign in with this email. It can’t be changed here.</p>
      </div>
    </section>
  );
}
