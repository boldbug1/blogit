<div align="center">
  <img src="frontend/public/blogit-logo.png" alt="blogit. logo" width="140" height="140" style="border-radius: 24px; box-shadow: 0 8px 30px rgba(0,0,0,0.08);" />

  # blogit.

  <p align="center">
    <strong>The modern, distraction-free publishing platform for writers and thinkers.</strong><br />
    No algorithms, no invasive ads — just your words and your readers.
  </p>

  <p align="center">
    <a href="https://blogit-pied.vercel.app"><strong>Live Application</strong></a> •
    <a href="#showcase">Showcase</a> •
    <a href="#overview--highlights">Overview</a> •
    <a href="#features">Features</a> •
    <a href="#architecture--tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a>
  </p>

  <p align="center">
    <a href="https://blogit-pied.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/Production-blogit--pied.vercel.app-2563eb?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
    </a>
    <img src="https://img.shields.io/badge/Go-1.25-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go" />
    <img src="https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=neon&logoColor=black" alt="Neon Postgres" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

---

## Showcase

### User Experience
<div align="center">
  <img src="frontend/public/showcase/landing.gif" alt="blogit platform preview" width="100%" style="border-radius: 12px; box-shadow: 0 12px 36px rgba(0,0,0,0.15);" />
</div>

<br />

### Product Interface

| Discovery & Home Feed | Distraction-Free Reader |
| :---: | :---: |
| <img src="frontend/public/showcase/home.png" alt="Discovery & Feed" width="100%" /> | <img src="frontend/public/showcase/post.png" alt="Reader View" width="100%" /> |
| *Editorial homepage with fluid WebGL aurora background, search, and topic navigation.* | *Clean typography, live reading progress, author signature, and instant reactions.* |

| TipTap WYSIWYG Editor | Writer Analytics & Streaks |
| :---: | :---: |
| <img src="frontend/public/showcase/editor.png" alt="Editor View" width="100%" /> | <img src="frontend/public/showcase/dashboard.png" alt="Dashboard" width="100%" /> |
| *Live formatted writing, sticky mobile toolbar, image uploads, and real-time preview.* | *GitHub-style 52-week publishing heatmap, story metrics, and publication management.* |

| Adaptive Custom Themes | Account & Profile Settings |
| :---: | :---: |
| <img src="frontend/public/showcase/themes.png" alt="Themes & Customization" width="100%" /> | <img src="frontend/public/showcase/settings.png" alt="Settings & Preferences" width="100%" /> |
| *Fluid theme switcher across warm editorial palettes and high-contrast dark modes.* | *Author profile editing, bio customization, and security controls.* |

---

## Overview & Highlights

- **Sahara Editorial Aesthetic**: Warm sand canvas (`#faf5ee`), rich terracotta accents (`#c2652a`), deep espresso typography (`#2c2420`), and serif editorial headings (`EB Garamond`).
- **Live WYSIWYG Editor**: Powered by TipTap v3 with distraction-free floating title/subtitle inputs, markdown shortcut support, sticky mobile formatting toolbar, and instant visual feedback.
- **1-Click Google OAuth & JWT Sessions**: Seamless, passwordless Google authentication with cryptographic verification and author provisioning.
- **Neon Cloud Postgres**: Serverless PostgreSQL database with startup migrations (`goose`) and connection pooling (`pgxpool`).
- **Client-Side Image Optimization**: Automatic compression optimizes photos before publishing, keeping payloads lightweight (~150-250KB).
- **GitHub-Style Contribution Heatmap**: Visualizes a rolling 52-week publishing streak with real-time statistics (current streak, longest streak, annual contributions).
- **Distraction-Free Reading Experience**: Clean article reader with a live reading progress bar, floating mobile reaction pill, code blocks with 1-click copy, and Web Share API integration.
- **Robust Go Backend with Rate Limiting**: Built with Go stdlib `net/http` `ServeMux`, compile-time verified queries via `sqlc`, and in-memory rate limiting.

---

## Architecture & Tech Stack

### Frontend (`/frontend`)
- **Framework**: Next.js 16.3.4 (App Router, Turbopack) & React 19
- **Styling**: Tailwind CSS v4 & Lucide React icons
- **Editor**: TipTap v3 (`@tiptap/react`, `@tiptap/starter-kit`, `tiptap-markdown`)
- **Typography & Markdown**: `react-markdown`, `remark-gfm`

### Backend (`/cmd/api`, `/internal`)
- **Language**: Go 1.25
- **Routing**: Standard library `net/http` `ServeMux` (Go 1.22+ method-based pattern routing)
- **Database**: PostgreSQL 14+ with `pgxpool` (v5)
- **Type-Safe SQL**: `sqlc` v1.31.1 (codegen from `queries/` to `internal/db/`)
- **Auth**: JWT (HMAC-SHA256) + `golang.org/x/crypto/bcrypt`
- **Media Pipeline**: Up to 25MB request payloads via `http.MaxBytesReader` and 30s timeouts

---

## Project Structure

```
blogit/
├── cmd/
│   └── api/
│       └── main.go              # Backend entrypoint: connection pool, server configuration, timeouts
├── internal/
│   ├── api/                     # HTTP transport & business logic
│   │   ├── auth.go              # Signup, login, and profile handlers
│   │   ├── blogs.go             # Blog CRUD handlers, slug generation, user filtering
│   │   ├── helpers.go           # JSON responses, error formats, 25MB payload reader
│   │   ├── middleware.go        # JWT authorization middleware and CORS headers
│   │   └── server.go            # Route registration and health checks
│   └── db/                      # sqlc-generated type-safe database access (DO NOT EDIT)
│       ├── auth.sql.go
│       ├── blogs.sql.go
│       ├── db.go
│       └── models.go
├── migrations/                  # Database schema migrations
│   ├── 00001_init.sql           # Initial tables (authors, blogs)
│   └── 00002_auth.sql           # Users table, foreign keys, and credentials
├── queries/                     # Raw SQL source files for sqlc
│   ├── auth.sql
│   └── blogs.sql
├── frontend/                    # Next.js 16 Web Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx       # Root layout with fonts and metadata
│   │   │   ├── page.tsx         # Editorial landing page with fluid background
│   │   │   ├── login/           # Authentication login view
│   │   │   ├── signup/          # Authentication register view
│   │   │   ├── dashboard/       # User dashboard with stats & contribution heatmap
│   │   │   ├── editor/          # TipTap WYSIWYG creation and editing views
│   │   │   ├── blogs/[slug]/    # Distraction-free article reader
│   │   │   └── settings/        # User profile and account preferences
│   │   ├── components/          # Reusable UI components (Heatmap, Editor, Reader, etc.)
│   │   └── lib/                 # API client, auth state helpers, and utility functions
│   └── package.json
├── sqlc.yaml                    # sqlc codegen configuration
├── .env.example                 # Environment variables template
└── go.mod
```

---

## Getting Started

### Prerequisites
- **Go**: 1.25 or higher
- **Node.js**: 20.x or higher (`npm` / `pnpm`)
- **PostgreSQL**: 14 or higher running locally
- **Optional**: `sqlc` CLI for generating database code

---

### 1. Database Setup & Migrations

Create a PostgreSQL database for the project:

```bash
createdb blogdb
```

Apply the migrations in order:

```bash
psql -d blogdb -f migrations/00001_init.sql
psql -d blogdb -f migrations/00002_auth.sql
```

---

### 2. Backend Setup

1. Copy `.env.example` to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```
2. Configure the environment variables in `.env`:
   ```env
   DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/blogdb?sslmode=disable
   JWT_SECRET=your-secure-random-secret-key-at-least-32-characters-long
   PORT=8080
   ```
3. Install Go dependencies and compile:
   ```bash
   go mod tidy
   go build -o bin/api.exe ./cmd/api
   ```
4. Start the backend API:
   ```bash
   ./bin/api.exe
   # Server running on http://localhost:8080
   ```

---

### 3. Frontend Setup

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Reference

Base URL: `http://localhost:8080`

### Authentication & User Endpoints
| Method | Route | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register a new user account (`username`, `email`, `password`) |
| `POST` | `/auth/login` | No | Authenticate user credentials and receive JWT |
| `GET` | `/me` | **Yes** (Bearer JWT) | Fetch profile details of the authenticated user |

### Blog Endpoints
| Method | Route | Auth Required | Description |
|---|---|---|---|
| `GET` | `/health` | No | Service health check and server uptime |
| `GET` | `/blogs` | No | List published stories (newest first, author-filtered if query specified) |
| `GET` | `/blogs/{slug}` | No | Fetch complete blog post by unique slug |
| `POST` | `/blogs` | **Yes** (Bearer JWT) | Create a new blog post (`title`, `body`) |
| `PATCH` | `/blogs/{id}` | **Yes** (Bearer JWT) | Update title or body of a blog post by UUID |

---

## Key Features Walkthrough

### 1. TipTap WYSIWYG Canvas Editor
- Seamless real-time formatted text editing without markdown syntax clutter.
- Inline toolbar appears when selecting text: **Bold**, *Italic*, Headings (`H1`, `H2`, `H3`), Code blocks, Lists, and Blockquotes.
- Multi-source image insertion modal: paste a remote URL or upload local images with automatic browser-side canvas compression.

### 2. GitHub-Style Contribution Heatmap
- 52-week activity grid tracking writing consistency across 365 days.
- Terracotta density color scale reflecting daily story production.
- Live calculations for **Current Writing Streak**, **Longest Streak**, and **Total Published Stories**.

### 3. Distraction-Free Article Reader
- Clean editorial reading width (`max-w-3xl`) with responsive font scaling.
- Top sticky progress bar tracking article reading completion percentage.
- Syntax-highlighted code blocks with 1-click copy-to-clipboard functionality.
- Author signature card with direct social share buttons (Twitter, LinkedIn, Copy Link).

---

## Contributing & Development

- Keep the Go layer clean and stdlib-first: avoid heavyweight frameworks.
- Write queries in `queries/` and regenerate Go database access using `sqlc generate`.
- Schema changes should always be added as new sequential migration files in `migrations/`.
- Verify production frontend builds with `npm run build` before pushing.

---

## License

Distributed under the [MIT License](LICENSE).
