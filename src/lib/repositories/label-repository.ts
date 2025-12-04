import { getDb, generateId } from "@/lib/db";
import type { Label } from "@/types";

/**
 * Get all labels
 */
export function getAllLabels(): Label[] {
  const db = getDb();

  const query = `
    SELECT
      id,
      name,
      color,
      created_at as createdAt
    FROM labels
    ORDER BY name
  `;

  return db.prepare(query).all() as Label[];
}

/**
 * Get a single label by ID
 */
export function getLabelById(id: string): Label | null {
  const db = getDb();

  const query = `
    SELECT
      id,
      name,
      color,
      created_at as createdAt
    FROM labels
    WHERE id = ?
  `;

  return (db.prepare(query).get(id) as Label) || null;
}

/**
 * Get labels by task ID
 */
export function getLabelsByTaskId(taskId: string): Label[] {
  const db = getDb();

  const query = `
    SELECT
      l.id,
      l.name,
      l.color,
      l.created_at as createdAt
    FROM labels l
    INNER JOIN task_labels tl ON l.id = tl.label_id
    WHERE tl.task_id = ?
    ORDER BY l.name
  `;

  return db.prepare(query).all(taskId) as Label[];
}

/**
 * Create a new label
 */
export function createLabel(name: string, color: string): Label {
  const db = getDb();
  const id = generateId();

  db.prepare(
    `INSERT INTO labels (id, name, color)
     VALUES (?, ?, ?)`
  ).run(id, name, color);

  return getLabelById(id)!;
}

/**
 * Check if label name already exists
 */
export function labelNameExists(name: string): boolean {
  const db = getDb();
  const result = db
    .prepare("SELECT COUNT(*) as count FROM labels WHERE LOWER(name) = LOWER(?)")
    .get(name) as { count: number };
  return result.count > 0;
}
