import { redirect } from "next/navigation";
import { getOrderBySessionForUser } from "@/db/queries/orders";
import { cancelCheckout } from "@/lib/checkout";
import { getSession } from "@/lib/session";

// Stripe's cancel_url: the customer backed out of Checkout. End the session
// now so the pieces go back on sale instead of waiting for it to expire.
// Only the customer's own pending order is touched; anything else, or any
// failure, just goes back to the bag and the expiry webhook tidies up.
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  const auth = await getSession();

  if (auth && sessionId?.startsWith("cs_")) {
    try {
      const order = await getOrderBySessionForUser(sessionId, auth.user.id);
      if (order?.status === "pending") await cancelCheckout(order);
    } catch (error) {
      console.error(`[checkout] cancel failed for session ${sessionId}`, error);
    }
  }
  redirect("/bag?checkout=cancelled");
}
