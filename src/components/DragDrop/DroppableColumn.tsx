"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, Status } from "@/types";

interface DroppableColumnProps {
  status: Status;
  tasks: Task[];
  children: React.ReactNode;
}

/**
 * Wrapper component that makes a column droppable
 * Uses @dnd-kit's useDroppable for drop functionality
 * and SortableContext for sortable list behavior
 */
export function DroppableColumn({ status, tasks, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "column",
      status,
    },
  });

  // Extract task IDs for SortableContext
  const taskIds = tasks.map((task) => task.id);

  return (
    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`
          ${isOver ? "bg-blue-50 ring-2 ring-blue-400 ring-inset" : ""}
          transition-colors duration-200
        `}
      >
        {children}
      </div>
    </SortableContext>
  );
}
