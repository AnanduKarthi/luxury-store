import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { NAME_MAX, PASSWORD_MAX, PASSWORD_MIN } from "@/lib/validation";

// Trims the display name and enforces the same limits as the forms, so the
// API can't be used to store an empty or oversized name.
function normalizeName<T extends { name?: string }>(user: T) {
  if (user.name === undefined) return { data: user };
  const name = user.name.trim();
  if (!name || name.length > NAME_MAX) {
    throw new APIError("BAD_REQUEST", {
      message: `Name must be 1–${NAME_MAX} characters.`,
      code: "INVALID_NAME",
    });
  }
  return { data: { ...user, name } };
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: PASSWORD_MIN,
    maxPasswordLength: PASSWORD_MAX,
    // Sign-up signs the user straight in; there is no email verification yet.
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // extend the expiry at most once a day
    // No cookieCache: every session lookup hits the DB, so sign-outs and
    // role changes apply on the next request.
  },
  user: {
    additionalFields: {
      role: {
        type: ["customer", "admin"],
        required: true,
        defaultValue: "customer",
        // Never settable by clients (sign-up or update-user).
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: { before: async (user) => normalizeName(user) },
      update: { before: async (user) => normalizeName(user) },
    },
  },
  rateLimit: {
    enabled: true,
  },
  // nextCookies must be the last plugin in the array
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
