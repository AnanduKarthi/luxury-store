"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { Spinner } from "@/components/ui/spinner";
import { TextField, type TextFieldProps } from "@/components/ui/text-field";
import { authClient } from "@/lib/auth-client";
import { EMAIL_MAX, NAME_MAX, PASSWORD_MAX, PASSWORD_MIN } from "@/lib/validation";

type Mode = "sign-in" | "sign-up";
type FieldName = "name" | "email" | "password";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;
type AuthError = { status: number; code?: string; message?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const copy = {
  "sign-in": { submit: "Sign in", pending: "Signing in…" },
  "sign-up": { submit: "Create account", pending: "Creating account…" },
};

function validate(mode: Mode, values: Values): Errors {
  const errors: Errors = {};
  if (mode === "sign-up") {
    const name = values.name.trim();
    if (!name) errors.name = "Enter your name.";
    else if (name.length > NAME_MAX) errors.name = `Use ${NAME_MAX} characters or fewer.`;
  }

  const email = values.email.trim();
  if (!email) errors.email = "Enter your email address.";
  else if (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address, like name@example.com.";
  }

  if (!values.password) errors.password = "Enter your password.";
  else if (mode === "sign-up" && values.password.length < PASSWORD_MIN) {
    errors.password = `Use at least ${PASSWORD_MIN} characters.`;
  } else if (values.password.length > PASSWORD_MAX) {
    errors.password = `Use ${PASSWORD_MAX} characters or fewer.`;
  }
  return errors;
}

// Posts to the Better Auth endpoints (/api/auth/*) through the client so the
// built-in rate limiting and origin checks apply.
export function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const router = useRouter();
  const fields: FieldName[] =
    mode === "sign-up" ? ["name", "email", "password"] : ["email", "password"];
  const [values, setValues] = useState<Values>({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  // A field is validated on its first blur, then live as the user types.
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [formError, setFormError] = useState<ReactNode>(null);
  const [pending, setPending] = useState(false);
  const inputs = useRef<Partial<Record<FieldName, HTMLInputElement | null>>>({});

  function update(name: FieldName, value: string) {
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    setFormError(null);
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(mode, nextValues)[name] }));
    }
  }

  function blur(name: FieldName) {
    // Don't flag a field the user tabbed past without typing.
    if (!values[name] && !touched[name]) return;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(mode, values)[name] }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const nextErrors = validate(mode, values);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, password: true });
    const firstInvalid = fields.find((field) => nextErrors[field]);
    if (firstInvalid) {
      inputs.current[firstInvalid]?.focus();
      return;
    }

    setPending(true);
    setFormError(null);
    const email = values.email.trim();
    let error: AuthError | null;
    try {
      ({ error } =
        mode === "sign-in"
          ? await authClient.signIn.email({ email, password: values.password, rememberMe: true })
          : await authClient.signUp.email({
              name: values.name.trim(),
              email,
              password: values.password,
            }));
    } catch {
      error = { status: 0 };
    }

    if (error) {
      setPending(false);
      const { field, message } = describeError(mode, error, next);
      if (field) {
        setErrors((prev) => ({ ...prev, [field]: message }));
        // Wait for the fieldset to re-enable before moving focus.
        requestAnimationFrame(() => inputs.current[field]?.focus());
      } else {
        setFormError(message);
      }
      return;
    }
    // Stay pending until the next page replaces this one. Refresh so server
    // components pick up the new session cookie.
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={pending}>
      <fieldset disabled={pending} className="flex flex-col gap-6">
        {mode === "sign-up" && (
          <TextField
            ref={(el) => {
              inputs.current.name = el;
            }}
            id="auth-name"
            label="Full name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={NAME_MAX}
            value={values.name}
            error={errors.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => blur("name")}
          />
        )}
        <TextField
          ref={(el) => {
            inputs.current.email = el;
          }}
          id="auth-email"
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={EMAIL_MAX}
          value={values.email}
          error={errors.email}
          onChange={(e) => update("email", e.target.value)}
          onBlur={() => blur("email")}
        />
        <PasswordField
          ref={(el) => {
            inputs.current.password = el;
          }}
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          maxLength={PASSWORD_MAX}
          hint={mode === "sign-up" ? `At least ${PASSWORD_MIN} characters.` : undefined}
          value={values.password}
          error={errors.password}
          onChange={(e) => update("password", e.target.value)}
          onBlur={() => blur("password")}
        />

        {/* Always mounted so screen readers announce the message when it appears. */}
        <div role="alert">
          {formError && (
            <p className="type-body border-l-2 border-error pl-3 text-error">{formError}</p>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-full">
          {pending && <Spinner />}
          {pending ? copy[mode].pending : copy[mode].submit}
        </button>
      </fieldset>
    </form>
  );
}

function describeError(
  mode: Mode,
  error: AuthError,
  next: string,
): { field?: never; message: ReactNode } | { field: FieldName; message: string } {
  if (error.status === 0) {
    return { message: "We couldn’t reach the server. Check your connection and try again." };
  }
  if (error.status === 429) {
    return { message: "Too many attempts. Please wait a minute and try again." };
  }
  if (mode === "sign-in") {
    // Don't reveal whether the email or the password was wrong.
    if (error.status === 401) return { message: "The email or password is incorrect." };
  } else {
    if (error.code?.startsWith("USER_ALREADY_EXISTS")) {
      return {
        message: (
          <>
            An account with this email already exists.{" "}
            <Link href={`/sign-in?next=${encodeURIComponent(next)}`} className="link-underline">
              Sign in instead
            </Link>
          </>
        ),
      };
    }
    if (error.code === "PASSWORD_TOO_SHORT") {
      return { field: "password", message: `Use at least ${PASSWORD_MIN} characters.` };
    }
    if (error.code === "PASSWORD_TOO_LONG") {
      return { field: "password", message: `Use ${PASSWORD_MAX} characters or fewer.` };
    }
    if (error.code === "INVALID_NAME") {
      return { field: "name", message: `Use ${NAME_MAX} characters or fewer.` };
    }
    if (error.code === "INVALID_EMAIL") {
      return { field: "email", message: "Enter a valid email address, like name@example.com." };
    }
  }
  return { message: "Something went wrong. Please try again." };
}

function PasswordField(props: Omit<TextFieldProps, "label" | "name" | "type" | "trailing">) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      id="auth-password"
      label="Password"
      name="password"
      type={visible ? "text" : "password"}
      className="pr-12"
      trailing={
        <button
          type="button"
          className="btn-icon absolute top-1/2 right-0 -translate-y-1/2"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls="auth-password"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
}
