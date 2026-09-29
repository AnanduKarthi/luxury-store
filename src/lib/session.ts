import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

// The authoritative auth checks. Every protected page and server action calls
// one of these; src/proxy.ts only does a cheap cookie-presence redirect.

// Validated against the session table on every request (no cookie cache).
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export async function requireSession(returnTo: string) {
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  return session;
}

// Signed-out users go to sign-in; signed-in non-admins get a 404 so the admin
// area isn't advertised.
export async function requireAdmin(returnTo = "/admin") {
  const session = await requireSession(returnTo);
  if (session.user.role !== "admin") notFound();
  return session;
}
