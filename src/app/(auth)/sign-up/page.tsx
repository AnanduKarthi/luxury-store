import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create account | Luxury Store",
  robots: { index: false },
};

export default async function SignUpPage(props: PageProps<"/sign-up">) {
  const { next: rawNext } = await props.searchParams;
  const next = safeRedirectPath(rawNext);
  if (await getSession()) redirect(next);

  return (
    <main className="container-page section-y flex flex-1 justify-center">
      <div className="w-full max-w-form">
        <h1 className="type-title-l mb-3 text-center">Create an account</h1>
        <p className="type-body mb-10 text-center text-muted">Create an account to manage your details.</p>
        <AuthForm mode="sign-up" next={next} />
        <p className="type-body mt-8 border-t border-divider pt-8 text-center text-muted">
          Already have an account?{" "}
          <Link
            href={`/sign-in?next=${encodeURIComponent(next)}`}
            className="link-underline text-foreground"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
