"use client";

import React, { useState } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import Column from "./Column";
import Card from "./Card";
import { DroppableColumn } from "@/components/DragDrop/DroppableColumn";
import { useDragDrop } from "@/hooks/useDragDrop";
import { Status } from "@/types";
import type { Task } from "@/types";

interface BoardProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

const COLUMNS = [
  { id: Status.TODO, title: "To Do" },
  { id: Status.IN_PROGRESS, title: "In Progress" },
  { id: Status.TESTING, title: "Testing" },
  { id: Status.DONE, title: "Done" },
];

export default function Board({ tasks, onTasksChange }: BoardProps) {
  const { activeTask, handleDragStart, handleDragEnd } = useDragDrop({
    tasks,
    onTasksChange,
  });

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  // Group tasks by status
  const tasksByStatus = tasks.reduce(
    (acc, task) => {
      acc[task.status].push(task);
      return acc;
    },
    {
      [Status.TODO]: [] as Task[],
      [Status.IN_PROGRESS]: [] as Task[],
      [Status.TESTING]: [] as Task[],
      [Status.DONE]: [] as Task[],
    }
  );

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COLUMNS.map((column) => (
              <DroppableColumn key={column.id} status={column.id} tasks={tasksByStatus[column.id]}>
                <Column status={column.id} title={column.title} tasks={tasksByStatus[column.id]} />
              </DroppableColumn>
            ))}
          </div>
        </main>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 scale-105">
            <Card task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
