# ikshana-charity

A monorepo for the Charity Connect application, including backend services, database schema management, and the Trust Giving frontend.

## Tech Stack

- **Package manager:** pnpm workspaces (monorepo)
- **Runtime:** Node.js (LTS, project targets 24+)
- **Language:** TypeScript 5.9+ (with 6.0 upgrade available)
- **Frontend:** React 19.1 (Vite-powered apps)
- **Build / Bundler:** Vite, esbuild
- **Styling:** Tailwind CSS 4.1+, LightningCSS for post-processing
- **State & Data:** @tanstack/react-query for data fetching
- **API / Validation:** OpenAPI (orval) + Zod for runtime schemas
- **ORM / Database:** Drizzle ORM (Postgres)
- **Utilities:** clsx, lucide-react, framer-motion, tailwind-merge, wouter (router)
- **Dev tooling:** Prettier, tsx, rollup, esbuild

**Architecture:** Multi-package monorepo with `apps/` (frontends), `services/` (backend), `libs/` (shared packages), and `dev/` (dev tools). See [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) for details.

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
