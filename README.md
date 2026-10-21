# Smilescore

Upload a photo and get a smile score from 0 to 100. Smilescore finds the face
with AWS Rekognition, scores the smile, and keeps every result in a personal
dashboard with your average, your best and your trend.

## Features

- **Smile scoring.** Upload a JPG or PNG (up to 4 MB). The largest face is
  scored from smile confidence, the "happy" emotion and mouth openness, and
  labelled Beaming, Smiling, Slight smile or Neutral.
- **Dashboard.** Average score with the 30-day change, best photo, smile
  streak, a score-over-time chart, a breakdown by label, and a searchable,
  sortable, paged history. Totals are computed in the database.
- **Photo view.** Open any photo to see it full size with the detected face,
  its score, how it compares with your average, and what Rekognition saw.
  Download the original under its file name.
- **Accounts.** Email and password sign-up with email verification, rate
  limits on sign-in, sign-up and scoring, and protected routes.
- **Privacy.** Photos live in a private storage bucket and are only shown
  through short-lived signed links. Privacy policy and terms pages included.

## Tech stack

| Area    | Tools                                                                                                      |
| ------- | ---------------------------------------------------------------------------------------------------------- |
| App     | [Next.js 16](https://nextjs.org) (App Router, Cache Components, Partial Prefetching), React 19, TypeScript |
| UI      | Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com) on Base UI, Lucide icons, Sonner toasts                 |
| Auth    | [Better Auth](https://www.better-auth.com) with sessions in Upstash Redis                                  |
| Data    | Supabase Postgres with [Drizzle ORM](https://orm.drizzle.team), Supabase Storage for photos                |
| Scoring | AWS Rekognition `DetectFaces`; thumbnails made with `sharp`                                                |
| Email   | [Resend](https://resend.com)                                                                               |
| Testing | Vitest and Testing Library (unit), Playwright (end-to-end), PGlite (real-SQL data tests)                   |
| Tooling | pnpm, ESLint, Prettier, Husky, lint-staged, commitlint, GitHub Actions, Vercel                             |

## Getting started

### Prerequisites

- Node.js 24 (LTS)
- pnpm 12 (`corepack enable` picks the version from `package.json`)
- Accounts for Supabase, Upstash Redis, Resend and AWS (Rekognition)
- Docker Desktop, only for the end-to-end tests

### 1. Install

```bash
pnpm install
```

### 2. Configure the environment

Copy `.env.example` to `.env.local` and fill it in. Every variable is checked
at startup by `lib/env.ts`, so a missing or invalid value stops the app with a
clear error.

| Variable                                                   | What it is                                                                                                                                                  |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`                                       | 32+ random characters (`openssl rand -base64 32`)                                                                                                           |
| `BETTER_AUTH_URL`                                          | The app's URL, e.g. `http://localhost:3000`                                                                                                                 |
| `POSTGRES_URL`                                             | Supabase Postgres connection string                                                                                                                         |
| `NEXT_PUBLIC_SUPABASE_URL`                                 | Supabase project URL                                                                                                                                        |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`                     | Supabase publishable (`sb_publishable_…`) key                                                                                                               |
| `SUPABASE_SECRET_KEY`                                      | Supabase **secret** (`sb_secret_…`) key, used server-side for photo storage. Not the publishable key: uploads fail with a row-level security error if it is |
| `SUPABASE_PHOTO_BUCKET`                                    | Name of the private Storage bucket for photos                                                                                                               |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN`                     | Upstash Redis REST URL and token (sessions and rate limits)                                                                                                 |
| `RESEND_API_KEY`                                           | Resend API key for verification emails                                                                                                                      |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | AWS credentials that can call Rekognition `DetectFaces`                                                                                                     |
| `USE_MOCK_SCORER`                                          | `true` skips Rekognition and returns a fixed score (useful without AWS)                                                                                     |

The Vercel integrations for Supabase and Upstash provide most of these under
the same names.

### 3. Set up Supabase

1. Create a **private** Storage bucket and put its name in
   `SUPABASE_PHOTO_BUCKET`. Optionally limit it to 4 MB and
   `image/jpeg`, `image/png`, `image/webp` (thumbnails are WebP).
2. Apply the database migrations:

   ```bash
   npx drizzle-kit migrate
   ```

### 4. Run it

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). In development,
verification emails are not sent: the link is printed in the terminal
(`[auth] Verify you@example.com: …`), so you can sign up without Resend.

## Scripts

| Command                             | Does                                                |
| ----------------------------------- | --------------------------------------------------- |
| `pnpm dev`                          | Start the development server                        |
| `pnpm build` / `pnpm start`         | Build and run the production app                    |
| `pnpm lint`                         | ESLint                                              |
| `pnpm format` / `pnpm format:check` | Prettier                                            |
| `pnpm typecheck`                    | Generate route types and run `tsc`                  |
| `pnpm test`                         | Unit tests (Vitest)                                 |
| `pnpm test:e2e`                     | End-to-end tests (Playwright, needs Docker running) |

## Testing

**Unit tests** (`pnpm test`) cover components, hooks, helpers and route
handlers. The data-layer tests run the real SQL against
[PGlite](https://pglite.dev), an in-memory Postgres with the project's
migrations, so paging, ranking and the summary queries are checked for real.

**End-to-end tests** (`pnpm test:e2e`) run in a browser against a
self-contained stack that never touches real services:

- Postgres in Docker (`tests/docker-compose.yml`), reset and migrated each run
- A fake server for the Upstash Redis REST API, Supabase Storage and Resend
  (`tests/support/fake-services.ts`); tests follow the real verification emails
- A production build of the app with the mock scorer, built into `.next-e2e`
  so it never clashes with `pnpm dev`

The first run pulls the Postgres image and builds the app, so it takes a few
minutes. Reports are written to `playwright-report/`
(`pnpm exec playwright show-report`).

## Project structure

```
app/                  Routes: home, legal pages, auth pages, dashboard, API
  api/score           GET a page of your scores · POST a photo to score
  api/upload/[id]     GET one upload with a fresh signed link (?download=1)
components/           Presentational components (ui/ = shadcn primitives)
service/              Containers that hold hooks and state for each feature
lib/                  Helpers, hooks, constants, schemas, storage, scoring
  dal/                Data access: sessions, API wrapper, score queries
db/                   Drizzle schema and database client
drizzle/              SQL migrations
types/                Shared TypeScript types
tests/                Playwright end-to-end tests and their fake services
proxy.ts              Redirects between guest and signed-in routes
```

## Deployment

The app deploys to [Vercel](https://vercel.com). Set every variable from the
table above for **Production and Preview**, run the migrations against the
production database, and make sure the photo bucket exists.

GitHub Actions runs lint, the format check, type check and unit tests on every
pull request, plus the end-to-end suite against a Postgres service container.

## Contributing

- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org)
  (checked by commitlint).
- Husky runs ESLint and Prettier on staged files before each commit, and the
  type check and unit tests before each push.
- Releases are tagged `vX.Y.Z` on the merge commit in `main`, matching
  `package.json`.

## License

[MIT](LICENSE)
