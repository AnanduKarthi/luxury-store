"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { addToBag } from "@/app/bag/actions";
import { Spinner } from "@/components/ui/spinner";

type Status = { kind: "idle" } | { kind: "added" } | { kind: "error"; message: string };

export function AddToBagButton({ productId }: { productId: string }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function add() {
    startTransition(async () => {
      try {
        const result = await addToBag(productId);
        setStatus(result.ok ? { kind: "added" } : { kind: "error", message: result.error });
      } catch {
        setStatus({ kind: "error", message: "We couldn’t add this piece. Please try again." });
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={add}
        disabled={pending}
        aria-describedby="add-to-bag-status"
        className="btn btn-primary flex-1"
      >
        {pending && <Spinner />}
        {pending ? "Adding…" : "Add to bag"}
      </button>
      {/* Rendered outside the button row by the parent's layout (order-last). */}
      <p id="add-to-bag-status" role="status" className="type-body order-last w-full">
        {status.kind === "added" && (
          <>
            Added to your bag.{" "}
            <Link href="/bag" className="link-underline">
              View bag
            </Link>
          </>
        )}
        {status.kind === "error" && <span className="text-error">{status.message}</span>}
      </p>
    </>
  );
}
