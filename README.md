# آروان واچ — Arvan Watch Platform

Front-end for the ArvanCloud Front-End Challenge: OTP login, a 15-video
catalog, an HLS player, and continue-watching sync — built to also be
usable from a smart TV browser via keyboard/remote arrow-key navigation.

## Stack

- Vue 3 (`<script setup lang="ts">`) + TypeScript + Vite
- Pinia for state (auth session, watch progress)
- Vue Router with auth guards
- hls.js for HLS playback (falls back to native HLS on Safari)

## Getting started

```bash
npm install
npm run dev
```

The app reads the API base URL from `.env`:

```
VITE_API_BASE_URL=https://streaming-dashboard.objectstorage-h0um1.arvanedge.ir
```

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
   client-side expiry estimate, and attached as `Authorization: Bearer
<token>` on every authenticated request.
4. Any `401` response anywhere in the app clears the session and
   redirects to `/login` (see `auth:unauthorized` event in
   `src/infrastructure/api/httpClient.ts` / `src/main.ts`) — since
   there's no refresh token, re-authenticating is the only path forward.

## How progress sync works

- `GET /continue-watching` is fetched on the home page to show a
  "continue watching" card and progress bars on the catalog.
- While a video plays, `PUT /watch-progress` is called:
  - every 8 seconds during playback (`src/presentation/pages/WatchPage.vue`),
  - immediately on pause,
  - immediately on route leave (going back to the catalog),
  - best-effort on `beforeunload` (closing the tab).
- `GET /movies/{id}` position is only used to resume playback when the
  requested video matches the server's current continue-watching entry;
  otherwise playback starts at 0.

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

Layered/hexagonal: domain ports are implemented by infrastructure
adapters, application use cases orchestrate them, and the presentation
layer only talks to use cases and Pinia stores — never to `fetch`/axios
directly.

```
src/
├── config/                 # env.config.ts — runtime + build-time env access
├── domain/
│   ├── entities/            # Movie, Session, WatchProgress interfaces
│   └── ports/out/            # repository interface contracts (AuthRepository, ...)
├── application/usecases/     # business logic: auth, movie, watch-progress use cases
├── infrastructure/
│   ├── api/httpClient.ts      # thin fetch wrapper (base URL, auth header, 401 handling)
│   ├── adapters/               # port implementations backed by httpClient
│   ├── router/                  # route table + auth guard
│   └── storage/                  # Pinia stores: auth session, watch progress
├── presentation/
│   ├── components/                # VideoCard, VideoPlayer (hls.js), FocusableGrid
│   ├── pages/                      # LoginPage, HomePage, WatchPage
│   └── styles/base.css              # design tokens + global styles
├── shared/
│   ├── utils/                       # cross-cutting helpers (session localStorage)
│   └── types/                        # ambient module augmentations (vue-router meta)
└── vite-env.d.ts                       # ImportMetaEnv + window._env_ typing
```

Path aliases (`@config`, `@domain`, `@application`, `@infra`,
`@presentation`, `@shared`) are wired in `vite.config.ts` and mirrored
in `tsconfig.app.json` for type-checking/editor support.

## Tooling

- **TypeScript**, checked with `vue-tsc` (`npm run typecheck`); `npm run build` type-checks before bundling.
- **Husky + lint-staged** run ESLint and Prettier on staged files pre-commit.
- **commitlint** (conventional commits) checks commit messages via a `commit-msg` hook.
- **Docker**: multi-stage `Dockerfile` (Vite build → nginx) with runtime
  env injection — `env.sh` reads `.env` into `public/env-config.js`
  (`window._env_`) at container start so one image can be reconfigured
  per environment. `docker-compose.yml` runs it on port 8080.

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
