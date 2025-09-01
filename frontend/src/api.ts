const BASE =
  import.meta.env.VITE_API_BASE_URL?.toString() || "http://127.0.0.1:8000";

export type Task = {
  id: number;
  title: string;
  completed: boolean;
};

export async function apiList(): Promise<Task[]> {
  const r = await fetch(`${BASE}/tasks`);
  if (!r.ok) throw new Error(`List failed: ${r.status}`);
  return r.json();
}

export async function apiCreate(title: string): Promise<Task> {
  const r = await fetch(`${BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!r.ok) {
    const msg = (await r.json().catch(() => ({}))).detail ?? r.statusText;
    throw new Error(typeof msg === "string" ? msg : "Create failed");
  }
  return r.json();
}

export async function apiUpdate(
  id: number,
  patch: Partial<Pick<Task, "title" | "completed">>
): Promise<Task> {
  const r = await fetch(`${BASE}/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!r.ok) {
    const msg = (await r.json().catch(() => ({}))).detail ?? r.statusText;
    throw new Error(typeof msg === "string" ? msg : `Update failed: ${r.status}`);
  }
  return r.json();
}

export async function apiToggle(id: number, completed: boolean): Promise<Task> {
  return apiUpdate(id, { completed });
}

export async function apiDelete(id: number): Promise<void> {
  const r = await fetch(`${BASE}/tasks/${id}`, { method: "DELETE" });
  if (!r.ok && r.status !== 204) throw new Error(`Delete failed: ${r.status}`);
}
