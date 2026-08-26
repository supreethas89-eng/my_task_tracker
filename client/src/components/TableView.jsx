import { useState } from "react";
import { TagChip } from "./Badge";
import { PRIORITIES, PRIORITY_STYLES, STATUSES } from "../lib/constants";

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TableView({ tasks, onOpen, onUpdate, onCreate }) {
  const [quickTitle, setQuickTitle] = useState("");

  const handleQuickAdd = async (e) => {
    if (e.key !== "Enter" || !quickTitle.trim()) return;
    await onCreate({ title: quickTitle.trim() });
    setQuickTitle("");
  };

  const toggleDone = (task) => {
    const nextStatus = task.status === "Done" ? "Not Started" : "Done";
    onUpdate(task.id, { status: nextStatus });
  };

  return (
    <div className="overflow-x-auto px-6 py-4">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-400 dark:border-neutral-800">
            <th className="w-8 py-2 pr-2"></th>
            <th className="py-2 pr-4 font-medium">Title</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-4 font-medium">Priority</th>
            <th className="py-2 pr-4 font-medium">Due date</th>
            <th className="py-2 pr-4 font-medium">Tags</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="group border-b border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800/60 dark:hover:bg-neutral-900"
            >
              <td className="py-2 pr-2">
                <input
                  type="checkbox"
                  checked={task.status === "Done"}
                  onChange={() => toggleDone(task)}
                  className="rounded"
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td
                className={`cursor-pointer py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100 ${
                  task.status === "Done" ? "text-neutral-400 line-through dark:text-neutral-500" : ""
                }`}
                onClick={() => onOpen(task)}
              >
                {task.title}
              </td>
              <td className="py-2 pr-4" onClick={(e) => e.stopPropagation()}>
                <select
                  value={task.status}
                  onChange={(e) => onUpdate(task.id, { status: e.target.value })}
                  className="cursor-pointer border-none bg-transparent text-xs outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2 pr-4" onClick={(e) => e.stopPropagation()}>
                <select
                  value={task.priority}
                  onChange={(e) => onUpdate(task.id, { priority: e.target.value })}
                  className={`cursor-pointer rounded-full border-none px-2 py-0.5 text-xs font-medium outline-none ${
                    PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium
                  }`}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2 pr-4 text-neutral-500 dark:text-neutral-400">
                {fmtDate(task.dueDate) || <span className="text-neutral-300 dark:text-neutral-600">—</span>}
              </td>
              <td className="py-2 pr-4">
                <div className="flex flex-wrap gap-1">
                  {(task.tags || []).map((tag) => (
                    <TagChip key={tag} tag={tag} />
                  ))}
                </div>
              </td>
            </tr>
          ))}

          <tr>
            <td className="py-2 pr-2 text-neutral-300">+</td>
            <td colSpan={5} className="py-2">
              <input
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                onKeyDown={handleQuickAdd}
                placeholder="New task title, press Enter to add..."
                className="w-full border-none bg-transparent text-sm text-neutral-500 outline-none placeholder:text-neutral-400 dark:text-neutral-400"
              />
            </td>
          </tr>
        </tbody>
      </table>

      {tasks.length === 0 && (
        <p className="py-8 text-center text-sm text-neutral-400">No tasks match your filters.</p>
      )}
    </div>
  );
}
