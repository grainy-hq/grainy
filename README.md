# Grainy

Grainy is a Next.js app deployed to Cloudflare Workers with OpenNext. It uses Better Auth, Drizzle ORM, PostgreSQL, Tailwind CSS, ESLint, Prettier, and pnpm.

## Getting started

Install dependencies:

```bash
pnpm install
```

Create a local environment file and start the local database/proxy services:

```bash
cp .env.example .env.local
docker compose -f dev/compose.yml up
```

In another terminal, start the app:

```bash
pnpm dev
```

Open http://localhost:3000.

## Useful commands

```bash
pnpm dev             # Start Next.js locally
pnpm build           # Build the Next.js app
pnpm lint            # Run ESLint
pnpm typecheck       # Run TypeScript checks
pnpm format:check    # Check formatting
pnpm preview         # Build and preview on the Cloudflare runtime
pnpm deploy          # Build and deploy to Cloudflare
```

## Project structure

- `src/app` - Next.js App Router pages and API routes
- `src/lib/auth` - Better Auth server configuration
- `src/lib/db` - Drizzle database client and schema
- `drizzle` - Generated SQL migrations
- `dev/compose.yml` - Local PostgreSQL, migration, and database proxy services
- `wrangler.jsonc` - Cloudflare Worker/OpenNext deployment configuration
