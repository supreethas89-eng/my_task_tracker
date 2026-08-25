import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "data", "tasks.json");

let writeQueue = Promise.resolve();

export async function readTasks() {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Serialize writes so concurrent requests don't clobber each other's changes.
export function writeTasks(tasks) {
  writeQueue = writeQueue.then(() =>
    fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2) + "\n", "utf-8")
  );
  return writeQueue;
}
