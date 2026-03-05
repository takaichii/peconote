# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PecoNote is a memo management application with a Go backend REST API and a React TypeScript frontend.

## Commands

### Backend (Go)
```bash
go run ./cmd/api        # Start the API server (port 8080)
go test ./...           # Run all tests
go test ./internal/usecase/...          # Run a specific package's tests
go test ./internal/adapter/handler/...  # Run handler tests (includes e2e tests)
```

### Frontend (in `web/` directory)
```bash
pnpm install   # Install dependencies
pnpm dev       # Start dev server
pnpm build     # Production build
pnpm test      # Run tests (Vitest)
pnpm lint      # Lint code
```

Frontend reads `VITE_API_BASE` env var to locate the backend.

## Architecture

The backend follows **Clean Architecture**:

```
HTTP Request
  → internal/infrastructure/router (Gin routes)
  → internal/adapter/handler (parse request, call usecase, return response)
  → internal/usecase (business logic, validation)
  → internal/domain/repository (interface)
  → internal/adapter/repository (SQL via sqlx)
  → Database (SQLite locally, PostgreSQL in production)
```

Key architectural decisions:
- **Domain layer** (`internal/domain/`) defines entities and repository interfaces — no external dependencies
- **Usecase layer** (`internal/usecase/`) owns all business validation (body: 1–2000 chars; tags: 1–10 tags, each 1–30 chars); exports `ErrInvalidMemo`, `ErrInvalidMemoQuery`, `ErrMemoNotFound`
- **Adapter layer** (`internal/adapter/`) implements repository interfaces; handlers translate HTTP ↔ usecase
- **Infrastructure layer** (`internal/infrastructure/`) wires up DB connections and router
- GORM is used for the user model; raw sqlx is used for memos

The frontend is a React SPA in `web/src/`:
- Pages in `pages/` use custom hooks from `hooks/`
- `hooks/useMemos.ts` wraps React Query + Axios client (`api/client.ts`)
- UI state managed via Zustand (`stores/ui.ts`)

## API

Full spec in `openapi.yaml`. Endpoints:
- `POST /api/memos` — create
- `GET /api/memos` — list (supports `tags` filter and pagination)
- `GET /api/memos/:id` — get by ID
- `PUT /api/memos/:id` — update
- `DELETE /api/memos/:id` — delete

## Database

Migrations in `migrations/`. The memo table uses a PostgreSQL `TEXT[]` array with a GIN index for tag filtering. Locally, SQLite is used (`app.db` auto-created, gitignored).
