"use client";

import { useActionState } from "react";
import { updateStockAction, type StockFormState } from "@/app/admin/actions";

export function StockForm({ productId, productName, quantity }: {
  productId: string;
  productName: string;
  quantity: number;
}) {
  const [state, action, pending] = useActionState<StockFormState, FormData>(
    updateStockAction,
    {},
  );
  const inputId = `stock-${productId}`;

  return (
    <form action={action} className="flex items-center justify-end gap-3">
      <input type="hidden" name="productId" value={productId} />
      <label htmlFor={inputId} className="sr-only">
        Stock for {productName}
      </label>
      <input
        id={inputId}
        name="quantity"
        type="number"
        min={0}
        max={100000}
        step={1}
        required
        defaultValue={quantity}
        className="type-body w-20 border-b border-divider-strong bg-transparent py-2 text-right outline-none focus:border-foreground"
      />
      <button type="submit" disabled={pending} className="btn btn-secondary">
        Save
      </button>
      <span role="status" className="type-caption w-16">
        {state.error ? (
          <span className="text-error">{state.error}</span>
        ) : state.saved ? (
          <span className="text-success">Saved</span>
        ) : null}
      </span>
    </form>
  );
}
