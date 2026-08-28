# Vectorlane — AI Project Execution Workspace

Full-stack project and task platform for the Innovation Hacks internship. The browser speaks only to the Express REST API; MongoDB is accessed exclusively by the backend.

## What it includes

- Token-based registration, login, logout, session restoration, and protected workspace routes.
- Responsive developer-focused dashboard with live project/task metrics, health progress, search, filters, loading, empty, and error states.
- Project and task CRUD: project ownership/status; task assignment, priority, due date, status, and deletion.
- MongoDB/Mongoose schemas and references for Users, Projects, and Tasks; request validation and centralized HTTP error responses.
- AI Copilot: converts an execution goal into task drafts and commits a selected draft into a project. With `MISTRAL_API_KEY`, it calls Mistral's Chat Completions API using `mistral-small-2506`; without it, it uses a clearly identified local planning fallback so the app remains usable offline.

## Architecture

`React + Vite → REST API (Express) → MongoDB (Mongoose)`

## Setup

1. Install dependencies: `npm install` and `cd backend && npm install`.
2. Copy `backend/.env.example` to `backend/.env`, set `MONGODB_URI` and a long `JWT_SECRET`. Set `MISTRAL_API_KEY`; `MISTRAL_MODEL` defaults to `mistral-small-2506`.
3. Copy `.env.example` to `.env` and set `VITE_API_URL` if the API is not at `http://localhost:5000/api`.
4. Start MongoDB, then run `npm run dev` in `backend` and `npm run dev` in the repository root.

No credentials are committed. Both `.env` files are ignored.

## API

All workspace endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/auth/register`, `/api/auth/login` | Authentication |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/users` | User listing/creation |
| GET/POST | `/api/projects` | Project listing/creation |
| GET/PUT/DELETE | `/api/projects/:id` | Project read/update/delete |
| GET/POST | `/api/tasks` | Task listing/creation |
| GET/PUT/DELETE | `/api/tasks/:id` | Task read/update/delete |
| PATCH | `/api/tasks/:id/status` | Task status update |
| POST | `/api/ai/generate-tasks` | Generate task drafts from `{ goal, count }` |
| GET | `/api/ai/priorities` | Priority suggestions |

Successful endpoints return `{ success: true, data }`. Validation errors use 400, unauthenticated requests 401, missing references/resources 404, duplicates 409, and unexpected errors 500.

## Verification

Run `npm run build` for the frontend and `npm run lint`. Start the backend with a valid MongoDB connection and exercise authentication, CRUD, and AI endpoints through the UI or API client.
