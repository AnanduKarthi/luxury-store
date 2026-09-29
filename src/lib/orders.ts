// Order types and pure helpers. No database imports here, so any component
// can use it.

export type OrderStatus = "pending" | "paid" | "expired" | "failed" | "needs_review";

export type OrderShipping = {
  name: string | null;
  phone: string | null;
  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  } | null;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Awaiting payment",
  paid: "Confirmed",
  expired: "Cancelled",
  failed: "Payment failed",
  needs_review: "Under review",
};

export const formatOrderNumber = (number: number) => `LS-${number}`;

// How long checkout holds stock. Stripe's minimum Checkout Session lifetime.
export const RESERVATION_MINUTES = 30;
