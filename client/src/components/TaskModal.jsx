import { useEffect, useState } from "react";
import { PRIORITIES, STATUSES } from "../lib/constants";

const emptyDraft = {
  title: "",
  description: "",
  status: "Not Started",
  priority: "Medium",
  dueDate: "",
  tags: "",
  moreDetails: "",
};

export function TaskModal({ task, onClose, onSave, onDelete }) {
  const [draft, setDraft] = useState(emptyDraft);

  useEffect(() => {
    if (task) {
      setDraft({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "Not Started",
        priority: task.priority || "Medium",
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
        tags: (task.tags || []).join(", "),
        moreDetails: task.moreDetails || "",
      });
    } else {
      setDraft(emptyDraft);
    }
  }, [task]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  const handleSave = () => {
    if (!draft.title.trim()) return;
    onSave({
      title: draft.title.trim(),
      description: draft.description,
      status: draft.status,
      priority: draft.priority,
      dueDate: draft.dueDate || null,
      tags: draft.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      moreDetails: draft.moreDetails,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={draft.title}
          onChange={set("title")}
          placeholder="Task title"
          className="w-full border-none bg-transparent text-xl font-semibold text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
        />

        <textarea
          value={draft.description}
          onChange={set("description")}
          placeholder="Add a description..."
          rows={3}
          className="mt-2 w-full resize-none rounded-md border-none bg-transparent text-sm text-neutral-600 outline-none placeholder:text-neutral-400 dark:text-neutral-300"
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Status
            <select
              value={draft.status}
              onChange={set("status")}
              className="rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Priority
            <select
              value={draft.priority}
              onChange={set("priority")}
              className="rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Due date
            <input
              type="date"
              value={draft.dueDate}
              onChange={set("dueDate")}
              className="rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Tags (comma separated)
            <input
              value={draft.tags}
              onChange={set("tags")}
              placeholder="design, urgent"
              className="rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          More details
          <textarea
            value={draft.moreDetails}
            onChange={set("moreDetails")}
            placeholder="Any additional notes, links, or context..."
            rows={3}
            className="w-full resize-none rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-800 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>

        <div className="mt-6 flex items-center justify-between">
          {task ? (
            <button
              onClick={() => onDelete(task.id)}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!draft.title.trim()}
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {task ? "Save" : "Create task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
