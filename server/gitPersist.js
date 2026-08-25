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
      if (!isRepo) return;
      await git.add(TASKS_FILE_REL);
      const status = await git.status();
      if (status.staged.length === 0) return;
      await git.commit(message);
    })
    .catch((err) => {
      console.error("[git] commit failed:", err.message);
    });
  return queue;
}
