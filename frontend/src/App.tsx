import React from "react";
import LovableTaskUI from "./components/LovableTaskUI";
import { apiCreate, apiDelete, apiList, apiToggle, apiUpdate, type Task } from "./api";

export default function App() {
  const [tasks, setTasks] = React.useState<Task[] | null>(null);
  const [title, setTitle] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const data = await apiList();
      setTasks(data);
    } catch (e: any) {
      setError(e.message || "Failed to load tasks.");
      setTasks([]);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      setError("Please enter a title.");
      return;
    }
    setBusy(true);
    setError(null);

    let tempId: number | null = null;

    try {
      // optimistic: add a temp task while waiting
      tempId = -Date.now(); // negative to avoid id collision
      const temp: Task = { id: tempId, title: t, completed: false };
      setTasks((cur) => (cur ? [temp, ...cur] : [temp]));
      setTitle("");

      const created = await apiCreate(t);
      setTasks((cur) => {
        const withoutTemp = (cur || []).filter((x) => x.id !== tempId);
        return [created, ...withoutTemp];
      });
    } catch (e: any) {
      setError(e.message || "Failed to add task.");
      if (tempId !== null) {
        setTasks((cur) => (cur || []).filter((x) => x.id !== tempId));
      }
    } finally {
      setBusy(false);
    }
  }

  async function toggleTask(t: Task) {
    setError(null);
    // optimistic toggle
    setTasks((cur) =>
      (cur || []).map((x) => (x.id === t.id ? { ...x, completed: !x.completed } : x))
    );
    try {
      const updated = await apiToggle(t.id, !t.completed);
      setTasks((cur) => (cur || []).map((x) => (x.id === t.id ? updated : x)));
    } catch (e: any) {
      setError(e.message || "Failed to update task.");
      // rollback
      setTasks((cur) =>
        (cur || []).map((x) => (x.id === t.id ? { ...x, completed: t.completed } : x))
      );
    }
  }

  async function renameTask(t: Task, newTitle: string) {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      setError("Title cannot be empty.");
      return;
    }
    setError(null);
    const prev = tasks;
    // optimistic rename
    setTasks((cur) => (cur || []).map((x) => (x.id === t.id ? { ...x, title: trimmed } : x)));
    try {
      const updated = await apiUpdate(t.id, { title: trimmed });
      setTasks((cur) => (cur || []).map((x) => (x.id === t.id ? updated : x)));
    } catch (e: any) {
      setError(e.message || "Failed to rename task.");
      // rollback
      setTasks(prev || []);
    }
  }

  async function deleteTask(t: Task) {
    setError(null);
    // optimistic delete
    const prev = tasks;
    setTasks((cur) => (cur || []).filter((x) => x.id !== t.id));
    try {
      await apiDelete(t.id);
    } catch (e: any) {
      setError(e.message || "Failed to delete task.");
      // rollback
      setTasks(prev || []);
    }
  }

  const loading = tasks === null;

  return (
    <div className="card">
      <header className="header">
        <div>
          <div className="title">Cambium – Tiny To-Do</div>
          <div className="sub">
            Minimal CRUD: create, list, toggle, update title, delete — FastAPI + Postgres
          </div>
        </div>
        <div className="pill">
          API: {import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"}
        </div>
      </header>

      <div className="content">
        {error && <div className="banner" role="alert">{error}</div>}

        <form className="row" onSubmit={addTask}>
          <input
            className="input"
            placeholder="Add a new task…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={busy}
            maxLength={255}
          />
          <button className="btn" disabled={busy}>
            {busy ? "Adding…" : "Add"}
          </button>
        </form>

        {loading ? (
          <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
            <div className="skeleton"></div>
            <div className="skeleton"></div>
            <div className="skeleton"></div>
          </div>
        ) : tasks && tasks.length > 0 ? (
          <LovableTaskUI
            tasks={tasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onRename={renameTask}
          />
        ) : (
          <div className="empty" aria-live="polite">
            No tasks yet — add your first one above.
          </div>
        )}
      </div>
    </div>
  );
}
