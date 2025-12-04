const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "data", "kanban.db");

// Delete existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log("✓ Deleted existing database");
}

// Re-initialize
console.log("Re-initializing database...");
require("./db-init.js");
