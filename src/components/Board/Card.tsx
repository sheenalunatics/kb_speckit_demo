import React from "react";
import LabelBadge from "../Labels/LabelBadge";
import type { Task } from "@/types";
import { formatDate } from "@/lib/utils";

interface CardProps {
  task: Task;
}

export default function Card({ task }: CardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
      {/* Task Title */}
      <h3 className="font-medium text-gray-900 mb-2">{task.title}</h3>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map((label) => (
            <LabelBadge key={label.id} label={label} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        {/* Assignees */}
        <div className="flex -space-x-2">
          {task.assignees && task.assignees.length > 0 ? (
            task.assignees.slice(0, 3).map((assignee) => (
              <div
                key={assignee.id}
                className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium ring-2 ring-white"
                title={assignee.name}
              >
                {assignee.name.charAt(0).toUpperCase()}
              </div>
            ))
          ) : (
            <div className="text-gray-400">Unassigned</div>
          )}
          {task.assignees && task.assignees.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium ring-2 ring-white">
              +{task.assignees.length - 3}
            </div>
          )}
        </div>

        {/* Created Date */}
        <span>{formatDate(task.createdAt)}</span>
      </div>
    </div>
  );
}
