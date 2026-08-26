import simpleGit from "simple-git";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const TASKS_FILE_REL = path.join("server", "data", "tasks.json");

const git = simpleGit(REPO_ROOT);

let queue = Promise.resolve();

// Serialize commits so concurrent writes don't race on the git index.
export function commitTasksFile(message) {
  queue = queue
    .then(async () => {
      const isRepo = await git.checkIsRepo();
      if (!isRepo) return false;
      await git.add(TASKS_FILE_REL);
      const status = await git.status();
      if (status.staged.length === 0) return false;
      await git.commit(message);
      return true;
    })
    .catch((err) => {
      console.error("[git] commit failed:", err.message);
      throw err;
    });
  return queue;
}

export async function hasPendingChanges() {
  const isRepo = await git.checkIsRepo();
  if (!isRepo) return false;
  const status = await git.status();
  return status.files.some((f) => f.path === TASKS_FILE_REL);
}
