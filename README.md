# Task Tracker

A Notion-style task tracker with a Table view and a drag-and-drop Kanban Board view.
Tasks are stored in a plain JSON file (`server/data/tasks.json`) and every create,
update, or delete is automatically committed to Git — so the full history of your
tasks lives in `git log`.

## Project structure

```
/client   React + Vite + Tailwind frontend
/server   Express API + git-backed persistence
/server/data/tasks.json   the task "database"
```

## Requirements

- Node.js 18+

## Setup

```bash
npm run install:all   # installs deps for client and server (and root)
npm run dev            # starts both the API (port 4000) and the client (port 5173)
```

Then open http://localhost:5173.

The Vite dev server proxies `/api/*` requests to the Express server on port 4000
(see `client/vite.config.js`), so the frontend never needs to know the backend's
host directly.

To run each piece independently:

```bash
npm run dev --prefix server   # API only, http://localhost:4000
npm run dev --prefix client   # frontend only, http://localhost:5173
```

## API

| Method | Path         | Description         |
|--------|--------------|----------------------|
| GET    | /tasks       | List all tasks       |
| POST   | /tasks       | Create a task         |
| PUT    | /tasks/:id   | Update a task (partial patch) |
| DELETE | /tasks/:id   | Delete a task         |

Task shape:

```json
{
  "id": "uuid",
  "title": "string (required)",
  "description": "string",
  "status": "Not Started | In Progress | Blocked | Done",
  "priority": "Low | Medium | High | Urgent",
  "dueDate": "YYYY-MM-DD or null",
  "tags": ["string"],
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

## How the Git-backed persistence works

This directory is a Git repository (`git init` was already run when the project
was scaffolded). Every write to `server/data/tasks.json` goes through two steps:

1. The server writes the updated JSON to `server/data/tasks.json`.
2. The server calls `simple-git` to `git add` that file and create a commit,
   e.g. `Add task: Write README`, `Update task: Write README`, or
   `Delete task: Write README`.

That means `git log -- server/data/tasks.json` gives you a full audit trail of
every task change, and you can check out any previous revision of `tasks.json`
to see the state of your task list at that point in time. Commits are queued
and applied one at a time, so rapid successive edits don't race each other.

Note: for the auto-commit to succeed, Git needs a configured author identity.
If you haven't set one globally, run:

```bash
git config user.name "Your Name"
git config user.email "you@example.com"
```

### Pushing to a remote (e.g. GitHub)

If you'd like the task history backed up to GitHub (or any other remote):

```bash
git remote add origin <your-repo-url>
git push -u origin main
```

After that, every future auto-commit stays local until you run `git push`
again — the server never pushes on its own, it only commits locally.

## Views

- **Table view** — sortable/filterable spreadsheet-like list with inline
  editing of status, priority, and a completion checkbox. Press Enter in the
  bottom row to quick-add a task.
- **Board view** — Kanban board grouped by status with drag-and-drop cards
  between columns, per-column task counters, and a quick-add field at the
  bottom of each column.

Switch between them with the tab control at the top of the page.

## Filtering, sorting, and search

- Filter by status, priority, and/or tag (multi-select dropdowns).
- Sort by created date, due date, or priority, ascending or descending.
- Search box filters by title and description.

## Keyboard shortcuts

- `n` — open the new task dialog
- `/` — focus the search box
- `Esc` — close the task dialog

## Dark mode

Toggle with the Light/Dark button in the toolbar. Defaults to your OS preference.
