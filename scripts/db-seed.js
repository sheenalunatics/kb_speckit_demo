const Database = require("better-sqlite3");
const path = require("path");
const { randomBytes } = require("crypto");

const dbPath = path.join(__dirname, "..", "data", "kanban.db");
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

console.log("Seeding database...");

try {
  // Helper to generate UUID
  const uuid = () => randomBytes(16).toString("hex");

  // Seed labels
  const labelInsert = db.prepare("INSERT INTO labels (id, name, color) VALUES (?, ?, ?)");
  const labels = [
    { id: uuid(), name: "Bug", color: "#EF4444" },
    { id: uuid(), name: "Feature", color: "#3B82F6" },
    { id: uuid(), name: "Enhancement", color: "#22C55E" },
    { id: uuid(), name: "Documentation", color: "#F59E0B" },
    { id: uuid(), name: "Urgent", color: "#F43F5E" },
  ];

  for (const label of labels) {
    labelInsert.run(label.id, label.name, label.color);
  }
  console.log(`✓ Created ${labels.length} labels`);

  // Seed assignees
  const assigneeInsert = db.prepare("INSERT INTO assignees (id, name, email) VALUES (?, ?, ?)");
  const assignees = [
    { id: uuid(), name: "Alice Johnson", email: "alice@example.com" },
    { id: uuid(), name: "Bob Smith", email: "bob@example.com" },
    { id: uuid(), name: "Carol White", email: "carol@example.com" },
  ];

  for (const assignee of assignees) {
    assigneeInsert.run(assignee.id, assignee.name, assignee.email);
  }
  console.log(`✓ Created ${assignees.length} assignees`);

  // Seed tasks
  const taskInsert = db.prepare(
    "INSERT INTO tasks (id, title, description, status, position) VALUES (?, ?, ?, ?, ?)"
  );
  const historyInsert = db.prepare(
    "INSERT INTO task_history (id, task_id, status) VALUES (?, ?, ?)"
  );
  const taskLabelInsert = db.prepare("INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)");
  const taskAssigneeInsert = db.prepare(
    "INSERT INTO task_assignees (task_id, assignee_id) VALUES (?, ?)"
  );

  const tasks = [
    {
      id: uuid(),
      title: "Setup project repository",
      description: "Initialize Git repository and create basic project structure",
      status: "DONE",
      position: 0,
      labelIds: [labels[1].id],
      assigneeIds: [assignees[0].id],
    },
    {
      id: uuid(),
      title: "Design database schema",
      description: "Create ERD and SQL schema for all entities",
      status: "DONE",
      position: 1,
      labelIds: [labels[3].id],
      assigneeIds: [assignees[0].id],
    },
    {
      id: uuid(),
      title: "Implement drag and drop",
      description: "Add @dnd-kit integration for card movement",
      status: "IN_PROGRESS",
      position: 0,
      labelIds: [labels[1].id],
      assigneeIds: [assignees[1].id],
    },
    {
      id: uuid(),
      title: "Add task filtering",
      description: "Implement search and filter by labels/assignees",
      status: "TODO",
      position: 0,
      labelIds: [labels[2].id],
      assigneeIds: [assignees[2].id],
    },
    {
      id: uuid(),
      title: "Fix task deletion bug",
      description: "Tasks are not being properly removed from database",
      status: "TODO",
      position: 1,
      labelIds: [labels[0].id, labels[4].id],
      assigneeIds: [assignees[1].id],
    },
  ];

  for (const task of tasks) {
    taskInsert.run(task.id, task.title, task.description, task.status, task.position);
    historyInsert.run(uuid(), task.id, task.status);

    for (const labelId of task.labelIds) {
      taskLabelInsert.run(task.id, labelId);
    }

    for (const assigneeId of task.assigneeIds) {
      taskAssigneeInsert.run(task.id, assigneeId);
    }
  }

  console.log(`✓ Created ${tasks.length} tasks with associations`);
  console.log("✓ Database seeded successfully");
} catch (error) {
  console.error("✗ Error seeding database:", error);
  process.exit(1);
} finally {
  db.close();
}
