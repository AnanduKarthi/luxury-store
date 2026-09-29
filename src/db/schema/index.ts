// Drizzle schema barrel. Export every table module from here so both
// `src/db/index.ts` and drizzle-kit (see drizzle.config.ts) pick it up.
//
// Better Auth tables: run `pnpm auth:generate` to create ./auth.ts,
// then uncomment the line below.
// export * from "./auth";

export * from "./catalog";
