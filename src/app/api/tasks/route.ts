import { NextResponse } from "next/server";
import { getAllTasks } from "@/lib/repositories/task-repository";
import { getAllLabels } from "@/lib/repositories/label-repository";
import { getAllAssignees } from "@/lib/repositories/assignee-repository";
import { internalError } from "@/lib/api-error";
import type { GetTasksResponse } from "@/types";

export async function GET() {
  try {
    const tasks = getAllTasks();
    const labels = getAllLabels();
    const assignees = getAllAssignees();

    const response: GetTasksResponse = {
      tasks,
      labels,
      assignees,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return internalError("Failed to fetch tasks", error);
  }
}
