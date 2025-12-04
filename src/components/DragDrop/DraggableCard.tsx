"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types";

interface DraggableCardProps {
  task: Task;
  children: React.ReactNode;
}

/**
 * Wrapper component that makes a task card draggable
 * Uses @dnd-kit's useSortable hook for drag functionality
 */
export function DraggableCard({ task, children }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      task,
      type: "task",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        ${isDragging ? "z-50 cursor-grabbing shadow-2xl ring-2 ring-blue-500" : "cursor-grab"}
      `}
    >
      {children}
    </div>
  );
}
