import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const PRIORITY_ORDER = { Urgent: 0, High: 1, Medium: 2, Low: 3 };

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState([]);
  const [tagFilter, setTagFilter] = useState([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [gitPending, setGitPending] = useState(false);
  const [gitCommitting, setGitCommitting] = useState(false);

  const refreshGitStatus = useCallback(async () => {
    try {
      const { pending } = await api.gitStatus();
      setGitPending(pending);
    } catch {
      // ignore - git status is best-effort
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.list();
      setTasks(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    refreshGitStatus();
  }, [refresh, refreshGitStatus]);

  const createTask = useCallback(async (task) => {
    const created = await api.create(task);
    setTasks((prev) => [...prev, created]);
    refreshGitStatus();
    return created;
  }, [refreshGitStatus]);

  const updateTask = useCallback(async (id, patch) => {
    const prevTasks = tasks;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    try {
      const updated = await api.update(id, patch);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      refreshGitStatus();
      return updated;
    } catch (e) {
      setTasks(prevTasks);
      throw e;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, refreshGitStatus]);

  const deleteTask = useCallback(async (id) => {
    const prevTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.remove(id);
      refreshGitStatus();
    } catch (e) {
      setTasks(prevTasks);
      throw e;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, refreshGitStatus]);

  const commitToGit = useCallback(async (message) => {
    setGitCommitting(true);
    try {
      const { committed } = await api.gitCommit(message);
      setGitPending(false);
      return committed;
    } finally {
      setGitCommitting(false);
    }
  }, []);

  const allTags = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => (t.tags || []).forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter.length) {
      result = result.filter((t) => statusFilter.includes(t.status));
    }
    if (priorityFilter.length) {
      result = result.filter((t) => priorityFilter.includes(t.priority));
    }
    if (tagFilter.length) {
      result = result.filter((t) => (t.tags || []).some((tag) => tagFilter.includes(tag)));
    }

    const sorted = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "dueDate") {
        const av = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bv = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        cmp = av - bv;
      } else if (sortBy === "priority") {
        cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      } else {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [tasks, search, statusFilter, priorityFilter, tagFilter, sortBy, sortDir]);

  return {
    tasks,
    filteredTasks,
    loading,
    error,
    refresh,
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
  };
}
