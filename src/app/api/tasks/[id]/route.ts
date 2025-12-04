import { NextRequest, NextResponse } from "next/server";
import { taskRepository } from "@/lib/repositories/task-repository";
import { handleApiError } from "@/lib/api-error";
import { TaskUpdateRequest } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/tasks/[id]
 * Updates a task (status, position, title, description, etc.)
 */
export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as TaskUpdateRequest;

    // Get existing task for version check
    const existingTask = taskRepository.getTaskById(id);
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Optimistic locking check
    if (body.version !== undefined && body.version !== existingTask.version) {
      return NextResponse.json(
        { error: "Task has been modified by another user. Please refresh and try again." },
        { status: 409 }
      );
    }

    const updatedTask = taskRepository.updateTask(id, body);

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/tasks/[id]
 * Deletes a task and its associations
 */
export async function DELETE(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    const existingTask = taskRepository.getTaskById(id);
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    taskRepository.deleteTask(id);

    return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
