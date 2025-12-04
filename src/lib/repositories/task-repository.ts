import { getDb, generateId } from "@/lib/db";
import type { Task, Status, TaskBase } from "@/types";

/**
 * Get all tasks with their labels and assignees
 */
export function getAllTasks(): Task[] {
  const db = getDb();

  const query = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.status,
      t.position,
      t.version,
      t.created_at as createdAt,
      t.updated_at as updatedAt,
      t.status_changed_at as statusChangedAt,
      (
        SELECT json_group_array(
          json_object('id', l.id, 'name', l.name, 'color', l.color, 'createdAt', l.created_at)
        )
        FROM labels l
        INNER JOIN task_labels tl ON l.id = tl.label_id
        WHERE tl.task_id = t.id
      ) as labels,
      (
        SELECT json_group_array(
          json_object('id', a.id, 'name', a.name, 'email', a.email, 'createdAt', a.created_at)
        )
        FROM assignees a
        INNER JOIN task_assignees ta ON a.id = ta.assignee_id
        WHERE ta.task_id = t.id
      ) as assignees
    FROM tasks t
    ORDER BY
      CASE t.status
        WHEN 'TODO' THEN 1
        WHEN 'IN_PROGRESS' THEN 2
        WHEN 'TESTING' THEN 3
        WHEN 'DONE' THEN 4
      END,
      t.position
  `;

  const rows = db.prepare(query).all() as any[];

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as Status,
    position: row.position,
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    statusChangedAt: row.statusChangedAt,
    labels: row.labels ? JSON.parse(row.labels) : [],
    assignees: row.assignees ? JSON.parse(row.assignees) : [],
  }));
}

/**
 * Get a single task by ID
 */
export function getTaskById(id: string): Task | null {
  const db = getDb();

  const query = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.status,
      t.position,
      t.version,
      t.created_at as createdAt,
      t.updated_at as updatedAt,
      t.status_changed_at as statusChangedAt,
      (
        SELECT json_group_array(
          json_object('id', l.id, 'name', l.name, 'color', l.color, 'createdAt', l.created_at)
        )
        FROM labels l
        INNER JOIN task_labels tl ON l.id = tl.label_id
        WHERE tl.task_id = t.id
      ) as labels,
      (
        SELECT json_group_array(
          json_object('id', a.id, 'name', a.name, 'email', a.email, 'createdAt', a.created_at)
        )
        FROM assignees a
        INNER JOIN task_assignees ta ON a.id = ta.assignee_id
        WHERE ta.task_id = t.id
      ) as assignees
    FROM tasks t
    WHERE t.id = ?
  `;

  const row = db.prepare(query).get(id) as any;

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as Status,
    position: row.position,
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    statusChangedAt: row.statusChangedAt,
    labels: row.labels ? JSON.parse(row.labels) : [],
    assignees: row.assignees ? JSON.parse(row.assignees) : [],
  };
}

/**
 * Create a new task
 */
export function createTask(
  title: string,
  description: string | null,
  labelIds: string[] = [],
  assigneeIds: string[] = []
): Task {
  const db = getDb();
  const id = generateId();

  // Get next position in TODO column
  const positionResult = db
    .prepare("SELECT COALESCE(MAX(position), -1) + 1 as nextPos FROM tasks WHERE status = 'TODO'")
    .get() as { nextPos: number };

  const position = positionResult.nextPos;

  // Insert task
  db.prepare(
    `INSERT INTO tasks (id, title, description, status, position)
     VALUES (?, ?, ?, 'TODO', ?)`
  ).run(id, title, description, position);

  // Create initial history entry
  db.prepare(
    `INSERT INTO task_history (id, task_id, status, entered_at)
     VALUES (?, ?, 'TODO', datetime('now'))`
  ).run(generateId(), id);

  // Associate labels
  const labelStmt = db.prepare("INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)");
  for (const labelId of labelIds) {
    labelStmt.run(id, labelId);
  }

  // Associate assignees
  const assigneeStmt = db.prepare(
    "INSERT INTO task_assignees (task_id, assignee_id) VALUES (?, ?)"
  );
  for (const assigneeId of assigneeIds) {
    assigneeStmt.run(id, assigneeId);
  }

  return getTaskById(id)!;
}

/**
 * Update a task
 */
export function updateTask(
  id: string,
  updates: {
    title?: string;
    description?: string | null;
    status?: Status;
    position?: number;
    labelIds?: string[];
    assigneeIds?: string[];
    version?: number;
  }
): Task | null {
  const db = getDb();

  // Check version for optimistic locking
  if (updates.version !== undefined) {
    const current = db.prepare("SELECT version FROM tasks WHERE id = ?").get(id) as
      | {
          version: number;
        }
      | undefined;
    if (!current || current.version !== updates.version) {
      throw new Error("Version conflict");
    }
  }

  // Build update query
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) {
    fields.push("title = ?");
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }
  if (updates.status !== undefined) {
    fields.push("status = ?");
    values.push(updates.status);
  }
  if (updates.position !== undefined) {
    fields.push("position = ?");
    values.push(updates.position);
  }

  if (fields.length > 0) {
    values.push(id);
    db.prepare(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }

  // Update labels if provided
  if (updates.labelIds !== undefined) {
    db.prepare("DELETE FROM task_labels WHERE task_id = ?").run(id);
    const labelStmt = db.prepare("INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)");
    for (const labelId of updates.labelIds) {
      labelStmt.run(id, labelId);
    }
  }

  // Update assignees if provided
  if (updates.assigneeIds !== undefined) {
    db.prepare("DELETE FROM task_assignees WHERE task_id = ?").run(id);
    const assigneeStmt = db.prepare(
      "INSERT INTO task_assignees (task_id, assignee_id) VALUES (?, ?)"
    );
    for (const assigneeId of updates.assigneeIds) {
      assigneeStmt.run(id, assigneeId);
    }
  }

  return getTaskById(id);
}

/**
 * Delete a task
 */
export function deleteTask(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return result.changes > 0;
}

/**
 * Default export containing all task repository methods
 */
export const taskRepository = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
