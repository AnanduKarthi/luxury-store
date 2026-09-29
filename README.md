# Luxury Store

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Better Auth · Neon Postgres · Drizzle ORM

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in DATABASE_URL, BETTER_AUTH_SECRET, etc.
pnpm exec auth secret       # prints a value for BETTER_AUTH_SECRET
pnpm dev
```

## Database / auth schema

```bash
pnpm auth:generate   # writes Better Auth tables to src/db/schema/auth.ts
                        # then uncomment `export * from "./auth"` in src/db/schema/index.ts
pnpm db:generate     # create SQL migration in ./drizzle
pnpm db:migrate      # apply migrations to Neon  (or `pnpm db:push` for quick prototyping)
pnpm db:studio       # browse the database
```

## Structure

```
src/
  app/api/auth/[...all]/route.ts  Better Auth route handler
  db/index.ts                     Drizzle client (Neon HTTP driver)
  db/schema/                      Drizzle table definitions (barrel: index.ts)
  lib/auth.ts                     Better Auth server config
  lib/auth-client.ts              Better Auth React client
drizzle.config.ts                 drizzle-kit config (reads .env.local)
drizzle/                          generated migrations
```
