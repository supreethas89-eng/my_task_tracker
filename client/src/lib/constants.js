export const STATUSES = ["Not Started", "In Progress", "Blocked", "Done"];
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export const STATUS_STYLES = {
  "Not Started": {
    badge: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
    dot: "bg-neutral-400",
  },
  "In Progress": {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  Blocked: {
    badge: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  Done: {
    badge: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    dot: "bg-green-500",
  },
};

export const PRIORITY_STYLES = {
  Low: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  Medium: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  High: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  Urgent: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};
