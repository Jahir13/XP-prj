# XP Flow — AGENTS.md

## Project

An Astro 6 SSR app (server output, `@astrojs/node` standalone) for tracking XP (Extreme Programming) practices — stories, iterations, pair sessions, standups, retrospectives, CI pipeline, TDD, refactors, team health.

## Quick start

```sh
npm install            # node >=22.12.0
npm run dev            # starts on localhost:4321, proxies /api → localhost:3000, /ws → ws://localhost:3000
```

## Key commands (verify order: lint → typecheck → test)

| Command                | What                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| `npm run dev`          | Dev server                                                              |
| `npm run build`        | Build to `./dist/`                                                      |
| `npm run lint`         | ESLint (`.astro`, `.ts`, `.tsx`)                                        |
| `npm run lint:fix`     | ESLint with --fix                                                       |
| `npm run format`       | Prettier --write (semi, singleQuote, trailingComma all, printWidth 120) |
| `npm run format:check` | Prettier check                                                          |
| `npm run typecheck`    | `tsc --noEmit` (extends `astro/tsconfigs/strict`)                       |
| `npm test`             | Vitest (unit tests in `src/**/*.test.{ts,tsx}`)                         |
| `npm run test:watch`   | Vitest watch                                                            |
| `npm run test:e2e`     | Playwright (e2e in `e2e/`, chromium only, baseURL `localhost:4321`)     |
| `npm run test:e2e:ui`  | Playwright UI mode                                                      |

## Architecture

- **Pages**: Astro routes in `src/pages/`. Project-scoped routes under `projects/[id]/`.
- **React components**: Interactive UI in `src/components/` (grouped by domain: `stories/`, `planning/`, `pair/`, `ci/`, `tests/`, `retro/`, `refactors/`, `team/`, `dashboard/`, `health/`, `realtime/`, `feedback/`, `ui/`).
- **State**: Nanostores in `src/store/` (auth, stories, pairSession, logs, UI, notificationQueue, currentUser). Stores persist to localStorage where client-side.
- **API**: `src/api/client.ts` — simple fetch wrapper with JWT token management. All calls proxied through Astro dev server.
- **Real-time**: `src/websocket/` — client-side WS connection with exponential backoff reconnect, event-based dispatch.
- **Content**: Astro content collections (`src/content.config.ts`) for stories, iterations, project metadata, and logs (all markdown).
- **Backend**: Not in this repo. Expects a REST API at `/api` and WebSocket at `/ws`. The `astro.config.mjs` dev proxy forwards these to `localhost:3000`.
- **Middleware**: `src/middleware.ts` — currently a passthrough placeholder.
- **Env**: Copy `.env.example` → `.env`. Default vars point API/WS to `localhost:3000`.

## Toolchain quirks

- **Pre-commit**: Husky runs `npx lint-staged` → eslint --fix + prettier --write on staged `.ts/.tsx/.astro` files.
- **Commit messages**: Must follow conventional commits (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`), enforced by commitlint.
- **Vitest**: `globals: true` — `describe`, `it`, `expect` etc. are available without imports.
- **TypeScript**: Strict mode via `astro/tsconfigs/strict`. Generated types in `.astro/types.d.ts`.
- **TailwindCSS v4**: Via `@tailwindcss/vite` plugin (not PostCSS config).
- **No `.github/workflows/`**: CI pipeline not defined in this repo.
- **E2E tests**: 4 spec files (`login`, `planning`, `standup`, `stories`). Dev server must be running.
