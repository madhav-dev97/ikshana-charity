# Charity Connect - Folder Structure Guide

This project uses a **monorepo structure** with pnpm workspaces for better code organization and shared dependencies.

## 📁 Directory Overview

```
Charity-Connect/
├── apps/                          # Frontend applications
│   └── trust-giving/              # Main donation platform app
│       ├── src/
│       │   ├── pages/             # Route pages (Home, Donate, Admin, etc.)
│       │   ├── components/        # Reusable UI components
│       │   ├── hooks/             # Custom React hooks
│       │   ├── lib/               # Utilities & helpers
│       │   ├── assets/            # Images, icons, static files
│       │   └── store/             # State management (Zustand, etc.)
│       ├── package.json
│       ├── vite.config.ts         # Vite build configuration
│       └── tsconfig.json
│
├── services/                      # Backend services
│   └── api-server/                # Express.js REST API
│       ├── src/
│       │   ├── routes/            # API endpoints (causes, donations, etc.)
│       │   ├── middlewares/       # Express middlewares
│       │   ├── lib/               # Helper functions & utilities
│       │   │   ├── email.ts       # Email service
│       │   │   ├── logger.ts      # Logging utility
│       │   │   └── whatsapp.ts    # WhatsApp integration
│       │   ├── app.ts             # Express app setup
│       │   └── index.ts           # Server entry point
│       ├── package.json
│       └── tsconfig.json
│
├── libs/                          # Shared libraries
│   ├── api-client-react/          # React hooks for API calls
│   │   ├── src/
│   │   │   ├── custom-fetch.ts    # Fetch wrapper with auth
│   │   │   ├── index.ts           # Exports
│   │   │   └── generated/         # Auto-generated from OpenAPI
│   │   │       ├── api.ts         # Generated API client
│   │   │       └── api.schemas.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── api-spec/                  # OpenAPI specification (source of truth)
│   │   ├── openapi.yaml           # API contract definition
│   │   ├── orval.config.ts        # Code generation config
│   │   └── package.json
│   │
│   ├── api-zod/                   # Zod validation schemas
│   │   ├── src/
│   │   │   ├── index.ts           # Exports
│   │   │   └── generated/         # Auto-generated from OpenAPI
│   │   │       └── api.ts         # Zod schemas
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── db/                        # Database layer (Drizzle ORM)
│       ├── drizzle.config.ts      # Drizzle configuration
│       ├── src/
│       │   ├── schema/            # Database schema definitions
│       │   │   ├── causes.ts
│       │   │   ├── donations.ts
│       │   │   └── index.ts
│       │   └── index.ts           # Database exports
│       ├── package.json
│       └── tsconfig.json
│
├── dev/                           # Development tools & sandboxes
│   └── mockup-sandbox/            # Component preview environment
│       ├── src/
│       │   ├── components/        # UI component previews
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── mockupPreviewPlugin.ts # Custom Vite plugin
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
│
├── scripts/                       # Utility scripts
│   ├── src/
│   │   └── hello.ts               # Example script
│   ├── post-merge.sh              # Git hook script
│   └── package.json
│
└── [Root Config Files]
    ├── package.json               # Workspace root dependencies & scripts
    ├── pnpm-workspace.yaml        # pnpm workspaces configuration
    ├── pnpm-lock.yaml             # Dependency lock file
    ├── tsconfig.json              # Root TypeScript config
    ├── tsconfig.base.json         # Base TypeScript paths config
    ├── .env                       # Environment variables
    └── README.md                  # Main project README
```

## 🎯 Quick Reference

| Folder | Purpose | Contains |
|--------|---------|----------|
| `apps/` | Frontend applications | React apps, UI pages, components |
| `services/` | Backend services | Express API, business logic |
| `libs/` | Shared libraries | API clients, schemas, database layer |
| `dev/` | Development tools | Component sandboxes, mockups |
| `scripts/` | Build & automation | Git hooks, utility scripts |

## 🔄 Dependencies Flow

```
apps/trust-giving
    ↓ uses
libs/api-client-react → libs/api-zod → services/api-server
                         ↓ uses
                    libs/db (Drizzle ORM)
```

## 📦 Workspace Packages

All packages are defined in `pnpm-workspace.yaml`:
- `apps/*` — Frontend applications
- `services/*` — Backend services
- `libs/*` — Shared libraries
- `dev/*` — Development tools
- `scripts/` — Utility scripts

## 🚀 Common Commands

```bash
# Run development server for main app
pnpm --filter @workspace/trust-giving run dev

# Run API server
pnpm --filter @workspace/api-server run dev

# Build everything
pnpm run build

# Type check all packages
pnpm run typecheck

# Regenerate API client & schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

## 📝 Naming Conventions

- **Folders**: kebab-case (`trust-giving`, `api-client-react`)
- **Packages**: @workspace/app-name (in package.json)
- **Components**: PascalCase (React components)
- **Functions/Utils**: camelCase

## 🔗 Key Source Files

| File | Purpose |
|------|---------|
| `libs/api-spec/openapi.yaml` | API contract (single source of truth) |
| `libs/db/src/schema/` | Database schema definitions |
| `services/api-server/src/routes/` | API endpoints |
| `apps/trust-giving/src/pages/` | Route pages |

---

**Last updated**: June 5, 2024
