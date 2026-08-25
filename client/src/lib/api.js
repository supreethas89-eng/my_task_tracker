const BASE = "/api";

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.errors?.join(", ") || body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  list: () => request("/tasks"),
  create: (task) => request("/tasks", { method: "POST", body: JSON.stringify(task) }),
  update: (id, patch) => request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
  remove: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
};
