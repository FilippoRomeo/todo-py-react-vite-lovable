import React from "react";
import type { Task } from "../api";

type Props = {
  tasks: Task[];
  onToggle: (t: Task) => void;
  onDelete: (t: Task) => void;
  onRename: (t: Task, title: string) => void;
};

export default function LovableTaskUI({
  tasks,
  onToggle,
  onDelete,
  onRename,
}: Props) {
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [value, setValue] = React.useState("");

  function startEdit(t: Task) {
    setEditingId(t.id);
    setValue(t.title);
  }
  function cancelEdit() {
    setEditingId(null);
    setValue("");
  }
  function saveEdit(t: Task) {
    const v = value.trim();
    if (!v) return;
    onRename(t, v);
    cancelEdit();
  }

  return (
    <div className="list">
      {tasks.map((t) => {
        const isEditing = editingId === t.id;
        return (
          <div className="item" key={t.id}>
            <input
              className="checkbox"
              type="checkbox"
              checked={t.completed}
              onChange={() => onToggle(t)}
              aria-label={t.completed ? "Mark incomplete" : "Mark complete"}
            />

            <div className="titleLine" style={{ width: "100%" }}>
              {isEditing ? (
                <input
                  className="input"
                  style={{ width: "100%" }}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  maxLength={255}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(t);
                    if (e.key === "Escape") cancelEdit();
                  }}
                />
              ) : (
                <span className={t.completed ? "completed" : ""}>{t.title}</span>
              )}
            </div>

            <div className="right">
              {!isEditing ? (
                <>
                  <span className="pill">{t.completed ? "Done" : "Open"}</span>
                  <button className="del" onClick={() => startEdit(t)} aria-label="Edit">
                    Edit
                  </button>
                  <button className="del" onClick={() => onDelete(t)} aria-label="Delete">
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button className="del" onClick={() => saveEdit(t)} aria-label="Save">
                    Save
                  </button>
                  <button className="del" onClick={cancelEdit} aria-label="Cancel">
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
