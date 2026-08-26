import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";
import { readTasks, writeTasks } from "./tasksStore.js";
import { commitTasksFile, hasPendingChanges } from "./gitPersist.js";

const app = express();
const PORT = process.env.PORT || 4000;

const STATUSES = ["Not Started", "In Progress", "Blocked", "Done"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

app.use(cors());
app.use(express.json());

function validateTaskInput(body, { partial = false } = {}) {
  const errors = [];
  if (!partial || body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim() === "") {
      errors.push("title is required and must be a non-empty string");
    }
  }
  if (body.status !== undefined && !STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${STATUSES.join(", ")}`);
  }
  if (body.priority !== undefined && !PRIORITIES.includes(body.priority)) {
    errors.push(`priority must be one of: ${PRIORITIES.join(", ")}`);
  }
  if (body.tags !== undefined && !Array.isArray(body.tags)) {
    errors.push("tags must be an array of strings");
  }
  return errors;
}

app.get("/tasks", async (req, res) => {
  const tasks = await readTasks();
  res.json(tasks);
});

app.post("/tasks", async (req, res) => {
  const errors = validateTaskInput(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const now = new Date().toISOString();
  const task = {
    id: uuid(),
    title: req.body.title.trim(),
    description: req.body.description || "",
    status: req.body.status || "Not Started",
    priority: req.body.priority || "Medium",
    dueDate: req.body.dueDate || null,
    tags: req.body.tags || [],
    createdAt: now,
    updatedAt: now,
  };

  const tasks = await readTasks();
  tasks.push(task);
  await writeTasks(tasks);

  res.status(201).json(task);
});

app.put("/tasks/:id", async (req, res) => {
  const errors = validateTaskInput(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ errors });

  const tasks = await readTasks();
  const idx = tasks.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Task not found" });

  const existing = tasks[idx];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  if (typeof updated.title === "string") updated.title = updated.title.trim();

  tasks[idx] = updated;
  await writeTasks(tasks);

  res.json(updated);
});

app.delete("/tasks/:id", async (req, res) => {
  const tasks = await readTasks();
  const idx = tasks.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Task not found" });

  const [removed] = tasks.splice(idx, 1);
  await writeTasks(tasks);

  res.status(204).end();
});

app.get("/git/status", async (req, res) => {
  const pending = await hasPendingChanges();
  res.json({ pending });
});

app.post("/git/commit", async (req, res) => {
  try {
    const committed = await commitTasksFile(req.body?.message || "Update tasks");
    res.json({ committed });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Task tracker API listening on http://localhost:${PORT}`);
});
