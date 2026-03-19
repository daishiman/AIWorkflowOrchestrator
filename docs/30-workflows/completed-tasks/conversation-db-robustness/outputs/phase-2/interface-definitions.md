# Phase 2: インターフェース定義

## 1. conversationDatabase.ts - Factory 関数群

```typescript
import Database from "better-sqlite3";
import { app } from "electron";
import fs from "node:fs";
import path from "node:path";

// --- 型定義 ---

export interface ConversationDatabaseConfig {
  /** DB ファイルパス（デフォルト: app.getPath('userData') + '/conversations.db'） */
  dbPath?: string;
  /** WAL モード有効化（デフォルト: true） */
  enableWAL?: boolean;
  /** ビジーリトライタイムアウト（デフォルト: 5000ms） */
  busyTimeout?: number;
  /** 外部キー制約有効化（デフォルト: true） */
  foreignKeys?: boolean;
}

// --- DB スキーマ ---

/** CONVERSATION_DB_SCHEMA: ipc/index.ts から移動 */
export const CONVERSATION_DB_SCHEMA = `
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  title TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  message_count INTEGER NOT NULL DEFAULT 0,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  pin_order INTEGER,
  last_message_preview TEXT,
  metadata TEXT DEFAULT '{}',
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  message_index INTEGER NOT NULL,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  llm_provider TEXT,
  llm_model TEXT,
  llm_metadata TEXT DEFAULT '{}',
  attachments TEXT DEFAULT '[]',
  system_prompt TEXT,
  metadata TEXT DEFAULT '{}',
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_messages_session_message ON chat_messages(session_id, message_index);
`;

// --- module-level state (Singleton) ---

let db: Database.Database | null = null;

// --- Factory 関数群 ---

/**
 * Conversation DB を初期化する。
 *
 * - ディレクトリが存在しない場合は自動作成（mkdirSync + recursive）
 * - pragma 設定: WAL, foreign_keys, busy_timeout, synchronous
 * - スキーマ DDL を実行
 * - 二重初期化時は既存インスタンスを返す（冪等性保証）
 *
 * @throws Error ディレクトリ作成失敗、DB ファイル作成失敗時
 */
export function initializeConversationDatabase(
  config?: ConversationDatabaseConfig,
): Database.Database {
  // 二重初期化防止（冪等性）
  if (db !== null) {
    return db;
  }

  const dbPath =
    config?.dbPath ?? path.join(app.getPath("userData"), "conversations.db");

  // P42 準拠3段バリデーション
  if (typeof dbPath !== "string" || dbPath === "" || dbPath.trim() === "") {
    throw new Error("DB path must be a non-empty string");
  }

  // ディレクトリ事前作成
  const dir = path.dirname(dbPath);
  fs.mkdirSync(dir, { recursive: true });

  // DB インスタンス生成
  db = new Database(dbPath);

  // pragma 設定
  if (config?.enableWAL !== false) {
    db.pragma("journal_mode = WAL");
  }
  if (config?.foreignKeys !== false) {
    db.pragma("foreign_keys = ON");
  }
  db.pragma(`busy_timeout = ${config?.busyTimeout ?? 5000}`);
  db.pragma("synchronous = NORMAL");

  // スキーマ DDL 実行
  db.exec(CONVERSATION_DB_SCHEMA);

  return db;
}

/**
 * 初期化済み DB インスタンスを取得する。
 *
 * @throws Error 未初期化時
 */
export function getConversationDatabase(): Database.Database {
  if (db === null) {
    throw new Error(
      "Conversation database is not initialized. Call initializeConversationDatabase() first.",
    );
  }
  return db;
}

/**
 * DB 初期化済みかどうかを返す。
 */
export function isConversationDatabaseInitialized(): boolean {
  return db !== null;
}

/**
 * DB を安全にクローズする。
 *
 * - WAL チェックポイントを実行してから close
 * - module-level state をリセット
 */
export function closeConversationDatabase(): void {
  if (db !== null) {
    try {
      db.pragma("wal_checkpoint(TRUNCATE)");
    } catch {
      // チェックポイント失敗は無視（DB 自体のクローズを優先）
    }
    db.close();
    db = null;
  }
}

/**
 * テスト用: module-level 状態をリセットする（P9対策）。
 * プロダクションコードでは使用しないこと。
 */
export function _resetForTesting(): void {
  if (db !== null) {
    try {
      db.close();
    } catch {
      // テスト中のクローズ失敗は無視
    }
  }
  db = null;
}
```

## 2. registerAllIpcHandlers - DI シグネチャ変更

```typescript
// Before: DB 初期化が内部にある
export function registerAllIpcHandlers(
  mainWindow: BrowserWindow,
): IpcHandlerRegistrationResult;

// After: DB インスタンスを外部から注入（null は初期化失敗を明示）
export function registerAllIpcHandlers(
  mainWindow: BrowserWindow,
  conversationDb?: Database.Database | null, // undefined で後方互換
): IpcHandlerRegistrationResult;
```

### Section 13 変更内容

```typescript
// Before (L933-956):
conversationRegistered = safeRegister(
  "registerConversationHandlers",
  () => {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";
    const conversationDbPath = path.join(
      homeDir,
      ".claude",
      "conversations.db",
    );
    const db = new Database(conversationDbPath);
    db.pragma("journal_mode = WAL");
    db.exec(CONVERSATION_DB_SCHEMA);
    const conversationRepository = new ConversationRepository(db);
    registerConversationHandlers(conversationRepository);
  },
  failures,
);

// After:
if (conversationDb) {
  // DI: 外部から DB インスタンスが注入された場合
  conversationRegistered = safeRegister(
    "registerConversationHandlers",
    () => {
      const conversationRepository = new ConversationRepository(conversationDb);
      registerConversationHandlers(conversationRepository);
    },
    failures,
  );
} else if (conversationDb === undefined) {
  // 後方互換: 引数未指定の場合は従来通り内部初期化
  conversationRegistered = safeRegister(
    "registerConversationHandlers",
    () => {
      const homeDir = process.env.HOME || process.env.USERPROFILE || "";
      const conversationDbPath = path.join(
        homeDir,
        ".claude",
        "conversations.db",
      );
      const db = new Database(conversationDbPath);
      db.pragma("journal_mode = WAL");
      db.exec(CONVERSATION_DB_SCHEMA);
      const conversationRepository = new ConversationRepository(db);
      registerConversationHandlers(conversationRepository);
    },
    failures,
  );
} else {
  // null: DB 初期化失敗が明示的に伝えられた場合
  conversationRegistered = false;
}
```

## 3. main/index.ts 統合

```typescript
// app.whenReady() 内:
import {
  initializeConversationDatabase,
  getConversationDatabase,
  closeConversationDatabase,
} from "./database/conversationDatabase";

app.whenReady().then(() => {
  // ... 既存コード ...

  // DB 初期化（失敗時は null）
  let conversationDb: Database.Database | null = null;
  try {
    conversationDb = initializeConversationDatabase();
  } catch (error) {
    console.error("[DB] Failed to initialize conversation database:", error);
  }

  mainWindowRef = createWindow();
  registerAllIpcHandlers(mainWindowRef, conversationDb);

  // ライフサイクル管理
  app.on("will-quit", () => {
    closeConversationDatabase();
  });

  // activate イベント (macOS)
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      unregisterAllIpcHandlers();
      mainWindowRef = createWindow();
      // 既存 DB インスタンスを再利用（再初期化しない）
      const existingDb = isConversationDatabaseInitialized()
        ? getConversationDatabase()
        : null;
      registerAllIpcHandlers(mainWindowRef, existingDb);
    }
  });
});
```
