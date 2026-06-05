# ikshana-charity

A monorepo for the Charity Connect application, including backend services, database schema management, and the Trust Giving frontend.

## Prerequisites

- Node.js 18+ (or the version required by the repo)
- pnpm installed globally

## Setup

Install dependencies for the workspace:

```bash
pnpm install
```

## Database

Run a quick database connectivity check (optional):

```bash
pnpm exec node lib/db/test-db.mjs
```

Apply the Drizzle schema to the database:

```bash
pnpm --filter @workspace/db run push
```

## Development

Start the backend server:

```bash
pnpm --filter @workspace/api-server run dev
```

Start the Trust Giving frontend:

```bash
pnpm --filter @workspace/trust-giving run dev
```

## Notes

- Adjust package filters if the workspace package names differ locally.
- Use `pnpm --filter <package> run <script>` to target specific workspace packages.
