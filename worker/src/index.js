const STATUSES = ["Not Started", "In Progress", "Blocked", "Done"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const TASKS_KEY = "tasks";
const COMMITTED_KEY = "committed_tasks";

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, env, init = {}) {
  return new Response(data === null ? null : JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(env),
      ...(init.headers || {}),
    },
  });
}

async function readTasks(env) {
  const raw = await env.TASKS_KV.get(TASKS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeTasks(env, tasks) {
  await env.TASKS_KV.put(TASKS_KEY, JSON.stringify(tasks));
}

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

function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function githubGetFile(env) {
  const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${env.GITHUB_FILE_PATH}?ref=${env.GITHUB_BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "User-Agent": "task-tracker-worker",
      Accept: "application/vnd.github+json",
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function githubCommitTasks(env, tasks, message) {
  const existing = await githubGetFile(env);
  const content = JSON.stringify(tasks, null, 2) + "\n";
  const body = {
    message,
    content: bytesToBase64(new TextEncoder().encode(content)),
    branch: env.GITHUB_BRANCH,
    ...(existing?.sha ? { sha: existing.sha } : {}),
  };
  const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${env.GITHUB_FILE_PATH}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "User-Agent": "task-tracker-worker",
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub commit failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(env) });
    }

    try {
      if (pathname === "/tasks" && method === "GET") {
        return json(await readTasks(env), env);
      }

      if (pathname === "/tasks" && method === "POST") {
        const body = await request.json();
        const errors = validateTaskInput(body);
        if (errors.length) return json({ errors }, env, { status: 400 });

        const now = new Date().toISOString();
        const task = {
          id: crypto.randomUUID(),
          title: body.title.trim(),
          description: body.description || "",
          status: body.status || "Not Started",
          priority: body.priority || "Medium",
          dueDate: body.dueDate || null,
          tags: body.tags || [],
          moreDetails: body.moreDetails || "",
          createdAt: now,
          updatedAt: now,
        };
        const tasks = await readTasks(env);
        tasks.push(task);
        await writeTasks(env, tasks);
        return json(task, env, { status: 201 });
      }

      const taskIdMatch = pathname.match(/^\/tasks\/([^/]+)$/);
      if (taskIdMatch && method === "PUT") {
        const id = taskIdMatch[1];
        const body = await request.json();
        const errors = validateTaskInput(body, { partial: true });
        if (errors.length) return json({ errors }, env, { status: 400 });

        const tasks = await readTasks(env);
        const idx = tasks.findIndex((t) => t.id === id);
        if (idx === -1) return json({ error: "Task not found" }, env, { status: 404 });

        const existing = tasks[idx];
        const updated = {
          ...existing,
          ...body,
          id: existing.id,
          createdAt: existing.createdAt,
          updatedAt: new Date().toISOString(),
        };
        if (typeof updated.title === "string") updated.title = updated.title.trim();

        tasks[idx] = updated;
        await writeTasks(env, tasks);
        return json(updated, env);
      }

      if (taskIdMatch && method === "DELETE") {
        const id = taskIdMatch[1];
        const tasks = await readTasks(env);
        const idx = tasks.findIndex((t) => t.id === id);
        if (idx === -1) return json({ error: "Task not found" }, env, { status: 404 });

        tasks.splice(idx, 1);
        await writeTasks(env, tasks);
        return json(null, env, { status: 204 });
      }

      if (pathname === "/git/status" && method === "GET") {
        const [tasks, committedRaw] = await Promise.all([
          readTasks(env),
          env.TASKS_KV.get(COMMITTED_KEY),
        ]);
        const pending = JSON.stringify(tasks) !== (committedRaw || "[]");
        return json({ pending }, env);
      }

      if (pathname === "/git/commit" && method === "POST") {
        const body = await request.json().catch(() => ({}));
        const message = body?.message || "Update tasks";
        const tasks = await readTasks(env);
        const committedRaw = await env.TASKS_KV.get(COMMITTED_KEY);
        if (JSON.stringify(tasks) === (committedRaw || "[]")) {
          return json({ committed: false }, env);
        }
        await githubCommitTasks(env, tasks, message);
        await env.TASKS_KV.put(COMMITTED_KEY, JSON.stringify(tasks));
        return json({ committed: true }, env);
      }

      return json({ error: "Not found" }, env, { status: 404 });
    } catch (err) {
      return json({ error: err.message }, env, { status: 500 });
    }
  },
};
