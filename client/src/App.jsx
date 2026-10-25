import { useEffect, useMemo, useRef, useState } from "react";
import { Toolbar } from "./components/Toolbar";
import { TableView } from "./components/TableView";
import { BoardView } from "./components/BoardView";
import { TaskModal } from "./components/TaskModal";
import { useTasks } from "./hooks/useTasks";

const AGE_OPTIONS = [
  [0, "Any time"],
  [1, "Older than 1 month"],
  [3, "Older than 3 months"],
  [6, "Older than 6 months"],
  [12, "Older than 1 year"],
];

// Tasks completed before the completedAt field existed fall back to updatedAt.
const completedDate = (t) => new Date(t.completedAt || t.updatedAt);

export default function App() {
  const {
    tasks,
    filteredTasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    deleteTasks,
    allTags,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    tagFilter,
    setTagFilter,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    gitPending,
    gitCommitting,
    commitToGit,
  } = useTasks();

  const [page, setPage] = useState("active");
  const [view, setView] = useState("table");
  const [olderThan, setOlderThan] = useState(0);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
  );
  const searchInputRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (typing) return;
      if (e.key === "n") {
        e.preventDefault();
        openNewTask();
      } else if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const completedCount = useMemo(() => tasks.filter((t) => t.status === "Done").length, [tasks]);
  const pageTasks = useMemo(() => {
    if (page !== "completed") return filteredTasks.filter((t) => t.status !== "Done");
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - olderThan);
    return filteredTasks.filter((t) => t.status === "Done" && (!olderThan || completedDate(t) < cutoff));
  }, [filteredTasks, page, olderThan]);

  const handleBulkDelete = async () => {
    const n = pageTasks.length;
    if (!window.confirm(`Permanently delete ${n} completed task${n === 1 ? "" : "s"}?`)) return;
    setBulkDeleting(true);
    try {
      await deleteTasks(pageTasks.map((t) => t.id));
    } catch (e) {
      window.alert(`Delete failed: ${e.message}`);
    } finally {
      setBulkDeleting(false);
    }
  };

  const switchPage = (p) => {
    setPage(p);
    setStatusFilter([]);
  };

  const openNewTask = () => {
    setActiveTask(null);
    setModalOpen(true);
  };

  const openTask = (task) => {
    setActiveTask(task);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSave = async (data) => {
    if (activeTask) {
      await updateTask(activeTask.id, data);
    } else {
      await createTask(data);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    setModalOpen(false);
  };

  const [gitError, setGitError] = useState(null);

  const handleCommit = async () => {
    setGitError(null);
    try {
      await commitToGit("Update tasks");
    } catch (e) {
      setGitError(e.message);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col">
      <header className="px-6 pt-8">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Tasks</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          A Notion-style task tracker, backed by Git.
        </p>
      </header>

      <nav className="mt-4 flex gap-4 border-b border-neutral-200 px-6 dark:border-neutral-800">
        {[
          ["active", "Active", tasks.length - completedCount],
          ["completed", "Completed", completedCount],
        ].map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => switchPage(key)}
            className={`-mb-px border-b-2 px-1 pb-2 text-sm font-medium transition ${
              page === key
                ? "border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            {label}
            <span className="ml-1.5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              {count}
            </span>
          </button>
        ))}
      </nav>

      <Toolbar
        view={view}
        setView={setView}
        page={page}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        allTags={allTags}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDir={sortDir}
        setSortDir={setSortDir}
        onNewTask={openNewTask}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        searchInputRef={searchInputRef}
        gitPending={gitPending}
        gitCommitting={gitCommitting}
        onCommit={handleCommit}
      />

      <main className="flex-1">
        {error && (
          <p className="mx-6 mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        {gitError && (
          <p className="mx-6 mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-300">
            Git commit failed: {gitError}
          </p>
        )}

        {page === "completed" && !loading && (
          <div className="flex items-center gap-2 px-6 pt-4">
            <select
              value={olderThan}
              onChange={(e) => setOlderThan(Number(e.target.value))}
              className="rounded-md border border-neutral-200 px-2 py-1.5 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
              {AGE_OPTIONS.map(([months, label]) => (
                <option key={months} value={months}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={handleBulkDelete}
              disabled={pageTasks.length === 0 || bulkDeleting}
              className="rounded-md border border-red-200 px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
            >
              {bulkDeleting ? "Deleting..." : `Delete ${pageTasks.length} shown`}
            </button>
          </div>
        )}

        {loading ? (
          <p className="px-6 py-8 text-sm text-neutral-400">Loading tasks...</p>
        ) : page === "completed" || view === "table" ? (
          <TableView
            tasks={pageTasks}
            allowQuickAdd={page === "active"}
            onOpen={openTask}
            onUpdate={updateTask}
            onCreate={createTask}
            onDelete={deleteTask}
          />
        ) : (
          <BoardView
            tasks={pageTasks}
            onOpen={openTask}
            onUpdate={updateTask}
            onCreate={createTask}
            onDelete={deleteTask}
          />
        )}
      </main>

      {modalOpen && (
        <TaskModal task={activeTask} onClose={closeModal} onSave={handleSave} onDelete={handleDelete} />
      )}
    </div>
  );
}
