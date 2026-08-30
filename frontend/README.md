# Frontend

pnpm workspace with Turborepo. Requires Node 24+ and pnpm.

## Environment

Copy the example env file and point it at the backend API:

```sh
cp .env.example .env.local
```

`.env.local` is loaded by `apps/web` and `apps/e2e` via `dotenv-cli`. The only variable is:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Change this if the Laravel API is not running on `127.0.0.1:8000`.

## Start

From this directory:

```sh
pnpm install
```

The backend must also be running for the app and e2e tests to talk to the API. See the repo root README for that setup.

## Run

```sh
pnpm dev
```

The Next.js app is at [http://localhost:3000](http://localhost:3000).

## Tests

Unit and component tests (Vitest) live in the packages that define a `test` script (`@repo/api`, `@repo/quiz`):

```sh
pnpm test
```

Only packages changed since the default base branch:

```sh
pnpm test:affected
```

## E2E tests

Playwright tests in `apps/e2e`. They start the Next.js app themselves; the backend API still needs to be up.

First time, install browsers:

```sh
pnpm --filter e2e exec playwright install
```

Then:

```sh
pnpm e2e
```

Interactive UI runner:

```sh
pnpm e2e:ui
```

## Storybook

UI components in `@repo/ui`:

```sh
pnpm storybook
```

Storybook is at [http://localhost:6006](http://localhost:6006).

## Affected commands

Turbo `--affected` runs a task only for packages that changed relative to the base branch. Root scripts:

| Full | Affected |
| --- | --- |
| `pnpm build` | `pnpm build:affected` |
| `pnpm lint` | `pnpm lint:affected` |
| `pnpm test` | `pnpm test:affected` |
