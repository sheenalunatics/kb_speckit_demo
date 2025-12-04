const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "data", "kanban.db");
const sqlPath = path.join(__dirname, "db-init.sql");

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("✓ Created data directory");
}

// Read SQL schema
const schema = fs.readFileSync(sqlPath, "utf-8");

// Initialize database
console.log("Initializing database...");
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Execute schema
try {
  db.exec(schema);
  console.log("✓ Database schema created successfully");
  console.log(`✓ Database location: ${dbPath}`);
} catch (error) {
  console.error("✗ Error creating database schema:", error);
  process.exit(1);
} finally {
  db.close();
}
