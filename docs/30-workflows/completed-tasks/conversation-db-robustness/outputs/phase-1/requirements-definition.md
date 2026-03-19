# Phase 1: 要件定義 - 成果物

## P50チェック結果

| 判定       | 結果                                                        |
| ---------- | ----------------------------------------------------------- |
| 既実装あり | 一部（Graceful Degradation フォールバック登録は実装済み）   |
| 既実装なし | DB初期化の Factory 関数分離・DI・ライフサイクル管理は未実装 |

**結論**: 通常の要件定義を実施する（「改善・リファクタリング」タスク）。

---

## 1. 現行 DB 初期化フロー Inventory

### 1.1 DB 初期化の実装場所

| 項目         | 現行実装                                                |
| ------------ | ------------------------------------------------------- |
| ファイル     | `apps/desktop/src/main/ipc/index.ts`                    |
| セクション   | Section 13（L933-956）                                  |
| パターン     | `safeRegister` 内のインライン匿名関数                   |
| DB パス      | `path.join(homeDir, ".claude", "conversations.db")`     |
| homeDir 解決 | `process.env.HOME \|\| process.env.USERPROFILE \|\| ""` |
| pragma       | `journal_mode = WAL` のみ                               |
| テーブル     | `chat_sessions` + `chat_messages` + 4インデックス       |

### 1.2 DB 初期化フロー（5ステップ）

```
1. homeDir = process.env.HOME || process.env.USERPROFILE || ""
2. conversationDbPath = path.join(homeDir, ".claude", "conversations.db")
3. db = new Database(conversationDbPath)          // better-sqlite3
4. db.pragma("journal_mode = WAL")                // WAL モード有効化
5. db.exec(CONVERSATION_DB_SCHEMA)                // DDL 実行
6. conversationRepository = new ConversationRepository(db)
7. registerConversationHandlers(conversationRepository)
```

### 1.3 Graceful Degradation フロー

```
safeRegister("registerConversationHandlers", initFn, failures)
  ├─ 成功 → successCount++
  └─ 失敗 → registerConversationFallbackHandlers()
             └─ 7チャンネル全て DB_NOT_AVAILABLE (ERR_4006) を返却
```

### 1.4 app.whenReady() フロー

```
app.whenReady()
  → electronApp.setAppUserModelId(...)
  → createApplicationMenu()
  → mainWindowRef = createWindow()
  → registerAllIpcHandlers(mainWindowRef)    // DB初期化はここでインライン実行

app.on("activate")
  → unregisterAllIpcHandlers()               // P5対策
  → mainWindowRef = createWindow()
  → registerAllIpcHandlers(mainWindowRef)    // DB再初期化を含む（問題点）
```

### 1.5 CONVERSATION_DB_SCHEMA

```sql
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

-- 4 indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_messages_session_message ON chat_messages(session_id, message_index);
```

---

## 2. 失敗シナリオ

| #   | シナリオ                            | 原因                            | 現在の結果                                     |
| --- | ----------------------------------- | ------------------------------- | ---------------------------------------------- |
| 1   | `~/.claude/` ディレクトリ未作成     | 初回起動                        | `SQLITE_CANTOPEN` → フォールバック             |
| 2   | better-sqlite3 ABI 不一致           | Electron と Node.js の ABI 差異 | `ERR_DLOPEN_FAILED` → フォールバック           |
| 3   | ディスク容量不足                    | ストレージ枯渇                  | `SQLITE_FULL` → フォールバック                 |
| 4   | ファイル権限なし                    | OS セキュリティ                 | `EACCES` → フォールバック                      |
| 5   | activate イベントでの DB 二重初期化 | macOS Dock クリック等で再活性化 | DB 二重初期化 → 旧 DB 未クローズ               |
| 6   | homeDir が空文字                    | 環境変数未設定                  | path.join("", ...) → 不正パス → フォールバック |
| 7   | DB ファイルが壊れている             | 前回の不正終了                  | `SQLITE_CORRUPT` → フォールバック              |

---

## 3. FR/NFR 分類

### 機能要件（FR）

| FR-ID | 要件                                              | 優先度 |
| ----- | ------------------------------------------------- | ------ |
| FR-1  | DB初期化を `registerAllIpcHandlers` から分離する  | HIGH   |
| FR-2  | DB パスを `app.getPath('userData')` ベースに変更  | HIGH   |
| FR-3  | ディレクトリ事前作成（`mkdirSync` + `recursive`） | HIGH   |
| FR-4  | DB ライフサイクル管理（`will-quit` でクローズ）   | HIGH   |
| FR-5  | `registerAllIpcHandlers` への DB インスタンス DI  | HIGH   |
| FR-6  | activate イベントで DB を再利用（再初期化しない） | MEDIUM |

### 非機能要件（NFR）

| NFR-ID | 要件                                            | 優先度 |
| ------ | ----------------------------------------------- | ------ |
| NFR-1  | WAL モード + `synchronous = NORMAL` pragma 設定 | HIGH   |
| NFR-2  | `foreign_keys = ON` pragma 設定                 | HIGH   |
| NFR-3  | `busy_timeout = 5000` pragma 設定               | MEDIUM |
| NFR-4  | 既存133テストの後方互換性維持                   | HIGH   |
| NFR-5  | P9対策: テスト用 `_resetForTesting()` 関数提供  | MEDIUM |
| NFR-6  | Graceful Degradation パターン維持（S30準拠）    | HIGH   |

---

## 4. 既存テスト状況

| テストファイル                           | テスト数  | 実行結果          | 備考                                |
| ---------------------------------------- | --------- | ----------------- | ----------------------------------- |
| `conversationHandlers.test.ts`           | 43件      | 43 PASS           | IPC ハンドラ単体テスト              |
| `register-conversation-handlers.test.ts` | 22件      | 22 PASS           | ハンドラ登録統合テスト              |
| `conversationRepository.test.ts`         | 75件      | 75 SKIP           | better-sqlite3 ABI不一致でSKIP (P7) |
| **合計**                                 | **140件** | 65 PASS / 75 SKIP |                                     |

> 仕様書の「133テスト」は実測では140件（conversationHandlers: 43, register-conversation-handlers: 22, conversationRepository: 75）。register-conversation-handlers は元の15件から22件に増加している。
