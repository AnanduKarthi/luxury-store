// Promotes or demotes a user. Roles can't be set through the auth API.
//
//   pnpm auth:set-role you@example.com admin
//   pnpm auth:set-role you@example.com customer

import { eq } from "drizzle-orm";
import { db } from "./index";
import { user } from "./schema";

type Role = (typeof user.role.enumValues)[number];
const roles = user.role.enumValues;

async function main() {
  const [email, role] = process.argv.slice(2);
  if (!email || !roles.includes(role as Role)) {
    console.error(`Usage: pnpm auth:set-role <email> <${roles.join("|")}>`);
    process.exit(1);
  }

  const [updated] = await db
    .update(user)
    .set({ role: role as Role })
    .where(eq(user.email, email.toLowerCase()))
    .returning({ email: user.email, role: user.role });

  if (!updated) {
    console.error(`No user with email ${email}`);
    process.exit(1);
  }
  console.log(`${updated.email} is now ${updated.role}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
