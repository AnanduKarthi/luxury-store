"use client";

import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { removeFromBag, setQuantity, type BagActionResult } from "@/app/bag/actions";
import { StockStatus } from "@/components/product/stock-status";
import { formatPrice, getStockStatus } from "@/lib/catalog";
import { MAX_LINE_QUANTITY, type BagLine as Line } from "@/lib/cart";
import { QuantityControl } from "./quantity-control";

export function BagLine({ line }: { line: Line }) {
  const { product, status, available } = line;
  const [pending, startTransition] = useTransition();
  const [quantity, setOptimisticQuantity] = useOptimistic(line.quantity);
  const [message, setMessage] = useState<{ tone: "error" | "warning"; text: string } | null>(
    null,
  );
  const href = `/products/${product.slug}`;
  const soldOut = status === "sold-out";

  function run(action: () => Promise<BagActionResult>) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.ok) setMessage({ tone: "error", text: result.error });
        else if (result.adjusted) setMessage({ tone: "warning", text: result.adjusted });
      } catch {
        setMessage({ tone: "error", text: "Something went wrong. Please try again." });
      }
    });
  }

  function changeQuantity(next: number) {
    run(async () => {
      setOptimisticQuantity(next);
      return setQuantity(product.id, next);
    });
  }

  return (
    <li
      aria-busy={pending}
      className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 border-b border-divider py-6 md:grid-cols-[8rem_minmax(0,1fr)] md:gap-6"
    >
      <Link href={href} tabIndex={-1} aria-hidden="true" className="media-frame aspect-product">
        <Image
          src={product.images[0]}
          alt=""
          fill
          sizes="(min-width: 48rem) 8rem, 6rem"
          className={soldOut ? "opacity-50" : undefined}
        />
      </Link>

      <div className="flex min-w-0 flex-col">
        <div className="flex justify-between gap-4">
          <div className="min-w-0">
            <p className="type-caption mb-1 text-muted">{product.productType}</p>
            <h2 className="type-body-strong">
              <Link href={href} className="link-subtle">
                {product.name}
              </Link>
            </h2>
            <p className="type-body text-muted">Colour: {product.colour}</p>
          </div>
          <div className="type-body shrink-0 text-right">
            {soldOut ? (
              <p className="text-muted line-through">{formatPrice(product.priceCents)}</p>
            ) : (
              <p>{formatPrice(line.lineTotalCents)}</p>
            )}
            {!soldOut && quantity > 1 && (
              <p className="text-muted">{formatPrice(product.priceCents)} each</p>
            )}
          </div>
        </div>

        <div className="mt-3">
          {status === "sold-out" ? (
            <p className="type-body text-error">Sold out. Remove it to continue.</p>
          ) : status === "reduced" ? (
            <p className="type-body text-warning">
              Only {available} available, so we’ve updated your quantity.
            </p>
          ) : getStockStatus(product.stock) === "low-stock" ? (
            <StockStatus stock={product.stock} />
          ) : quantity >= MAX_LINE_QUANTITY ? (
            <p className="type-body text-muted">Limit of {MAX_LINE_QUANTITY} per piece.</p>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          {soldOut ? (
            <span />
          ) : (
            <QuantityControl
              label={product.name}
              quantity={quantity}
              max={available}
              disabled={pending}
              onChange={changeQuantity}
            />
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => removeFromBag(product.id))}
            className="type-cta link-underline cursor-pointer disabled:cursor-not-allowed disabled:text-muted"
          >
            Remove<span className="sr-only"> {product.name}</span>
          </button>
        </div>

        <p role="status" className="type-body mt-2 empty:mt-0">
          {message && (
            <span className={message.tone === "error" ? "text-error" : "text-warning"}>
              {message.text}
            </span>
          )}
        </p>
      </div>
    </li>
  );
}
