"use client";

import { useActionState, useEffect, useState } from "react";
import { startCheckout, type CheckoutState } from "@/app/checkout/actions";
import { Spinner } from "@/components/ui/spinner";

// Submits nothing but the click: the server rebuilds the order from the bag
// cookie and current prices, then redirects to Stripe Checkout.
export function CheckoutButton({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState<CheckoutState>(startCheckout, {});
  // A successful submit redirects to Stripe without returning a new state, and
  // the form stops pending before the browser has left. So "the state is still
  // the one we submitted with" means we're on our way to Stripe.
  const [submittedWith, setSubmittedWith] = useState<CheckoutState | null>(null);
  const redirecting = !pending && submittedWith === state;
  const busy = pending || redirecting;

  // Coming back with the browser's Back button restores the page from cache,
  // mid-redirect; start fresh.
  useEffect(() => {
    const reset = (event: PageTransitionEvent) => {
      if (event.persisted) setSubmittedWith(null);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  return (
    <form action={action} onSubmit={() => setSubmittedWith(state)} className="mt-6">
      <button
        type="submit"
        disabled={disabled || busy}
        aria-describedby="checkout-status"
        className="btn btn-primary w-full"
      >
        {busy && <Spinner />}
        {pending ? "Reserving your pieces…" : redirecting ? "Opening secure checkout…" : "Checkout"}
      </button>
      <div id="checkout-status" role="status" aria-live="polite" className="type-body">
        {/* When disabled, the summary already says why (e.g. a line sold out). */}
        {state.error && !busy && !disabled && (
          <p className="mt-4 border-l-2 border-error pl-3 text-error">{state.error}</p>
        )}
      </div>
    </form>
  );
}
