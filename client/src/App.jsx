import { useEffect, useRef, useState } from "react";
import { Toolbar } from "./components/Toolbar";
import { TableView } from "./components/TableView";
import { BoardView } from "./components/BoardView";
import { TaskModal } from "./components/TaskModal";
import { useTasks } from "./hooks/useTasks";

export default function App() {
  const {
    filteredTasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
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

  const [view, setView] = useState("table");
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

      <Toolbar
        view={view}
        setView={setView}
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

        {loading ? (
          <p className="px-6 py-8 text-sm text-neutral-400">Loading tasks...</p>
        ) : view === "table" ? (
          <TableView
            tasks={filteredTasks}
            onOpen={openTask}
            onUpdate={updateTask}
            onCreate={createTask}
            onDelete={deleteTask}
          />
        ) : (
          <BoardView
            tasks={filteredTasks}
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
