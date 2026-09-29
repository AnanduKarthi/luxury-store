import { getStockStatus } from "@/lib/catalog";

const styles = {
  "in-stock": { dot: "bg-success", text: "text-success", label: () => "In stock" },
  "low-stock": {
    dot: "bg-warning",
    text: "text-warning",
    label: (stock: number) => `Only ${stock} left`,
  },
  "sold-out": { dot: "bg-muted", text: "text-muted", label: () => "Sold out" },
} as const;

export function StockStatus({ stock }: { stock: number }) {
  const style = styles[getStockStatus(stock)];
  return (
    <p className={`type-body inline-flex items-center gap-2 ${style.text}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${style.dot}`} />
      {style.label(stock)}
    </p>
  );
}
