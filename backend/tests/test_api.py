import os

# Use a local SQLite file for tests BEFORE importing the app
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from fastapi.testclient import TestClient  # noqa: E402
from backend.app import app  # noqa: E402
from backend.db import Base, engine  # noqa: E402

# Fresh schema for the test database
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_create_list_toggle():
    # Create
    r = client.post("/tasks", json={"title": "Write tests"})
    assert r.status_code == 201
    tid = r.json()["id"]
    assert r.json()["title"] == "Write tests"
    assert r.json()["completed"] is False

    # List
    r = client.get("/tasks")
    assert r.status_code == 200
    items = r.json()
    assert any(t["id"] == tid for t in items)

    # Toggle complete via PATCH
    r = client.patch(f"/tasks/{tid}", json={"completed": True})
    assert r.status_code == 200
    assert r.json()["completed"] is True

def test_update_title_and_validation():
    # Create a task to rename
    r = client.post("/tasks", json={"title": "Old name"})
    tid = r.json()["id"]

    # Rename title
    r = client.patch(f"/tasks/{tid}", json={"title": "New name"})
    assert r.status_code == 200
    assert r.json()["title"] == "New name"

    # Empty title should 422
    r = client.patch(f"/tasks/{tid}", json={"title": ""})
    assert r.status_code == 422

    # No fields should 422 (validator enforces at least one)
    r = client.patch(f"/tasks/{tid}", json={})
    assert r.status_code == 422
