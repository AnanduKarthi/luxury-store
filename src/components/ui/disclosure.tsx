import type { ReactNode } from "react";
import { PlusIcon } from "@/components/icons";

// Native <details> accordion row with a hairline divider.
export function Disclosure({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="group border-b border-divider" open={defaultOpen}>
      <summary className="type-cta flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
        {title}
        <PlusIcon
          width={16}
          height={16}
          className="transition-transform duration-500 group-open:rotate-45"
        />
      </summary>
      <div className="pb-6 text-muted">{children}</div>
    </details>
  );
}
