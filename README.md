# Blogit

A lightweight, fast blogging API written in Go using PostgreSQL, `net/http`, and type-safe SQL via sqlc. No heavy frameworks, just stdlib routing and clean layers.

![Go](https://img.shields.io/badge/Go-1.25-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![pgx](https://img.shields.io/badge/pgx-v5-black?style=for-the-badge&logo=go&logoColor=white)
![sqlc](https://img.shields.io/badge/sqlc-type--safe_SQL-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-windows_%7C_linux_%7C_macos-lightgrey?style=for-the-badge)
![Status](https://img.shields.io/badge/status-active_development-green?style=for-the-badge)

## Features

- Blog CRUD: create, list, fetch by slug, partial update
- Slug-based public URLs with auto `slugify`
- Strict JSON handling (1 MB limit, unknown-field rejection, single-object body)
- Health check with uptime (`GET /health`)
- Type-safe DB access with no raw string queries in handlers
- Connection pooling via `pgxpool` with sensible timeouts

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | [Go 1.25](https://go.dev/) |
| HTTP | Stdlib `net/http` `ServeMux` (Go 1.22+ method and pattern routing) |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| Driver / Pool | [`github.com/jackc/pgx/v5`](https://github.com/jackc/pgx) with `pgxpool` |
| Queries | [`sqlc v1.31.1`](https://sqlc.dev/) (`queries/` to `internal/db/`) |
| Migrations | Goose-style SQL (`migrations/`) |
| Config | Env vars (`DATABASE_URL`), `.env` for local dev |

## Project Structure

```
blogit/
├── cmd/api/main.go           # entrypoint: pool, server, timeouts
├── internal/
│   ├── api/                  # HTTP layer
│   │   ├── server.go         # routes (ServeMux)
│   │   ├── blogs.go          # blog handlers and slugify
│   │   ├── authors.go        # reserved for author endpoints
│   │   └── helpers.go        # writeJSON, writeError, readJSON
│   ├── db/                   # sqlc-generated (DO NOT EDIT)
│   └── models/               # domain structs (legacy, being phased out)
├── queries/blogs.sql         # source of truth for SQL
├── migrations/00001_init.sql # authors and blogs schema
├── sqlc.yaml                 # sqlc codegen config
└── go.mod
```

### Schema overview

- `authors(id UUID PK, name, email UNIQUE, created_at)`
- `blogs(id UUID PK, author_id FK to authors ON DELETE CASCADE, title, slug UNIQUE, body, created_at, updated_at)`

## Getting Started

### Prerequisites

- Go 1.25+
- PostgreSQL 14+ running locally
- Optional: `sqlc` and `goose` CLIs for codegen and migrations

### 1. Clone and install

```bash
git clone https://github.com/<you>/blogit.git
cd blogit
go mod tidy
```

### 2. Configure environment

Create a `.env` in the project root (never commit it):

```env
DATABASE_URL=postgres://postgres:<password>@localhost:5432/blogdb?sslmode=disable
```

> `os.Getenv` does not auto-load `.env`. Either export the var in your shell (`$env:DATABASE_URL="..."` on PowerShell) or add [`godotenv`](https://github.com/joho/godotenv) with `godotenv.Load()` at the top of `main()`.

### 3. Create DB and run migrations

```bash
createdb blogdb
# if using goose:
goose postgres "$DATABASE_URL" -dir migrations up
# otherwise apply migrations/00001_init.sql with psql
psql "$DATABASE_URL" -f migrations/00001_init.sql
```

### 4. Optional: regenerate sqlc

```bash
sqlc generate
```

### 5. Run

```bash
go run ./cmd/api
# Server running on http://localhost:8080
```

## API Reference

Base URL: `http://localhost:8080`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Liveness and uptime |
| `GET` | `/blogs` | List latest 20 blogs (newest first) |
| `GET` | `/blogs/{slug}` | Fetch one post by slug |
| `POST` | `/blogs` | Create a post |
| `PATCH` | `/blogs/{id}` | Partial update by UUID |

### Examples

**Health**
```bash
curl http://localhost:8080/health
```

**List blogs**
```bash
curl http://localhost:8080/blogs
```

**Get by slug**
```bash
curl http://localhost:8080/blogs/hello-world
```

**Create**
```bash
curl -X POST http://localhost:8080/blogs \
  -H "Content-Type: application/json" \
  -d '{"author_id":"<author-uuid>","title":"Hello World","body":"My first post"}'
```

**Partial update**
```bash
curl -X PATCH http://localhost:8080/blogs/<blog-uuid> \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title"}'
```

Error shape is consistent: `{"error":"message"}` with appropriate status codes (`400`, `404`, `422`, `500`).

## Configuration

| Var | Required | Default | Description |
|-----|----------|---------|-------------|
| `DATABASE_URL` | yes | none | Postgres DSN for `pgxpool` |
| `PORT` | no | `8080` | Planned listen address override |

Server timeouts are set in `cmd/api/main.go`: Read 5s, Write 10s, Idle 60s.



## Contributing

PRs welcome. Keep it stdlib-first: no web framework, keep SQL in `queries/`, regenerate with `sqlc generate`, and add migrations as new numbered files (never edit applied ones).

## License

MIT
