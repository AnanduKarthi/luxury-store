"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Spinner } from "@/components/ui/spinner";
import { TextField } from "@/components/ui/text-field";
import { authClient } from "@/lib/auth-client";
import { NAME_MAX } from "@/lib/validation";

function validateName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "Enter your name.";
  if (trimmed.length > NAME_MAX) return `Use ${NAME_MAX} characters or fewer.`;
}

export function NameForm({ name }: { name: string }) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<"idle" | "pending" | "saved" | "failed">("idle");
  const input = useRef<HTMLInputElement>(null);
  const unchanged = value.trim() === name;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "pending" || unchanged) return;
    const nextError = validateName(value);
    setError(nextError);
    if (nextError) {
      input.current?.focus();
      return;
    }

    setStatus("pending");
    let failed: boolean;
    try {
      const { error } = await authClient.updateUser({ name: value.trim() });
      if (error?.code === "INVALID_NAME") {
        setStatus("idle");
        setError(validateName(value) ?? `Use ${NAME_MAX} characters or fewer.`);
        return;
      }
      failed = !!error;
    } catch {
      failed = true;
    }
    if (failed) {
      setStatus("failed");
      return;
    }
    setStatus("saved");
    // Re-render the server components (greeting, overview) with the new name.
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={status === "pending"}>
      <fieldset disabled={status === "pending"} className="flex flex-col gap-6">
        <TextField
          ref={input}
          label="Full name"
          name="name"
          autoComplete="name"
          maxLength={NAME_MAX}
          value={value}
          error={error}
          onChange={(e) => {
            setValue(e.target.value);
            if (status !== "pending") setStatus("idle");
            if (error) setError(validateName(e.target.value));
          }}
          onBlur={() => value !== name && setError(validateName(value))}
        />
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="btn btn-primary btn-block" aria-disabled={unchanged}>
            {status === "pending" && <Spinner />}
            {status === "pending" ? "Saving…" : "Save changes"}
          </button>
          <p role="status" className="type-body">
            {status === "saved" && <span className="text-success">Your details have been saved.</span>}
            {status === "failed" && (
              <span className="text-error">We couldn’t save your changes. Please try again.</span>
            )}
          </p>
        </div>
      </fieldset>
    </form>
  );
}
