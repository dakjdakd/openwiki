# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev    # Start dev server (tsx server/index.ts) — Express + Vite on port 3000
npm run build  # Production build: Vite build + esbuild bundle server
npm run start  # Run production server from dist/
npm run lint   # TypeScript type check only
```

## Architecture

### Overview
OpenWiki analyzes GitHub repositories with AI, generating architecture diagrams (Mermaid), learning roadmaps, and business analysis. The frontend is React 19 + Tailwind CSS 4. The backend is Express serving a Vite SPA in development.

### Frontend (src/)
- **React Router v7** with routes: `/` (Home), `/workspace/:id` (Layout with nested routes: Overview, Architecture, Learn, Business, Report)
- **Zustand** store (`workspaceStore.ts`) — single source of truth for all analysis data (project, summary, fileTree, modules, lessons, architecture, business)
- **Architecture.tsx** — diagram rendering with Mermaid.js, pan/zoom canvas (mouse drag + scroll), `diagramReady` state gates rendering. Canvas starts empty; center "RENDER ARCHITECTURE" button shows existing store data; toolbar "REGENERATE" re-fetches from `/api/analyze`

### Backend (server/)
- **server/index.ts** — Express + Vite middleware; mounts all routes
- **routes/analyze.ts** — `GET /api/analyze` — SSE stream; calls `runAnalysis()`
- **routes/project.ts** — `GET /api/project/:id`, `GET /api/project/:id/status`, `POST /api/project/:id/business`, `POST /api/tutor`
- **services/analyzer.ts** — `runAnalysis()` fetches GitHub (metadata, README, package.json, file tree) then calls AI
- **services/ai.ts** — `generateWithRetry()` wraps OpenAI SDK with exponential backoff. Uses `OPENAI_API_KEY` + `OPENAI_BASE_URL` env vars. DeepSeek model: `deepseek-v4-flash`. JSON mode via `response_format: { type: 'json_object' }`
- **services/github.ts** — `fetchGithub()` injects `GITHUB_TOKEN` into all requests (prevents rate limit). Token-less: 60 req/hr; with token: 5000 req/hr

### AI / Mermaid notes
- AI generates full JSON (summary, fileTree, modules, lessons, architecture, business) in one call
- `architecture` field is raw Mermaid syntax. DeepSeek may produce invalid syntax (underscore IDs, unquoted pipes). `sanitizeMermaid()` in Architecture.tsx handles: `flowchart_TD_` → `flowchart TD\n    `, bracket labels with pipes/quotes
- The `ANALYSIS_SCHEMA` in `server/services/ai.ts` is passed to the AI as `response_schema` for structured output

### Environment variables (.env)
```
OPENAI_API_KEY=sk-...          # DeepSeek API key
OPENAI_BASE_URL=https://api.deepseek.com
GITHUB_TOKEN=github_pat_...    # Optional but strongly recommended; anonymous GitHub API = 60 req/hr limit
```