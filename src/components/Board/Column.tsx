import React from "react";
import Card from "./Card";
import EmptyColumn from "./EmptyColumn";
import { DraggableCard } from "@/components/DragDrop/DraggableCard";
import type { Task, Status } from "@/types";

interface ColumnProps {
  status: Status;
  title: string;
  tasks: Task[];
}

export default function Column({ status, title, tasks }: ColumnProps) {
  return (
    <div className="flex flex-col bg-gray-100 rounded-lg">
      {/* Column Header */}
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <span className="px-2 py-1 text-sm font-medium text-gray-600 bg-gray-200 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
        {tasks.length === 0 ? (
          <EmptyColumn />
        ) : (
          tasks.map((task) => (
            <DraggableCard key={task.id} task={task}>
              <Card task={task} />
            </DraggableCard>
          ))
        )}
      </div>
    </div>
  );
}
