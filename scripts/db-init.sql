-- SQLite Database Schema for Kanban Board
-- Based on specs/001-kanban-board/data-model.md

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
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
CREATE TABLE IF NOT EXISTS labels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE CHECK(length(trim(name)) >= 1 AND length(name) <= 50),
  color TEXT NOT NULL CHECK(color GLOB '#[0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F]'),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Assignees table
CREATE TABLE IF NOT EXISTS assignees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(trim(name)) >= 1 AND length(name) <= 100),
  email TEXT UNIQUE CHECK(email IS NULL OR email LIKE '%_@_%._%'),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Task-Label junction table
CREATE TABLE IF NOT EXISTS task_labels (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label_id TEXT NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

-- Task-Assignee junction table
CREATE TABLE IF NOT EXISTS task_assignees (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  assignee_id TEXT NOT NULL REFERENCES assignees(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, assignee_id)
);

-- Task history table for time tracking
CREATE TABLE IF NOT EXISTS task_history (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK(status IN ('TODO', 'IN_PROGRESS', 'TESTING', 'DONE')),
  entered_at TEXT NOT NULL DEFAULT (datetime('now')),
  exited_at TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(status, position);
CREATE INDEX IF NOT EXISTS idx_task_labels_task ON task_labels(task_id);
CREATE INDEX IF NOT EXISTS idx_task_labels_label ON task_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_task ON task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_assignee ON task_assignees(assignee_id);
CREATE INDEX IF NOT EXISTS idx_task_history_task ON task_history(task_id);
CREATE INDEX IF NOT EXISTS idx_task_history_current ON task_history(task_id, exited_at) WHERE exited_at IS NULL;

-- Triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_task_timestamp;
CREATE TRIGGER update_task_timestamp
AFTER UPDATE ON tasks
BEGIN
  UPDATE tasks SET updated_at = datetime('now') WHERE id = NEW.id;
END;

DROP TRIGGER IF EXISTS update_task_status_timestamp;
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

DROP TRIGGER IF EXISTS increment_task_version;
CREATE TRIGGER increment_task_version
AFTER UPDATE ON tasks
BEGIN
  UPDATE tasks SET version = version + 1 WHERE id = NEW.id;
END;
