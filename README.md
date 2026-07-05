# Community Forum — Saved Posts

A full-stack discussion forum with a Saved Posts (bookmark) feature, built as a take-home assessment.

**Stack**: Express + SQLite + Drizzle ORM (API) · React 19 + Next.js App Router + TanStack Query v5 (UI)

## Setup

```bash
# Install all dependencies (server + web)
npm install

# Create database schema and seed data
npm run db:seed

# Start API and Web server both at once
npm run dev

# Start the API server (port 3001)
npm run dev:server

# In a second terminal — start the Next.js frontend (port 3000)
npm run dev:web

# Run unit + API tests
npm run test
```

## Project Structure

```
server/           Express API — routes, middleware, pure business logic, tests
  src/core/       Pure functions: save/unsave transitions, authorization rules
  src/routes/     API endpoints: posts, saved, users
  tests/          Vitest unit + supertest integration tests

web/              Next.js App Router frontend
  src/api/        Typed API client + query-key factory
  src/components/ Feature-grouped components (feed/, saved/, layout/, common/)
  src/i18n/       Message catalogs (EN + ES) with pluralization
  src/context/    Simulated user auth context
```
