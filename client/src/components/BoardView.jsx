import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { PriorityBadge, TagChip } from "./Badge";
import { STATUSES, STATUS_STYLES } from "../lib/constants";

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function TaskCard({ task, onOpen, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 10,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(task)}
      className={`group relative cursor-pointer rounded-lg border border-neutral-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
        title="Delete task"
        className="invisible absolute right-1.5 top-1.5 rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600 group-hover:visible dark:hover:bg-red-950 dark:hover:text-red-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path
            fillRule="evenodd"
            d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <p
        className={`pr-4 text-sm font-medium text-neutral-800 dark:text-neutral-100 ${
          task.status === "Done" ? "text-neutral-400 line-through dark:text-neutral-500" : ""
        }`}
      >
        {task.title}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className="text-xs text-neutral-400 dark:text-neutral-500">{fmtDate(task.dueDate)}</span>
        )}
      </div>
      {task.tags?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}

function Column({ status, tasks, onOpen, onQuickAdd, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const [quickTitle, setQuickTitle] = useState("");
  const style = STATUS_STYLES[status];

  const handleKeyDown = async (e) => {
    if (e.key !== "Enter" || !quickTitle.trim()) return;
    await onQuickAdd(status, quickTitle.trim());
    setQuickTitle("");
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-lg border transition ${
        isOver ? "border-neutral-400 bg-neutral-50 dark:border-neutral-500 dark:bg-neutral-900" : "border-transparent"
      }`}
    >
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{status}</h3>
        <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 rounded-lg bg-neutral-100/50 p-2 dark:bg-neutral-900/40 min-h-[80px]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={onOpen} onDelete={onDelete} />
        ))}
        <input
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="+ New task"
          className="rounded-md border border-dashed border-neutral-300 bg-transparent px-2 py-1.5 text-xs text-neutral-500 outline-none placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400"
        />
      </div>
    </div>
  );
}

export function BoardView({ tasks, onOpen, onUpdate, onCreate, onDelete }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    const task = tasks.find((t) => t.id === active.id);
    if (task && task.status !== over.id) {
      onUpdate(task.id, { status: over.id });
    }
  };

  const handleQuickAdd = (status, title) => onCreate({ title, status });

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto px-6 py-4">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            onOpen={onOpen}
            onQuickAdd={handleQuickAdd}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DndContext>
  );
}
