# Data Model

**Feature**: Simple Kanban Task Management Board  
**Phase**: 1 - Design & Contracts  
**Date**: December 4, 2025

## Overview

This document defines the complete data model for the Kanban board system, including entities, relationships, validation rules, and database schema.

---

## Entity Definitions

### 1. Task (Task Card)

Represents a work item on the Kanban board.

**Attributes:**

- `id`: UUID (primary key)
- `title`: string (required, 1-200 characters)
- `description`: string (optional, max 2000 characters)
- `status`: enum ('TODO', 'IN_PROGRESS', 'TESTING', 'DONE')
- `position`: integer (non-negative, for manual ordering within column)
- `version`: integer (for optimistic locking, auto-increment on each update)
- `created_at`: timestamp (ISO 8601)
- `updated_at`: timestamp (ISO 8601)
- `status_changed_at`: timestamp (ISO 8601, updated when status changes)

**Relationships:**

- Many-to-Many with `Label` (via `TaskLabel` junction table)
- Many-to-Many with `Assignee` (via `TaskAssignee` junction table)
- One-to-Many with `TaskHistory` (for time tracking)

**Validation Rules:**

- Title: required, trimmed, 1-200 characters
- Description: optional, max 2000 characters
- Status: must be one of 4 valid values
- Position: non-negative integer, unique within status column
- Version: managed by system, increments on every update

**Business Rules:**

- New tasks always created in 'TODO' status
- Position assigned as max(position) + 1 in target column
- When status changes, `status_changed_at` updated and TaskHistory entry created
- Deleting task cascades to TaskLabel, TaskAssignee, TaskHistory

---

### 2. Label

Represents a categorization tag applied to tasks.

**Attributes:**

- `id`: UUID (primary key)
- `name`: string (required, unique, 1-50 characters)
- `color`: string (hex color code from predefined palette, e.g., '#3B82F6')
- `created_at`: timestamp (ISO 8601)

**Relationships:**

- Many-to-Many with `Task` (via `TaskLabel` junction table)

**Validation Rules:**

- Name: required, trimmed, unique (case-insensitive), 1-50 characters
- Color: required, must be valid hex color from predefined palette
- No duplicate names allowed (enforced at database level)

**Business Rules:**

- Cannot delete label if associated with tasks (soft delete or prevent)
- Color must be selected from predefined 18-color palette (see contracts/types.ts LABEL_COLORS constant)
- Created during task creation if name doesn't exist (inline creation)

**Predefined Color Palette:**

See `contracts/types.ts` for the complete `LABEL_COLORS` constant containing 18 colors:

- Red, Orange, Amber, Yellow, Lime, Green, Emerald, Teal
- Cyan, Sky, Blue, Indigo, Violet, Purple, Fuchsia, Pink
- Rose, Slate

---

### 3. Assignee

Represents a team member who can be assigned to tasks.

**Attributes:**

- `id`: UUID (primary key)
- `name`: string (required, 1-100 characters)
- `email`: string (optional, unique if provided, valid email format)
- `created_at`: timestamp (ISO 8601)

**Relationships:**

- Many-to-Many with `Task` (via `TaskAssignee` junction table)

**Validation Rules:**

- Name: required, trimmed, 1-100 characters
- Email: optional, valid email format, unique if provided

**Business Rules:**

- Cannot delete assignee if assigned to tasks (soft delete or prevent)
- Email uniqueness enforced at database level

---

### 4. TaskLabel (Junction Table)

Represents the many-to-many relationship between tasks and labels.

**Attributes:**

- `task_id`: UUID (foreign key → Task.id)
- `label_id`: UUID (foreign key → Label.id)
- Primary Key: composite (`task_id`, `label_id`)

**Relationships:**

- Many-to-One with `Task`
- Many-to-One with `Label`

**Business Rules:**

- On task delete: cascade delete
- On label delete: cascade delete (or prevent if labels shouldn't be deleted)
- Unique constraint on (task_id, label_id) - no duplicate associations

---

### 5. TaskAssignee (Junction Table)

Represents the many-to-many relationship between tasks and assignees.

**Attributes:**

- `task_id`: UUID (foreign key → Task.id)
- `assignee_id`: UUID (foreign key → Assignee.id)
- Primary Key: composite (`task_id`, `assignee_id`)

**Relationships:**

- Many-to-One with `Task`
- Many-to-One with `Assignee`

**Business Rules:**

- On task delete: cascade delete
- On assignee delete: set null or cascade (based on business requirement)
- Unique constraint on (task_id, assignee_id) - no duplicate assignments

---

### 6. TaskHistory

Represents the history of status changes for time tracking.

**Attributes:**

- `id`: UUID (primary key)
- `task_id`: UUID (foreign key → Task.id)
- `status`: enum ('TODO', 'IN_PROGRESS', 'TESTING', 'DONE')
- `entered_at`: timestamp (ISO 8601, when task entered this status)
- `exited_at`: timestamp (ISO 8601, when task left this status, null if current status)

**Relationships:**

- Many-to-One with `Task`

**Derived Attributes:**

- `duration`: computed as `exited_at - entered_at` (in seconds), null if exited_at is null

**Business Rules:**

- Created automatically when task status changes
- Current status has `exited_at` = null
- Previous statuses have `exited_at` set when status changed
- On task delete: cascade delete

---

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────┐
│    Task     │────────>│  TaskLabel   │<────────│  Label  │
│             │ 1     * │              │ *     1 │         │
│  - id       │         │  - task_id   │         │  - id   │
│  - title    │         │  - label_id  │         │  - name │
│  - status   │         └──────────────┘         │  - color│
│  - position │                                   └─────────┘
│  - version  │         ┌──────────────┐         ┌──────────┐
│             │────────>│TaskAssignee  │<────────│ Assignee │
└─────────────┘ 1     * │              │ *     1 │          │
      │                 │  - task_id   │         │  - id    │
      │                 │  - assignee  │         │  - name  │
      │ 1               └──────────────┘         │  - email │
      │                                          └──────────┘
      │
      │ *
      v
┌──────────────┐
│ TaskHistory  │
│              │
│  - id        │
│  - task_id   │
│  - status    │
│  - entered_at│
│  - exited_at │
└──────────────┘
```

---

## Database Schema (SQLite)

### Tables

```sql
-- Tasks table
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK(length(trim(title)) >= 1 AND length(title) <= 200),
  description TEXT CHECK(description IS NULL OR length(description) <= 2000),
  status TEXT NOT NULL CHECK(status IN ('TODO', 'IN_PROGRESS', 'TESTING', 'DONE')),
  position INTEGER NOT NULL CHECK(position >= 0),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  status_changed_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(status, position)
);

-- Labels table
CREATE TABLE labels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE CHECK(length(trim(name)) >= 1 AND length(name) <= 50),
  color TEXT NOT NULL CHECK(color GLOB '#[0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F]'),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Assignees table
CREATE TABLE assignees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(trim(name)) >= 1 AND length(name) <= 100),
  email TEXT UNIQUE CHECK(email IS NULL OR email LIKE '%_@_%._%'),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Task-Label junction table
CREATE TABLE task_labels (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label_id TEXT NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

-- Task-Assignee junction table
CREATE TABLE task_assignees (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  assignee_id TEXT NOT NULL REFERENCES assignees(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, assignee_id)
);

-- Task history table for time tracking
CREATE TABLE task_history (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK(status IN ('TODO', 'IN_PROGRESS', 'TESTING', 'DONE')),
  entered_at TEXT NOT NULL DEFAULT (datetime('now')),
  exited_at TEXT
);

-- Indexes for performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_position ON tasks(status, position);
CREATE INDEX idx_task_labels_task ON task_labels(task_id);
CREATE INDEX idx_task_labels_label ON task_labels(label_id);
CREATE INDEX idx_task_assignees_task ON task_assignees(task_id);
CREATE INDEX idx_task_assignees_assignee ON task_assignees(assignee_id);
CREATE INDEX idx_task_history_task ON task_history(task_id);
CREATE INDEX idx_task_history_current ON task_history(task_id, exited_at) WHERE exited_at IS NULL;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_task_timestamp
AFTER UPDATE ON tasks
BEGIN
  UPDATE tasks SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_task_status_timestamp
AFTER UPDATE OF status ON tasks
WHEN OLD.status != NEW.status
BEGIN
  UPDATE tasks SET status_changed_at = datetime('now') WHERE id = NEW.id;
  -- Close previous history entry
  UPDATE task_history
  SET exited_at = datetime('now')
  WHERE task_id = NEW.id AND exited_at IS NULL;
  -- Create new history entry
  INSERT INTO task_history (id, task_id, status, entered_at)
  VALUES (lower(hex(randomblob(16))), NEW.id, NEW.status, datetime('now'));
END;

CREATE TRIGGER increment_task_version
AFTER UPDATE ON tasks
BEGIN
  UPDATE tasks SET version = version + 1 WHERE id = NEW.id;
END;
```

---

## Data Access Patterns

### Common Queries

**1. Get all tasks with labels and assignees (Board view):**

```sql
SELECT
  t.*,
  json_group_array(DISTINCT json_object('id', l.id, 'name', l.name, 'color', l.color)) as labels,
  json_group_array(DISTINCT json_object('id', a.id, 'name', a.name)) as assignees
FROM tasks t
LEFT JOIN task_labels tl ON t.id = tl.task_id
LEFT JOIN labels l ON tl.label_id = l.id
LEFT JOIN task_assignees ta ON t.id = ta.task_id
LEFT JOIN assignees a ON ta.assignee_id = a.id
GROUP BY t.id
ORDER BY t.status, t.position;
```

**2. Create task with labels and assignees:**

```sql
-- Insert task
INSERT INTO tasks (id, title, description, status, position)
VALUES (?, ?, ?, 'TODO', (SELECT COALESCE(MAX(position), -1) + 1 FROM tasks WHERE status = 'TODO'));

-- Insert initial history entry
INSERT INTO task_history (id, task_id, status, entered_at)
VALUES (?, ?, 'TODO', datetime('now'));

-- Associate labels
INSERT INTO task_labels (task_id, label_id) VALUES (?, ?);

-- Associate assignees
INSERT INTO task_assignees (task_id, assignee_id) VALUES (?, ?);
```

**3. Move task to different status:**

```sql
UPDATE tasks
SET status = ?, position = ?
WHERE id = ? AND version = ?;
-- Check affected rows = 1 for optimistic lock
```

**4. Reorder within same column:**

```sql
-- Shift positions
UPDATE tasks
SET position = position + 1
WHERE status = ? AND position >= ? AND position < ?;

-- Update target task position
UPDATE tasks
SET position = ?
WHERE id = ?;
```

**5. Search and filter tasks:**

```sql
SELECT t.* FROM tasks t
LEFT JOIN task_labels tl ON t.id = tl.task_id
LEFT JOIN task_assignees ta ON t.id = ta.task_id
WHERE
  (? IS NULL OR t.title LIKE ? OR t.description LIKE ?)
  AND (? IS NULL OR tl.label_id IN (?))
  AND (? IS NULL OR ta.assignee_id IN (?))
GROUP BY t.id
ORDER BY t.status, t.position;
```

**6. Get task time tracking:**

```sql
SELECT
  status,
  entered_at,
  exited_at,
  CASE
    WHEN exited_at IS NULL THEN (julianday('now') - julianday(entered_at)) * 86400
    ELSE (julianday(exited_at) - julianday(entered_at)) * 86400
  END as duration_seconds
FROM task_history
WHERE task_id = ?
ORDER BY entered_at;
```

---

## Validation & Constraints

### Application-Level Validation

```typescript
// Task validation
interface TaskValidation {
  title: string; // Required, 1-200 chars, trimmed
  description?: string; // Optional, max 2000 chars
  status: Status; // Enum validation
  labelIds?: string[]; // Valid UUIDs, existing label IDs
  assigneeIds?: string[]; // Valid UUIDs, existing assignee IDs
}

// Label validation
interface LabelValidation {
  name: string; // Required, 1-50 chars, trimmed, unique (case-insensitive)
  color: string; // Required, must be in LABEL_COLORS array
}

// Assignee validation
interface AssigneeValidation {
  name: string; // Required, 1-100 chars, trimmed
  email?: string; // Optional, valid email format, unique
}
```

### Database-Level Constraints

- Primary keys (uniqueness, not null)
- Foreign keys (referential integrity, cascade deletes)
- Check constraints (string lengths, enum values, non-negative numbers)
- Unique constraints (label names, assignee emails, task positions within status)
- Triggers (automatic timestamps, version incrementing, history tracking)

---

## Migration Strategy

### Initial Schema Setup

```bash
# migrations/001_initial_schema.sql
# Contains all CREATE TABLE statements above

# migrations/002_seed_data.sql (optional)
# Contains sample assignees for demo
```

### Migration Execution

```typescript
// lib/migrate.ts
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export function runMigrations(db: Database.Database) {
  const migrationsDir = path.join(process.cwd(), "migrations");
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (file.endsWith(".sql")) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      db.exec(sql);
      console.log(`Executed migration: ${file}`);
    }
  }
}
```

---

## Sample Data

```sql
-- Sample assignees
INSERT INTO assignees (id, name, email) VALUES
  ('user-1', 'Alice Johnson', 'alice@example.com'),
  ('user-2', 'Bob Smith', 'bob@example.com'),
  ('user-3', 'Carol Williams', null);

-- Sample labels
INSERT INTO labels (id, name, color) VALUES
  ('label-1', 'Bug', '#EF4444'),
  ('label-2', 'Feature', '#3B82F6'),
  ('label-3', 'Urgent', '#F59E0B');

-- Sample tasks
INSERT INTO tasks (id, title, description, status, position) VALUES
  ('task-1', 'Fix login bug', 'Users cannot log in with email', 'TODO', 0),
  ('task-2', 'Add dark mode', 'Implement dark mode theme', 'IN_PROGRESS', 0),
  ('task-3', 'Write tests', 'Add unit tests for auth', 'TESTING', 0),
  ('task-4', 'Deploy v1.0', 'Deploy to production', 'DONE', 0);

-- Associate labels with tasks
INSERT INTO task_labels (task_id, label_id) VALUES
  ('task-1', 'label-1'),
  ('task-1', 'label-3'),
  ('task-2', 'label-2');

-- Assign tasks
INSERT INTO task_assignees (task_id, assignee_id) VALUES
  ('task-1', 'user-1'),
  ('task-2', 'user-2'),
  ('task-3', 'user-1'),
  ('task-3', 'user-2');
```

---

## Next Steps

1. ✅ Data model defined
2. → Create API contracts (contracts/)
3. → Create quickstart guide (quickstart.md)
4. → Update agent context
5. → Re-evaluate Constitution Check

**Data Model Complete**: December 4, 2025
