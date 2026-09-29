import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in | Luxury Store",
  robots: { index: false },
};

export default async function SignInPage(props: PageProps<"/sign-in">) {
  const { next: rawNext } = await props.searchParams;
  const next = safeRedirectPath(rawNext);
  if (await getSession()) redirect(next);

  return (
    <main className="container-page section-y flex flex-1 justify-center">
      <div className="w-full max-w-form">
        <h1 className="type-title-l mb-3 text-center">Welcome back</h1>
        <p className="type-body mb-10 text-center text-muted">Sign in to your Luxury Store account.</p>
        <AuthForm mode="sign-in" next={next} />
        <p className="type-body mt-8 border-t border-divider pt-8 text-center text-muted">
          New to Luxury Store?{" "}
          <Link
            href={`/sign-up?next=${encodeURIComponent(next)}`}
            className="link-underline text-foreground"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
