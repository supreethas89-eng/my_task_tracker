import { PRIORITY_STYLES, STATUS_STYLES } from "../lib/constants";

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES["Not Started"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {priority}
    </span>
  );
}

export function TagChip({ tag }) {
  return (
    <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
      {tag}
    </span>
  );
}
