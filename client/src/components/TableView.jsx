import { useState } from "react";
import { TagChip } from "./Badge";
import { PRIORITIES, PRIORITY_STYLES, STATUSES } from "../lib/constants";

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TableView({ tasks, onOpen, onUpdate, onCreate, onDelete }) {
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
            <th className="py-2 pr-4 font-medium">More details</th>
            <th className="w-8 py-2"></th>
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
              <td
                className="max-w-[220px] cursor-pointer truncate py-2 pr-4 text-neutral-500 dark:text-neutral-400"
                onClick={() => onOpen(task)}
                title={task.moreDetails || ""}
              >
                {task.moreDetails || <span className="text-neutral-300 dark:text-neutral-600">—</span>}
              </td>
              <td className="py-2 pr-2 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  title="Delete task"
                  className="invisible rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600 group-hover:visible dark:hover:bg-red-950 dark:hover:text-red-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path
                      fillRule="evenodd"
                      d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}

          <tr>
            <td className="py-2 pr-2 text-neutral-300">+</td>
            <td colSpan={7} className="py-2">
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
