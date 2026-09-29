import type { ComponentProps, ReactNode } from "react";

// Underlined text input with label, inline error and hint.
export type TextFieldProps = ComponentProps<"input"> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
};

export function TextField({
  id: idProp,
  label,
  name,
  error,
  hint,
  trailing,
  className,
  ...props
}: TextFieldProps) {
  const id = idProp ?? `field-${name}`;
  const describedBy = [error && `${id}-error`, hint && !error && `${id}-hint`]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="type-caption text-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`type-body-l w-full border-b bg-transparent py-3 transition-colors outline-none disabled:text-muted ${
            error ? "border-error" : "border-divider-strong focus:border-foreground"
          } ${className ?? ""}`}
          {...props}
        />
        {trailing}
      </div>
      {error ? (
        <p id={`${id}-error`} className="type-body text-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="type-body text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

