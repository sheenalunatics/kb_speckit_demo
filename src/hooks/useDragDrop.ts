"use client";

import { useState } from "react";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Task, Status } from "@/types";
import { post } from "@/lib/api-client";

interface UseDragDropProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

interface UseDragDropReturn {
  activeTask: Task | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

/**
 * Custom hook for managing drag-and-drop state and operations
 * Handles optimistic updates and API calls for task reordering
 */
export function useDragDrop({ tasks, onTasksChange }: UseDragDropProps): UseDragDropReturn {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = String(active.id);
    const activeTask = tasks.find((t) => t.id === activeTaskId);
    if (!activeTask) return;

    const overId = String(over.id);
    const isOverColumn =
      overId === "TODO" || overId === "IN_PROGRESS" || overId === "TESTING" || overId === "DONE";

    // Determine the new status
    let newStatus: Status = activeTask.status;
    if (isOverColumn) {
      newStatus = overId as Status;
    } else {
      // Dropped on a task - find that task's status
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    // Group tasks by status
    const tasksByStatus: Record<Status, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      TESTING: [],
      DONE: [],
    };

    tasks.forEach((task) => {
      tasksByStatus[task.status].push(task);
    });

    // Remove the active task from its current status group
    tasksByStatus[activeTask.status] = tasksByStatus[activeTask.status].filter(
      (t) => t.id !== activeTask.id
    );

    // Calculate new position
    let newPosition = 0;
    const targetStatusTasks = tasksByStatus[newStatus];

    if (isOverColumn) {
      // Dropped on column - add to end
      newPosition = targetStatusTasks.length;
    } else {
      // Dropped on a task - find position
      const overIndex = targetStatusTasks.findIndex((t) => t.id === overId);
      if (overIndex !== -1) {
        newPosition = overIndex;
      }
    }

    // Insert task at new position
    const updatedTask = { ...activeTask, status: newStatus, position: newPosition };
    targetStatusTasks.splice(newPosition, 0, updatedTask);

    // Recalculate positions within the target status
    targetStatusTasks.forEach((task, index) => {
      task.position = index;
    });

    // Combine all tasks back together
    const updatedTasks = [
      ...tasksByStatus.TODO,
      ...tasksByStatus.IN_PROGRESS,
      ...tasksByStatus.TESTING,
      ...tasksByStatus.DONE,
    ];

    // Optimistic update
    const previousTasks = [...tasks];
    onTasksChange(updatedTasks);

    // API call
    try {
      await post("/api/tasks/reorder", {
        taskId: activeTask.id,
        newStatus,
        newPosition,
      });
    } catch (error) {
      console.error("Failed to reorder task:", error);
      // Rollback on error
      onTasksChange(previousTasks);
    }
  };

  return {
    activeTask,
    handleDragStart,
    handleDragEnd,
  };
}
