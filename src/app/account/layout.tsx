import { AccountNav } from "@/components/account/account-nav";
import { requireSession } from "@/lib/session";

// Shared shell for /account/*. The session here only feeds the greeting and
// nav; each page still calls requireSession itself, because layouts don't
// re-render on client navigation.
export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const { user } = await requireSession("/account");
  const firstName = user.name.trim().split(/\s+/)[0];

  return (
    <main className="container-page section-y flex-1">
      <header className="mb-6 lg:mb-12">
        <p className="type-caption mb-2 text-muted">My account</p>
        <h1 className="type-title-l">Hello, {firstName}</h1>
      </header>
      <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
        <AccountNav isAdmin={user.role === "admin"} />
        <div className="max-w-prose min-w-0">{children}</div>
      </div>
    </main>
  );
}
