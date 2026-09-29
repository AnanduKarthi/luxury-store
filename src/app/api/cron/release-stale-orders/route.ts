import { createHash, timingSafeEqual } from "node:crypto";
import { getStaleOrders } from "@/db/queries/orders";
import { cancelCheckout } from "@/lib/checkout";

// Safety net for reservations nothing else settled: a missed or failed
// expiry webhook, or a crash between creating the order and its Checkout
// Session. Call on a schedule with `Authorization: Bearer $CRON_SECRET`.
//
// The grace period gives Stripe's own expiry webhook time to arrive first.
// By then any session is past its expires_at, so it can't be paid anymore.
const GRACE_MS = 15 * 60_000;

// Hashing first gives equal-length buffers, so the comparison is constant-time.
const digest = (value: string) => createHash("sha256").update(value).digest();

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization") ?? "";
  if (!secret || !timingSafeEqual(digest(given), digest(`Bearer ${secret}`))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const stale = await getStaleOrders(new Date(Date.now() - GRACE_MS));
  let settled = 0;
  const failed: string[] = [];
  for (const order of stale) {
    try {
      await cancelCheckout(order);
      settled++;
    } catch (error) {
      console.error(`[cron] could not settle order ${order.id}`, error);
      failed.push(order.id);
    }
  }
  return Response.json({ checked: stale.length, settled, failed });
}
