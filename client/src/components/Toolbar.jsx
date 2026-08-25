import { PRIORITIES, STATUSES } from "../lib/constants";

function MultiSelect({ label, options, selected, onChange }) {
  const toggle = (opt) => {
    onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]);
  };
  return (
    <div className="group relative">
      <button className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
        {label}
        {selected.length > 0 && (
          <span className="ml-1.5 rounded-full bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold text-white dark:bg-white dark:text-neutral-900">
            {selected.length}
          </span>
        )}
      </button>
      <div className="invisible absolute left-0 z-10 mt-1 w-44 rounded-md border border-neutral-200 bg-white p-1 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 dark:border-neutral-700 dark:bg-neutral-900">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
              className="rounded"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export function Toolbar({
  view,
  setView,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  tagFilter,
  setTagFilter,
  allTags,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  onNewTask,
  darkMode,
  setDarkMode,
  searchInputRef,
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
          {["table", "board"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${
                view === v
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle dark mode"
            className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
          <button
            onClick={onNewTask}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            + New task
            <span className="ml-1.5 text-xs opacity-60">n</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={searchInputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks... ( / )"
          className="w-56 rounded-md border border-neutral-200 px-3 py-1.5 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-500"
        />

        <MultiSelect label="Status" options={STATUSES} selected={statusFilter} onChange={setStatusFilter} />
        <MultiSelect label="Priority" options={PRIORITIES} selected={priorityFilter} onChange={setPriorityFilter} />
        {allTags.length > 0 && (
          <MultiSelect label="Tags" options={allTags} selected={tagFilter} onChange={setTagFilter} />
        )}

        <div className="ml-auto flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border border-neutral-200 px-2 py-1.5 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          >
            <option value="createdAt">Created date</option>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
          </select>
          <button
            onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
            title="Toggle sort direction"
            className="rounded-md border border-neutral-200 px-2 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>
    </div>
  );
}
