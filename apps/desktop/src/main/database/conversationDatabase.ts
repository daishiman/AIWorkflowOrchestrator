/**
 * Conversation Database
 *
 * Factory functions for managing the SQLite conversation database instance
 * using a module-level singleton pattern.
 *
 * @module @repo/desktop/main/database/conversationDatabase
 */
import Database from "better-sqlite3";
import { app } from "electron";
import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConversationDatabaseConfig {
  /** Default: app.getPath('userData') + '/conversations.db' */
  dbPath?: string;
  /** Default: true */
  enableWAL?: boolean;
  /** Default: 5000ms */
  busyTimeout?: number;
  /** Default: true */
  foreignKeys?: boolean;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/** Conversation DB schema definition (moved from ipc/index.ts) */
export const CONVERSATION_DB_SCHEMA = `
  CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    message_count INTEGER NOT NULL DEFAULT 0,
    is_favorite INTEGER NOT NULL DEFAULT 0,
    is_pinned INTEGER NOT NULL DEFAULT 0,
    pin_order INTEGER,
    last_message_preview TEXT,
    metadata JSON NOT NULL DEFAULT '{}',
    deleted_at TEXT
  );
  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    message_index INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    llm_provider TEXT,
    llm_model TEXT,
    llm_metadata JSON,
    attachments JSON NOT NULL DEFAULT '[]',
    system_prompt TEXT,
    metadata JSON NOT NULL DEFAULT '{}',
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_messages_session_message
    ON chat_messages(session_id, message_index);
`;

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

let db: Database.Database | null = null;

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

/**
 * Initializes the conversation SQLite database.
 *
 * Idempotent: if the database has already been initialized the existing
 * instance is returned without re-opening the file.
 *
 * @param config - Optional configuration overrides.
 * @returns The initialized Database instance.
 * @throws {Error} When dbPath is provided but is empty or whitespace-only.
 */
export function initializeConversationDatabase(
  config?: ConversationDatabaseConfig,
): Database.Database {
  // Idempotency: return existing instance if already initialized
  if (db !== null) {
    return db;
  }

  const {
    dbPath: configDbPath,
    enableWAL = true,
    busyTimeout = 5000,
    foreignKeys = true,
  } = config ?? {};

  // P42 compliant 3-step validation for dbPath when explicitly provided
  if (configDbPath !== undefined) {
    if (typeof configDbPath !== "string") {
      throw new Error("dbPath must be a string");
    }
    if (configDbPath === "") {
      throw new Error("dbPath must not be an empty string");
    }
    if (configDbPath.trim() === "") {
      throw new Error("dbPath must not be a whitespace-only string");
    }
  }

  const resolvedDbPath =
    configDbPath ?? path.join(app.getPath("userData"), "conversations.db");

  // Ensure parent directory exists
  const dir = path.dirname(resolvedDbPath);
  fs.mkdirSync(dir, { recursive: true });

  // Open / create the database file
  const instance = new Database(resolvedDbPath);

  // Apply pragmas
  if (enableWAL) {
    instance.pragma("journal_mode = WAL");
  }
  if (foreignKeys) {
    instance.pragma("foreign_keys = ON");
  }
  instance.pragma(`busy_timeout = ${busyTimeout}`);
  instance.pragma("synchronous = NORMAL");

  // Apply schema DDL
  instance.exec(CONVERSATION_DB_SCHEMA);

  db = instance;
  return db;
}

/**
 * Returns the initialized conversation database instance.
 *
 * @returns The Database instance.
 * @throws {Error} When the database has not been initialized yet.
 */
export function getConversationDatabase(): Database.Database {
  if (db === null) {
    throw new Error(
      "Conversation database has not been initialized. Call initializeConversationDatabase() first.",
    );
  }
  return db;
}

/**
 * Returns whether the conversation database has been initialized.
 */
export function isConversationDatabaseInitialized(): boolean {
  return db !== null;
}

/**
 * Closes the conversation database after flushing the WAL to the main file.
 *
 * Safe to call when the database is already closed/uninitialized.
 */
export function closeConversationDatabase(): void {
  if (db === null) {
    return;
  }

  // Checkpoint the WAL before closing; failure is non-fatal
  try {
    db.pragma("wal_checkpoint(TRUNCATE)");
  } catch {
    // Checkpoint failure must not prevent the close
  }

  db.close();
  db = null;
}

/**
 * Resets the module-level database state for testing purposes.
 *
 * This closes the current database connection (if any) and sets the
 * module-level reference to null so that the next call to
 * initializeConversationDatabase() starts fresh.
 *
 * @internal Do not use in production code. (P9 test isolation guard)
 */
export function _resetForTesting(): void {
  if (db !== null) {
    try {
      db.close();
    } catch {
      // Ignore errors during test teardown
    }
    db = null;
  }
}
