import { NextRequest, NextResponse } from "next/server";
import { taskRepository } from "@/lib/repositories/task-repository";
import { handleApiError } from "@/lib/api-error";
import { Status } from "@/types";

interface ReorderTaskRequest {
  taskId: string;
  newStatus: Status;
  newPosition: number;
}

/**
 * POST /api/tasks/reorder
 * Reorders tasks within or across columns
 * Expects: { taskId, newStatus, newPosition }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as ReorderTaskRequest;

    const { taskId, newStatus, newPosition } = body;

    if (!taskId || !newStatus || newPosition === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: taskId, newStatus, newPosition" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["TODO", "IN_PROGRESS", "TESTING", "DONE"];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const task = taskRepository.getTaskById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = taskRepository.updateTask(taskId, {
      status: newStatus,
      position: newPosition,
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
