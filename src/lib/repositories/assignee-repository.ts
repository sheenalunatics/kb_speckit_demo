import { getDb, generateId } from "@/lib/db";
import type { Assignee } from "@/types";

/**
 * Get all assignees
 */
export function getAllAssignees(): Assignee[] {
  const db = getDb();

  const query = `
    SELECT
      id,
      name,
      email,
      created_at as createdAt
    FROM assignees
    ORDER BY name
  `;

  return db.prepare(query).all() as Assignee[];
}

/**
 * Get a single assignee by ID
 */
export function getAssigneeById(id: string): Assignee | null {
  const db = getDb();

  const query = `
    SELECT
      id,
      name,
      email,
      created_at as createdAt
    FROM assignees
    WHERE id = ?
  `;

  return (db.prepare(query).get(id) as Assignee) || null;
}

/**
 * Get assignees by task ID
 */
export function getAssigneesByTaskId(taskId: string): Assignee[] {
  const db = getDb();

  const query = `
    SELECT
      a.id,
      a.name,
      a.email,
      a.created_at as createdAt
    FROM assignees a
    INNER JOIN task_assignees ta ON a.id = ta.assignee_id
    WHERE ta.task_id = ?
    ORDER BY a.name
  `;

  return db.prepare(query).all(taskId) as Assignee[];
}

/**
 * Create a new assignee
 */
export function createAssignee(name: string, email: string | null): Assignee {
  const db = getDb();
  const id = generateId();

  db.prepare(
    `INSERT INTO assignees (id, name, email)
     VALUES (?, ?, ?)`
  ).run(id, name, email);

  return getAssigneeById(id)!;
}
