import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="container-page section-y flex flex-1 flex-col items-center justify-center text-center">
      <p className="type-caption mb-3 text-muted">404</p>
      <h1 className="type-title-l mb-4">Product not found</h1>
      <p className="mb-8 max-w-prose text-muted">
        This piece may no longer be available, or the link may be incorrect.
      </p>
      <Link href="/" className="btn btn-primary">
        Continue shopping
      </Link>
    </main>
  );
}
