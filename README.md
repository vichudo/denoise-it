# Denoise It

**Strip the noise. See what's real.**

Denoise It is an AI-powered fact-checking platform that separates **signal** (verifiable truth) from **noise** (emotional language, bias, sensationalism, and narrative framing) in any piece of content. Paste a tweet, headline, article, claim, link, or rumor — and get a clear, source-backed verdict in seconds.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![tRPC](https://img.shields.io/badge/tRPC-11-398CCB?logo=trpc)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)

---

## How It Works

1. **Paste anything** — A tweet, headline, article, claim, link, question, or rumor.
2. **AI analyzes** — An AI agent cross-references primary sources, government data, and peer-reviewed research in real time using web search.
3. **See the signal** — Get a clear verdict with confidence scores, sourced facts, and every piece of noise identified and explained.

## Features

- **Signal extraction** — Verifiable facts, statistics, and attributions pulled from primary sources with confidence scores
- **Noise identification** — Emotional language, bias, speculation, sensationalism, and missing context flagged and explained
- **Source credibility scoring** — Prioritizes .gov, .edu, and peer-reviewed sources; penalizes unsupported media amplification
- **Time-sensitive filtering** — Focus analysis on recent information (24 hours to 2 years)
- **Follow-up chat** — Ask deeper questions about any analysis with full context preserved
- **Multi-language output** — Results in 10 languages (EN, ES, FR, DE, PT, IT, JA, KO, ZH, AR)
- **Privacy controls** — Public, Unlisted, or Private visibility for saved analyses
- **Shareable links** — Every analysis gets a unique URL with rich social previews (dynamic OG images)
- **URL deduplication** — Analyzing the same URL returns the existing result instantly
- **No account required** — Core analysis works without sign-in; optional Google OAuth for saving and managing

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, RSC, Turbopack) |
| Language | TypeScript 5.8 |
| UI | React 19, Tailwind CSS 4, shadcn/ui, Framer Motion |
| API | tRPC 11 (end-to-end type safety) |
| Database | PostgreSQL + Prisma 6 |
| Auth | NextAuth 5 (Google OAuth) |
| AI | Anthropic Claude (via Vercel AI SDK), OpenRouter |
| Tooling | pnpm, ESLint (flat config), Prettier |

## Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+
- **PostgreSQL** database

### Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/vichudo/denoise-it.git
   cd denoise-it
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your `.env`:

   ```env
   # Auth — generate with: npx auth secret
   AUTH_SECRET=""

   # Google OAuth — https://console.cloud.google.com/apis/credentials
   AUTH_GOOGLE_ID=""
   AUTH_GOOGLE_SECRET=""

   # PostgreSQL connection
   DATABASE_URL="postgresql://postgres:password@localhost:5432/denoise-it"

   # AI providers
   ANTHROPIC_API_KEY=""
   OPENROUTER_API_KEY=""
   ```

4. **Push the database schema**

   ```bash
   pnpm db:push
   ```

5. **Start the dev server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm check` | Lint + typecheck |
| `pnpm lint` | ESLint only |
| `pnpm lint:fix` | ESLint with auto-fix |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm format:check` | Prettier check |
| `pnpm format:write` | Prettier auto-format |
| `pnpm db:push` | Push Prisma schema to database |
| `pnpm db:generate` | Create Prisma migration |
| `pnpm db:migrate` | Deploy Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├── app/
│   ├── _components/       # Page-specific client components
│   ├── api/               # API routes (auth, tRPC, chat, OG images)
│   ├── dashboard/         # User dashboard (protected)
│   ├── link/              # URL-based analysis
│   ├── login/             # Authentication page
│   └── s/[id]/            # Signal view page
├── components/
│   └── ui/                # shadcn/ui component library (65+)
├── server/
│   ├── api/
│   │   └── routers/       # tRPC routers (analysis, followup, user)
│   ├── auth/              # NextAuth configuration
│   └── db.ts              # Prisma client singleton
├── trpc/                  # tRPC client wiring (React + RSC)
├── lib/                   # Shared utilities
└── styles/                # Global CSS + theme variables
```

## License

This project is open source under the [MIT License](LICENSE).
