# FlightTracker — Flight Tracking Optimizer

A database-driven web application for exploring historical U.S. domestic flight routes. Compare route reliability, airline performance, delay causes, cancellation rates, and airfare trends before planning a trip.

Developed by **The Foreign Key Club**.

## Features

- Search airports and origin/destination routes.
- Explore historical arrival and departure delays, cancellations, and diversions.
- Compare airlines, monthly performance, delay causes, and market fares.
- View airport locations and route maps.
- Create an account, sign in, manage a profile, and save favorite routes.
- Cache route analytics in MySQL with stored procedures and cleanup triggers.

The application analyzes historical records; it does not provide live flight status or ticket booking.

## Stack

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Auth.js Credentials authentication, MySQL 8, `mysql2`, Recharts, and React Simple Maps. Exact dependency versions are recorded in `flighttracker-app/package.json` and `pnpm-lock.yaml`.

## Run locally

1. Prepare a MySQL 8 database using the [database setup guide](Database%20Chunked%203/README.md). Full reliability analytics require the separate historical flight records and delay-cause datasets.
2. Use a Node.js version supported by the pinned dependencies and the pnpm version declared in `flighttracker-app/package.json`.
3. Install and configure the application:

   ```bash
   cd flighttracker-app
   pnpm install --frozen-lockfile
   cp .env.example .env
   ```

4. Fill in your local database credentials and a newly generated `AUTH_SECRET` in `.env`.
5. Start the development server:

   ```bash
   pnpm dev
   ```

Open [localhost:3000](http://localhost:3000). See the [application README](flighttracker-app/README.md) for scripts and configuration.

## Repository layout

| Path | Contents |
| --- | --- |
| `flighttracker-app/` | Application UI, API handlers, authentication, and database queries |
| `Database Chunked 3/` | Original database schema and compact aviation reference/airfare datasets |
| `doc/sql/` | Analytics cache tables, indexes, stored procedure, and cleanup trigger |
| `doc/` | Proposal, relational schema, normalization notes, design report, and diagrams |
| `TeamInfo.md` | Team credits and project background |

## Data and configuration

The project uses aviation datasets documented in the [project proposal](doc/ProjectProposal.md), including U.S. Department of Transportation, Bureau of Transportation Statistics, and OpenFlights data. Consult each provider's terms before redistributing their data.

This public repository excludes local environment files, credentials, account and saved-route exports, bulk flight-record and flight-delay-cause dumps, dependencies, build output, and local tool configuration. The original bulk aviation exports remain local; the included reference data alone does not reproduce the full analytics database. A database connection screenshot and personal contact addresses are also omitted from the public documentation.

`.env.example` contains placeholders only. Supply your own credentials and secrets locally.

## Team

Chuck Wang, Po Lin, Albert Lee, and Vismayak Mohanarajan — The Foreign Key Club.
