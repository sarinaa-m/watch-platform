# آروان واچ — Arvan Watch Platform

Front-end for the ArvanCloud Front-End Challenge: OTP login, a 15-video
catalog, an HLS player, and continue-watching sync — built to also be
usable from a smart TV browser via keyboard/remote arrow-key navigation.

## Stack

- Vue 3 (`<script setup lang="ts">`) + TypeScript + Vite
- Vue reactive composables for shared state (auth session, UI gate, watch progress)
- Vue Router with auth guards
- hls.js for HLS playback (falls back to native HLS on Safari)

## Getting started

```bash
npm install
cp .env.example .env   # required — see below
npm run dev
```

The app reads the API base URL from `.env` (gitignored, so a fresh clone must
create it):

```
VITE_API_BASE_URL=https://streaming-dashboard.objectstorage-h0um1.arvanedge.ir
```

Without it the base URL is empty, so `fetch('/movies')` resolves against the
dev server origin (`localhost:5173`) — where Vite's SPA fallback answers with
`index.html` and a `200`, which the client reads as an empty response rather
than an error. `env.config.ts` now throws at startup instead of letting that
fail silently.

This replaces the `YOUR_EDGE_DOMAIN` placeholder in the challenge's
`openapi.yaml`. If the backend for your challenge instance lives at a
different address, update this value (and `.env.local` for anything you
don't want committed).

Production build:

```bash
npm run build
npm run preview   # serve the build locally to sanity-check it
```

## How auth works

1. `POST /auth/request-otp` with an identifier — the API always issues
   `000000` as the OTP (no real SMS/email is sent).
2. `POST /auth/verify-otp` with the identifier + `000000` returns a JWT
   good for one hour, with **no refresh token**.
3. The token is kept in `localStorage` (`arvan_auth`) alongside a
   client-side expiry estimate. It is _ambient_: `authState` registers a
   getter with `httpClient` (`setTokenProvider`), so requests attach
   `Authorization: Bearer <token>` themselves rather than having the token
   threaded through every use case. The public endpoints the spec marks
   `security: []` (`/movies`, `/auth/*`) opt out with `{ auth: false }`.
4. A `401` is treated two different ways, because the API overloads it:
   - on `/auth/verify-otp` it's `invalid_otp` on a request that carried no
     token — a form error, surfaced inline on the login page;
   - anywhere else it means the JWT we _did_ send is expired or invalid, so
     the session is cleared and the app redirects to `/login`, via
     `setUnauthorizedHandler` in `httpClient.ts` calling `logout()`
     (wired in `authState.ts`).
5. Because tokens last one hour with no refresh, `isAuthenticated` checks
   expiry rather than mere presence — otherwise a stale token would pass the
   router guard and flash a protected page before the inevitable 401 — and a
   timer logs the user out the moment the token dies.
6. Logging out clears the session, the vue-query cache, and the profile gate
   together (via `onLogout` hooks), so the next login can't briefly render
   the previous user's data.

## How progress sync works

- `GET /continue-watching` is fetched on the home page to show a
  "continue watching" card and progress bars on the catalog.
- Continue-watching is **server state**, so vue-query owns it
  (`src/application/usecases/watchProgressUseCases.ts`, cached via
  `src/infrastructure/query/queryClient.ts`) — one cache and one loading
  flag, rather than a hand-rolled store mirroring the query cache.
  The mutation seeds the cache with the server's response, so the
  `progress_percentage` / `completed` values shown are always the server's.
- While a video plays, `PUT /watch-progress` is called:
  - every 8 seconds during playback (`src/presentation/pages/WatchPage.vue`),
  - immediately on pause,
  - immediately on route leave (going back to the catalog),
  - best-effort on `beforeunload` (closing the tab) — routed through
    `httpClient` with `keepalive: true`, since `sendBeacon` can't set an
    `Authorization` header.
- `GET /movies/{id}` position is only used to resume playback when the
  requested video matches the server's current continue-watching entry;
  otherwise playback starts at 0.
- `GET /continue-watching` returns an array of exactly 0 or 1 entries, so
  `total: 0` is a normal empty state, not an error.

### Error handling policy

The API returns a uniform `{error, message}` body on every failure, mapped to
`ApiError` (plus a synthetic `status: 0` / `network_error` for offline).
What each status means for the UI:

| Status                       | Meaning                                                                                          | Response                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| `400 validation_error`       | body rejected (bounds are in `openapi.yaml`: 3–254 char identifier, 6-digit OTP, `video_id ≥ 1`) | show the message; never retry                      |
| `401 invalid_otp`            | wrong OTP, no session yet                                                                        | inline login error, stay on page                   |
| `401 unauthorized`           | JWT missing/invalid/expired                                                                      | clear session, redirect to `/login`                |
| `404 not_found`              | unknown route or `video_id`                                                                      | stop; retrying can't help                          |
| `415 unsupported_media_type` | missing JSON `Content-Type`                                                                      | unreachable via `httpClient`, which always sets it |
| `0 network_error`            | offline / unreachable                                                                            | retryable; the sync loop keeps trying              |

The 8-second watch-progress loop uses `isFatalApiError` to stop on any 4xx
rather than hammering the API with a request that can never succeed, while
letting transient network failures retry on the next tick.

## TV / keyboard navigation

- `src/presentation/components/FocusableGrid.vue` implements a
  roving-tabindex grid: only one card is a tab stop at a time, and
  arrow keys move focus based on actual on-screen row/column position
  — this is what a TV remote's directional pad sends.
- The video player (`src/presentation/components/VideoPlayer.vue`)
  supports Space/Enter to play-pause and Left/Right to seek ±10s, in
  addition to native `<video controls>`.
- Every interactive element has a visible focus ring
  (`:focus-visible` in `src/presentation/styles/base.css`), which
  matters for 10-foot UI navigated without a mouse.

## Project structure

Layered: domain holds plain data types, application use cases wrap
repository adapters in vue-query (`useQuery`/`useMutation`), and the
presentation layer talks to use cases plus Vue reactive state
composables — never to `fetch`/axios or the query cache directly.

```
src/
├── config/                 # env.config.ts — build-time env access
├── domain/                    # Movie, Session, WatchProgress, UpdateWatchingDTO — plain types, no barrel
├── application/usecases/      # business logic: auth, movie, watch-progress use cases
├── infrastructure/
│   ├── api/httpClient.ts        # thin fetch wrapper (base URL, ambient auth header, 401 handling)
│   ├── adapters/                  # repository objects backed by httpClient
│   ├── query/                       # vue-query client config
│   ├── router/                        # route table + auth guard
│   └── state/                           # Vue reactive composables: auth, locale, search
├── presentation/
│   ├── components/                        # VideoCard, VideoPlayer (hls.js), FocusableGrid
│   ├── composables/                          # derived/selector logic over cached query data,
│   │                                            DOM/player orchestration (see rule below)
│   ├── pages/                                  # LoginPage, HomePage, WatchPage
│   └── styles/base.css                          # design tokens + global styles
├── shared/
│   ├── api/                                       # queryKeys, ApiError type + guards
│   ├── utils/                                       # cross-cutting helpers (session localStorage)
│   └── types/                                         # ambient module augmentations (vue-router meta)
└── vite-env.d.ts                                        # ImportMetaEnv typing
```

Path aliases (`@config`, `@domain`, `@application`, `@infra`,
`@presentation`, `@shared`) are wired in `vite.config.ts` and mirrored
in `tsconfig.app.json` for type-checking/editor support. Note the alias
config only maps `@domain/*` (a subpath), not the bare `@domain`, so
domain types are always imported from their specific file
(`@domain/movie`, `@domain/session`, `@domain/watchProgress`) rather
than through a barrel.

**`application/usecases` vs. `presentation/composables`:** a hook goes
in `usecases` if it calls `useQuery`/`useMutation` against a repository
adapter — that's the only place allowed to import
`infrastructure/adapters` or `infrastructure/query`. Everything else
(pure selectors over data a usecase already fetched, DOM/player/route
orchestration) goes in `presentation/composables`, and it must consume
that data through a usecase hook rather than reading the query cache or
calling `httpClient` itself. This is enforced by the
`no-restricted-imports` rule scoped to `src/presentation/**` in
`eslint.config.js` — if a composable needs infrastructure directly, that
is a sign it belongs in `usecases` instead.

## Tooling

- **TypeScript**, checked with `vue-tsc` (`npm run typecheck`); `npm run build` type-checks before bundling.
- **Husky + lint-staged** run ESLint and Prettier on staged files pre-commit.
- **commitlint** (conventional commits) checks commit messages via a `commit-msg` hook.
- **Docker**: multi-stage `Dockerfile` (Vite build → nginx). `VITE_API_BASE_URL`
  is passed as a build arg and baked into the bundle at `vite build` time, so
  changing it requires a rebuild. `docker-compose.yml` runs it on port 8080.

## Design notes

The visual identity (deep teal background, ArvanCloud pink accent,
Vazirmatn typeface) is drawn directly from the ArvanCloud challenge
deck rather than a generic dark theme, and the UI is RTL throughout
since the brief and API examples are Persian-first.

## Known limitations / next steps

- No automated tests yet — would add component tests for
  `FocusableGrid` (arrow-key math) and an integration test for the
  OTP → catalog → resume flow.
- Token refresh isn't possible by design (API has no refresh token);
  a production version would want a short "your session is about to
  expire" warning before the 1-hour mark.
- Thumbnails are loaded directly from `cover_image` URLs with no
  fallback/placeholder handling for broken images.
