# Paceflow Task 2 — Users, Projects & Tasks REST API

Node/Express/MongoDB API for the Innovation Hacks internship Task 2. It deliberately has no authentication or frontend code.

## Features

- Users, projects, and tasks CRUD with Mongoose relationships and timestamps
- Request validation with `express-validator`
- Populated project owner and task project/assignee responses
- Consistent JSON errors, CORS, health check, and unknown-route handling

## Stack

Node.js, Express, MongoDB, Mongoose, dotenv, cors, express-validator, nodemon.

## Structure

`src/config` database connection; `models` Mongoose schemas; `controllers` API logic; `routes` endpoint definitions; `validators` request rules; `middleware` validation and errors.

## Setup

1. Install and start MongoDB locally, or provide a MongoDB Atlas URI.
2. Copy `.env.example` to `.env` and set `MONGODB_URI`.
3. Run `npm install`, then `npm run dev` (development) or `npm start` (production).

Environment variables: `PORT` (defaults to 5000), `MONGODB_URI`, `CLIENT_ORIGIN` (defaults to `http://localhost:5173`). `.env` is ignored by Git; `.env.example` contains placeholders only.

## Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | API health |
| POST, GET | `/api/users` | Create/list users |
| GET, DELETE | `/api/users/:id` | Read/delete user |
| POST, GET | `/api/projects` | Create/list projects |
| GET, PUT, DELETE | `/api/projects/:id` | Read/update/delete project |
| POST, GET | `/api/tasks` | Create/list tasks |
| GET, PUT, DELETE | `/api/tasks/:id` | Read/update/delete task |
| PATCH | `/api/tasks/:id/status` | Update task status |

## Examples

```json
POST /api/users
{ "name": "Purvika R", "email": "purvika@example.com", "role": "developer" }

POST /api/projects
{ "name": "Paceflow", "owner": "<userId>", "status": "active" }

POST /api/tasks
{ "title": "Design API", "project": "<projectId>", "assignee": "<userId>", "priority": "high" }
```

Successful responses use `{ "success": true, "data": ... }`; health returns `{ "success": true, "message": "API is running" }`. Validation responses are `400` and include `errors`; missing resources are `404`, duplicate emails `409`, invalid IDs `400`, and unexpected server/database errors `500`.

## Frontend integration

Task 1 can later call this API at `http://localhost:5000/api`; CORS already permits the default Vite origin.
