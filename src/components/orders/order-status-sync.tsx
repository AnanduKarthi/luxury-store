"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { clearOrderedItems } from "@/app/bag/actions";
import type { OrderStatus } from "@/lib/orders";

const POLL_MS = 3000;
const MAX_POLLS = 20;

// On the success page: once the order is paid, take its pieces out of the
// bag; while payment is still being confirmed, re-render the page until the
// webhook (or the page's own check with Stripe) settles it.
export function OrderStatusSync({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();

  useEffect(() => {
    if (status === "paid") {
      clearOrderedItems(orderId).catch(() => {});
      return;
    }
    if (status !== "pending") return;
    let polls = 0;
    const timer = setInterval(() => {
      if (++polls > MAX_POLLS) clearInterval(timer);
      else router.refresh();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [orderId, status, router]);

  return null;
}
