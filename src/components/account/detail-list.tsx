// Label/value rows between hairlines, used across the account pages.
export function DetailList({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="flex flex-col divide-y divide-divider border-y border-divider">
      {items.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-1 py-4 md:flex-row md:justify-between md:gap-6">
          <dt className="type-caption text-muted">{label}</dt>
          <dd className="type-body break-words md:text-right">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export const memberSince = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
