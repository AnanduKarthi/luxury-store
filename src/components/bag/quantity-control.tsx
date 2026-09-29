import { MinusIcon, PlusIcon } from "@/components/icons";

// − qty + stepper. The parent owns pending state and the server call.
export function QuantityControl({
  label,
  quantity,
  max,
  disabled,
  onChange,
}: {
  label: string; // product name, for the button labels
  quantity: number;
  max: number;
  disabled: boolean;
  onChange: (quantity: number) => void;
}) {
  return (
    <div
      role="group"
      aria-label={`Quantity of ${label}`}
      className="inline-flex items-center border border-divider-strong"
    >
      <button
        type="button"
        className="btn-icon rounded-none disabled:cursor-not-allowed disabled:text-muted"
        aria-label={`Decrease quantity of ${label}`}
        disabled={disabled || quantity <= 1}
        onClick={() => onChange(quantity - 1)}
      >
        <MinusIcon width={16} height={16} />
      </button>
      <output aria-live="polite" className="type-body w-8 text-center tabular-nums">
        {quantity}
      </output>
      <button
        type="button"
        className="btn-icon rounded-none disabled:cursor-not-allowed disabled:text-muted"
        aria-label={`Increase quantity of ${label}`}
        disabled={disabled || quantity >= max}
        onClick={() => onChange(quantity + 1)}
      >
        <PlusIcon width={16} height={16} />
      </button>
    </div>
  );
}
