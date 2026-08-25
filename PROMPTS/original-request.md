# Original Project Request

Build a task tracker web app similar to Notion's task database, with the following requirements:

## Tech Stack
- React + Vite for the frontend
- TailwindCSS for styling
- Node.js/Express backend (lightweight, for reading/writing data + git operations)
- Data stored as a JSON file (tasks.json) inside the project repo
- Use simple-git (npm package) to auto-commit changes to tasks.json after every create/update/delete, so task history is version-controlled in Git

## Data Model
Each task should have:
- id (uuid)
- title (string, required)
- description (rich text / plain text, optional)
- status (enum: "Not Started", "In Progress", "Blocked", "Done")
- priority (enum: "Low", "Medium", "High", "Urgent")
- dueDate (date, optional)
- tags (array of strings, optional)
- createdAt / updatedAt (timestamps, auto-managed)

## Views (like Notion)
1. Table view — sortable/filterable columns for all fields, inline editing
2. Board view (Kanban) — grouped by status, drag-and-drop cards between columns
3. Toggle between views with a tab/switch at the top

## Core Features
- Create, edit, delete tasks
- Inline quick-add (press Enter to add a new task row/card)
- Filter by status, priority, tag
- Sort by due date, priority, or created date
- Search bar (filters by title/description)
- Mark task complete with a checkbox (auto-sets status to "Done")
- Clean, minimal UI inspired by Notion — lots of whitespace, subtle borders, rounded corners, soft colors per status/priority (e.g. red for Urgent, gray for Not Started, green for Done)

## Data Persistence (Git-backed)
- Backend exposes a small REST API: GET /tasks, POST /tasks, PUT /tasks/:id, DELETE /tasks/:id
- Every write operation updates tasks.json and creates a git commit with a message like "Update task: <title>"
- Include a .gitignore for node_modules, etc.
- README should explain how to run it locally (npm install && npm run dev) and how the git-backed persistence works, including how to point it at a remote GitHub repo (git remote add origin <url> && git push)

## Project Structure
- /client — React frontend
- /server — Express backend + git logic
- /server/data/tasks.json — the task database
- Root-level README.md with setup instructions

## Nice-to-haves (only if time allows)
- Keyboard shortcuts (n = new task, / = search)
- Dark mode toggle
- Task counters per status column in board view
