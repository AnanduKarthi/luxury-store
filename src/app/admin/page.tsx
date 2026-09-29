import type { Metadata } from "next";
import Link from "next/link";
import { StockForm } from "@/components/admin/stock-form";
import { getStockLevels } from "@/db/queries/admin";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin | Luxury Store",
  robots: { index: false },
};

export default async function AdminPage() {
  const { user } = await requireAdmin();
  const items = await getStockLevels();

  return (
    <main className="container-page section-y flex-1">
      <div className="mx-auto max-w-3xl">
        <p className="type-caption mb-3 text-muted">Signed in as {user.email}</p>
        <h1 className="type-title-l mb-3">Stock</h1>
        <p className="type-body mb-10 text-muted">
          Quantities available to sell. Pieces held by a checkout in progress are already
          deducted and return automatically if it isn’t paid.
        </p>
        <table className="w-full">
          <thead className="type-caption text-left text-muted">
            <tr className="border-b border-divider">
              <th scope="col" className="py-3 font-normal">Product</th>
              <th scope="col" className="py-3 text-right font-normal">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-divider">
                <td className="type-body py-3 pr-4">
                  <Link href={`/products/${item.slug}`} className="link-subtle">
                    {item.name}
                  </Link>
                </td>
                <td className="py-3">
                  <StockForm productId={item.id} productName={item.name} quantity={item.quantity} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
