import Database from "better-sqlite3";
import path from "path";

// Get database path from environment or use default
const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), "data", "kanban.db");

// Singleton database instance
let db: Database.Database | null = null;

/**
 * Get or create database connection
 * Uses singleton pattern to reuse connection across API routes
 */
export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    // Enable foreign keys
    db.pragma("foreign_keys = ON");
    // Enable WAL mode for better concurrency
    db.pragma("journal_mode = WAL");
  }
  return db;
}

/**
 * Close database connection
 * Primarily for cleanup in tests or graceful shutdown
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Helper to generate UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Helper to convert SQLite datetime to ISO 8601 string
 */
export function toISOString(sqliteDate: string): string {
  return new Date(sqliteDate + "Z").toISOString();
}

/**
 * Helper to convert ISO 8601 string to SQLite datetime
 */
export function fromISOString(isoDate: string): string {
  return new Date(isoDate).toISOString().replace("T", " ").replace("Z", "");
}
