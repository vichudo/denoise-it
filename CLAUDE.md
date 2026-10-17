# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run dev            # Start dev server (Turbopack, default in Next.js 16)
pnpm run build          # Production build
pnpm run start          # Start production server
pnpm run check          # Format check + lint + typecheck (what CI runs)
pnpm run lint           # Oxlint (type-aware)
pnpm run lint:fix       # Oxlint with auto-fix
pnpm run typecheck      # TypeScript type checking (tsc --noEmit)
pnpm run format         # Oxfmt: format everything
pnpm run format:check   # Oxfmt check
pnpm run db:push        # Push Prisma schema to database
pnpm run db:generate    # Create Prisma migration
pnpm run db:migrate     # Deploy Prisma migrations
pnpm run db:studio      # Open Prisma Studio
```

## Architecture

This is a **T3 Stack** app (create-t3-app v7.40.0) using Next.js 16 App Router with full-stack type safety.

### Core Stack

- **Next.js 16** (App Router, React Server Components, Turbopack)
- **React 19** with RSC-first patterns
- **tRPC 11** for end-to-end type-safe APIs
- **Prisma 6** with PostgreSQL
- **NextAuth 5 (beta.30)** with PrismaAdapter
- **Tailwind CSS 4** with shadcn/ui (new-york style)

### Key Directories

- `src/server/api/` — tRPC backend: router definitions, context, middleware
- `src/server/auth/` — NextAuth config and exports
- `src/server/db.ts` — Prisma client singleton
- `src/trpc/` — tRPC client wiring (React provider, RSC helpers, query client)
- `src/components/ui/` — shadcn/ui components (65+)
- `src/app/_components/` — page-specific client components
- `src/env.js` — Zod-validated environment variables (@t3-oss/env-nextjs)
- `prisma/schema.prisma` — database schema
- `generated/prisma/` — generated Prisma client (excluded from tsconfig)

### tRPC Data Flow

**Server-side (RSC):** `src/trpc/server.ts` creates a caller with `createHydrationHelpers`. Pages prefetch data with `api.router.query.prefetch()` and wrap children in `<HydrateClient>`.

**Client-side:** `src/trpc/react.tsx` provides `TRPCReactProvider` using `httpBatchStreamLink` to `/api/trpc`. Client components use `api.router.query.useSuspenseQuery()` for reads and `api.router.action.useMutation()` for writes.

**Adding a new router:**

1. Create router in `src/server/api/routers/`
2. Add to `appRouter` in `src/server/api/root.ts`
3. Use `publicProcedure` or `protectedProcedure` (requires auth)

**Context** provides `db` (Prisma), `session` (NextAuth), and `headers` to all procedures. SuperJSON handles serialization of complex types.

### Auth Pattern

`src/server/auth/index.ts` exports `auth`, `handlers`, `signIn`, `signOut`. The `auth` function is wrapped with `React.cache()` for request deduplication. Auth routes live at `/api/auth/[...nextauth]`. Discord OAuth is configured but credentials are not set — add `AUTH_DISCORD_ID` and `AUTH_DISCORD_SECRET` to `.env` and uncomment validation in `src/env.js`.

### Environment Variables

Validated in `src/env.js` with Zod. Server vars: `AUTH_SECRET`, `DATABASE_URL`, `NODE_ENV`. No client-side (`NEXT_PUBLIC_`) vars yet. Set `SKIP_ENV_VALIDATION=true` to bypass (Docker builds). `AUTH_TRUST_HOST=true` is needed for local development.

### Styling

Tailwind CSS 4 via `@tailwindcss/postcss`. Theme uses OKLch CSS variables defined in `src/styles/globals.css` with light/dark mode support. Use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) for conditional classes. Oxfmt auto-sorts Tailwind classes (in `className` and `cn`/`cva`/`clsx` calls) and imports.

### Linting and Formatting

[Oxlint](https://oxc.rs/docs/guide/usage/linter) and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) replace ESLint and Prettier. `.oxlintrc.json` documents each rule choice inline: errors for correctness, type safety and generated-code smells (`any`, non-null assertions, floating promises, unnecessary conditions, stray `console.log`), warnings for size and nesting heuristics. Type-aware rules run through `oxlint-tsgolint` (typescript-go), which rejects `baseUrl`, so path aliases live in `tsconfig.json` `paths` only.

- Read env vars through `env` from `@/env`, never `process.env` (`node/no-process-env`).
- Import across directories with `@/`, never `../` (`import/no-relative-parent-imports`).
- UI code (`src/components`, `src/hooks`, `src/app/_components`) never imports `@/server`; it goes through tRPC.
- Type-only imports are top-level `import type { X }`.
- Suppress a rule only with a reason: `// oxlint-disable-next-line <rule> -- why`.
- `src/components/ui/**` (shadcn/ui) and `src/components/ai-elements/**` are vendored: formatted, not linted.

Oxfmt prints 80 columns with single quotes, sorts imports and Tailwind classes. A husky pre-commit hook runs `oxlint --fix` and `oxfmt` on staged files via lint-staged. VS Code formats and fixes on save with the recommended `oxc.oxc-vscode` extension (`.vscode/settings.json`).
