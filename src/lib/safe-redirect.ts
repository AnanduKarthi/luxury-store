// Post-auth redirect targets come from the `next` query param, so only
// same-origin paths are allowed ("/account", not "//evil.com" or "https://…").
export function safeRedirectPath(next: unknown, fallback = "/account") {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
