import os
from typing import List

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import Base, engine, SessionLocal
from .models import Task
from .schemas import TaskIn, TaskOut, TaskPatch

# Create tables on startup (simple for take-home; Alembic optional later)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Todos API", version="0.1.0")

# CORS for local frontend
origins_env = os.getenv("ALLOW_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [o.strip() for o in origins_env.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/tasks", response_model=List[TaskOut])
def list_tasks(db: Session = Depends(get_db)):
    stmt = select(Task).order_by(Task.created_at.desc(), Task.id.desc())
    rows = db.execute(stmt).scalars().all()
    return rows

@app.post("/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskIn, db: Session = Depends(get_db)):
    title = payload.title.strip()
    if not title:
        # Redundant guard; also enforced by Pydantic min_length
        raise HTTPException(status_code=422, detail="Title cannot be empty.")
    task = Task(title=title, completed=False)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@app.patch("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskPatch, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    changed = False

    if payload.title is not None:
        title = payload.title.strip()
        if not title:
            raise HTTPException(status_code=422, detail="Title cannot be empty.")
        task.title = title
        changed = True

    if payload.completed is not None:
        task.completed = payload.completed
        changed = True

    if changed:
        db.add(task)
        db.commit()
        db.refresh(task)

    return task

@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        # Idempotent delete: 204 even if not found
        return
    db.delete(task)
    db.commit()
