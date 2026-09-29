import Stripe from "stripe";

// Server-only. Created on first use so builds don't need Stripe env vars.

let client: Stripe | undefined;

export function getStripe() {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key, { apiVersion: "2026-08-26.dahlia" });
  }
  return client;
}

// Absolute origin for Stripe redirect URLs. From env, never the Host header.
export function siteUrl() {
  const url = process.env.SITE_URL ?? process.env.BETTER_AUTH_URL;
  if (!url) throw new Error("SITE_URL is not set");
  return url.replace(/\/+$/, "");
}

export type CheckoutSession = Stripe.Checkout.Session;
export type StripeEvent = Stripe.Event;
