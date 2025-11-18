# Repository Guidelines

## Project Structure & Module Organization
- The Next.js 16 App Router code lives in `src/`, split into `(auth)` and `(main)` route groups plus shared components and utilities. Keep server actions inside `src/lib/**` and client-only hooks/components inside `src/components/**` with the correct `"use server"` / `"use client"` directives.
- `docs/requirements.md`, `docs/design.md`, and `docs/tasks.md` define scope, architecture, and roadmap; read them before touching features or migrations.
- Playwright specs live in `tests/` with reports under `playwright-report/`. Database SQL resides in `supabase/migrations/`; run them in the Supabase Dashboard and refresh `src/lib/supabase/database.types.ts` afterward.
- Static assets belong in `public/`, while `.env.local` must provide Supabase URL/key plus `SUPABASE_ACCESS_TOKEN` as documented in CLAUDE.md.

## Build, Test, and Development Commands
- `pnpm dev` — Turbo dev server at http://localhost:3000.
- `pnpm build` / `pnpm start` — create and run the production bundle.
- `pnpm lint` — ESLint (Next.js core-web-vitals + TS) for code quality.
- `pnpm format` — Biome formatter (2 spaces, double quotes, trailing commas).
- `pnpm type-check` — `tsc --noEmit` in strict mode.
- `pnpm exec playwright test` — run E2E suites; upload artifacts to `playwright-report/`.

## Coding Style & Naming Conventions
- TypeScript only; exported functions in `"use server"` files **must be async** and avoid browser APIs. Client files should declare `"use client"` when using hooks/events.
- Follow shadcn/ui alias imports (e.g., `@/components/ui/button`) and keep server → client dependency flow only.
- Dark mode is disabled per CLAUDE.md; stick to the light theme tokens and lucide-react icons.
- Branch names should mirror CLAUDE’s guidance, e.g., `feature/img-upload` or `feature/api-replies`.

## Testing Guidelines
- Name Playwright files after the feature (`tests/reactions.spec.ts`) and cover both server-actions success paths and UI edge cases (self-reaction disable, follow feed states, etc.).
- Before opening a PR, run `pnpm lint`, `pnpm type-check`, and the affected Playwright specs; attach summaries or screenshots of critical UI flows when automation isn’t available.

## Commit & Pull Request Guidelines
- Keep commits short and imperative with prefixes seen in history (`fix:`, `add:`, `doc:`). Reference roadmap tasks or docs (`fix: reaction toggle (Task 25)`).
- PRs should link relevant docs/tasks, include validation command logs, and embed UI captures for layout work (header/sidebar, shadcn components).
- Call out Supabase migrations, `.env.local` changes, or new storage buckets explicitly so reviewers can apply them.

## Security & Configuration Tips
- Never commit secrets; use `.env.local` per CLAUDE.md. Confirm Supabase Storage buckets (e.g., `avatars`, post images) have correct RLS before deploying.
- When adding new UI, ensure server/client boundaries are respected to avoid RSC directive violations, and document any new notifications or reactions in `docs/tasks.md`.
