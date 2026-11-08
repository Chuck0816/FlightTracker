# Flight Tracking Optimizer

Flight route reliability analytics for US domestic corridors. Users can look up origin/destination airport pairs, view historical delay and cancellation metrics, compare airlines on a route, and (when signed in) save routes to a personal watchlist.

## Frontend stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| UI | [shadcn/ui](https://ui.shadcn.com) (base-nova style) + [Tailwind CSS v4](https://tailwindcss.com) |
| Auth | [Auth.js / next-auth v5](https://authjs.dev) — Credentials provider, JWT sessions |
| Fonts | DM Sans (body), IBM Plex Mono (labels) via `next/font` |
| Database driver | `mysql2` (used by API routes and Auth.js `authorize` callback) |

### Key routes

| Path | Description |
| --- | --- |
| `/` | Landing page; redirects to `/profile` if signed in |
| `/login` | Sign in |
| `/signup` | Create account |
| `/profile` | Protected user profile (middleware + server-side check) |

## Prerequisites

- Node.js compatible with the dependencies pinned in `package.json`.
- pnpm at the version declared by the `packageManager` field in `package.json`.
- MySQL 8 with the schema, reference data, and analytics SQL objects described in the [database setup guide](../Database%20Chunked%203/README.md).

Full historical reliability analytics require the separately supplied bulk flight and delay-cause records, which are excluded from this public repository.

## Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Configure environment variables**

   Copy the example file and fill in your values:

   ```bash
   cp .env.example .env
   ```

   The committed `.env.example` contains placeholders only. Keep your real credentials in `.env`, which is ignored by Git. You may optionally set `DB_SOCKET` instead of `DB_HOST` and `DB_PORT`.

   Required variables:

   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=flight_optimizer

   AUTH_SECRET=your_random_secret   # openssl rand -base64 32
   ```

   `AUTH_SECRET` is required for Auth.js JWT signing. Without it, sign-in and session checks will fail at runtime.

3. **Run the dev server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Run the production server (after `build`) |
| `pnpm lint` | Run ESLint |

## Project structure (frontend)

```
app/
  page.tsx          # Landing page (server component, auth redirect)
  login/            # Sign-in page + client form
  signup/           # Sign-up page + client form
  profile/          # Protected profile page
  api/              # Route handlers (auth, create-user, etc.)
auth.ts             # Auth.js config (Credentials + DB queries)
auth.config.ts      # Edge-safe auth config (used by middleware)
middleware.ts       # Protects /profile routes
components/ui/      # shadcn/ui primitives (Button, Card, Input, Label)
```
