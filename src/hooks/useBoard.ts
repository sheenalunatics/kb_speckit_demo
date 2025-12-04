"use client";

import { useState, useEffect } from "react";
import { get } from "@/lib/api-client";
import type { GetTasksResponse, Task, Label, Assignee } from "@/types";

export function useBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await get<GetTasksResponse>("/api/tasks");
      setTasks(data.tasks);
      setLabels(data.labels);
      setAssignees(data.assignees);
    } catch (err: any) {
      setError(err.message || "Failed to load board");
      console.error("Error loading board:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  return {
    tasks,
    setTasks,
    labels,
    assignees,
    loading,
    error,
    refetch: fetchBoard,
  };
}
