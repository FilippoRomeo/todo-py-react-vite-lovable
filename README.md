# Tiny To-Do — FastAPI + Postgres + React/TS

A minimal, polished to-do app.

- **Features:** create tasks, list, edit title, toggle complete, delete  
- **Stack:** FastAPI · SQLAlchemy · Pydantic · Postgres (Docker) · React + TypeScript (Vite)

---

## 🚀 Quick Start

### 1) Database (Docker)
```bash
# from project root
docker compose up -d
```

### 2) Backend (Conda env)
```bash
# from project root
cd backend
cp .env.example .env

# create + activate env
conda create -n todos python=3.11 -y
conda activate todos

# install deps
pip install -r requirements.txt

# run API (from project root so module imports resolve)
cd ..
uvicorn backend.app:app --reload
# API: http://127.0.0.1:8000
```

### 3) Frontend (Vite + React + TS)
```bash
cd frontend
cp .env.example .env   # ensure VITE_API_BASE_URL=http://127.0.0.1:8000
npm install
npm run dev
# App: http://127.0.0.1:5173
```

---

## 🔌 Environment

**/backend/.env**
```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/todos
ALLOW_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**/frontend/.env**
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 🛠️ API Overview

| Method | Endpoint      | Body                                    | Notes                                          |
|-------:|---------------|-----------------------------------------|------------------------------------------------|
| GET    | `/health`     | —                                       | Health check                                   |
| GET    | `/tasks`      | —                                       | List tasks (newest first)                      |
| POST   | `/tasks`      | `{ "title": "…" }`                      | 422 if empty/whitespace title                  |
| PATCH  | `/tasks/{id}` | `{ "title"?: "…", "completed"?: boolean }` | At least one field required (422)           |
| DELETE | `/tasks/{id}` | —                                       | Idempotent; returns 204                        |

**Example**
```bash
curl -X POST http://127.0.0.1:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Ship tiny todo"}'
```

---

## 🧪 Testing

Backend tests use `pytest` + `httpx` TestClient.

```bash
# from project root (ensures imports work)
conda activate todos
pytest -q backend
```

---

## 🧱 Project Structure
```text
/backend
  app.py            # FastAPI app & routes
  db.py             # SQLAlchemy engine/session
  models.py         # Task model
  schemas.py        # Pydantic request/response
  tests/
    test_api.py
  .env.example
/frontend
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  src/
    main.tsx
    App.tsx
    api.ts
    components/
      LovableTaskUI.tsx
  .env.example
/docker-compose.yml
/README.md
```

---

## ✨ Notes

- Tables are created on startup via `create_all` to keep setup minimal.
- Optimistic UI updates for a snappy feel; automatic rollback on API errors.
- Stop DB with `docker compose down` (data persists via named volume).
- If ports conflict, adjust Vite/uvicorn or `docker-compose.yml` ports as needed.