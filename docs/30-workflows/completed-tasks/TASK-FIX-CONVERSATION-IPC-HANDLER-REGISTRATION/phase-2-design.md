# Phase 2: 設計

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 2                                              |
| Phase名    | 設計                                           |
| タスクID   | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| 前提Phase  | Phase 1（要件定義）                            |
| 後続Phase  | Phase 3（設計レビュー）                        |
| ステータス | pending                                        |
| 作成日     | 2026-03-16                                     |
| 機能名     | conversation-ipc-handler-registration          |

## 目的

Phase 1 で確立した要件に基づき、以下の設計を決定する:

1. better-sqlite3 DBインスタンス生成の具体的な実装方法（ファイルパス、スキーマDDL、WALモード設定）
2. `registerAllIpcHandlers()` への追加箇所（セクション番号と挿入位置）
3. DB初期化失敗時のフォールバックハンドラ設計（S30 Graceful Degradation パターン）
4. 依存関係図

## 実行タスク

- DB初期化設計（better-sqlite3パス、スキーマDDL、WALモード）
- `registerAllIpcHandlers()` への追加設計（セクション番号、挿入位置）
- フォールバックハンドラ設計（DB初期化失敗時）
- 依存関係図の作成
- 既存パターンとの整合性確認

## 参照資料

### システム仕様テーブル

| 参照資料                             | パス                                                                                        | 内容                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| architecture-overview                | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Electronアーキテクチャ、IPC登録一覧      |
| database-schema                      | `.claude/skills/aiworkflow-requirements/references/database-schema.md`                      | SQLiteスキーマ定義                       |
| database-implementation              | `.claude/skills/aiworkflow-requirements/references/database-implementation.md`              | DB初期化パターン                         |
| database-implementation-core         | `.claude/skills/aiworkflow-requirements/references/database-implementation-core.md`         | better-sqlite3初期化の詳細               |
| security-electron-ipc                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ原則                      |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーハンドリングパターン               |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン（S30 Graceful Degradation） |

### コードベース参照

| ファイル                  | パス                                                                          | 備考                                       |
| ------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------ |
| IPC登録ハブ               | `apps/desktop/src/main/ipc/index.ts`                                          | L517-881: `registerAllIpcHandlers()` 全体  |
| セクション12（Chat Edit） | `apps/desktop/src/main/ipc/index.ts` L853-867                                 | 最終セクション（13の直前）                 |
| Conversationハンドラ      | `apps/desktop/src/main/ipc/conversationHandlers.ts`                           | `registerConversationHandlers(repository)` |
| Conversationリポジトリ    | `apps/desktop/src/main/repositories/conversationRepository.ts`                | `constructor(db: Database.Database)`       |
| リポジトリテスト          | `apps/desktop/src/main/repositories/__tests__/conversationRepository.test.ts` | スキーマDDL参照（L46-83）                  |
| Skillチェーン初期化例     | `apps/desktop/src/main/ipc/index.ts` L812-825                                 | ファイルパス生成パターン                   |

## 実行手順

### Step 1: 依存関係図

修正後のデータフロー:

```
[registerAllIpcHandlers(mainWindow)]
          |
          |- better-sqlite3 require (try-catch)
          |           |
          |    成功   |   失敗
          |     ↓     |     ↓
          |  DB生成   |  フォールバックハンドラ登録
          |  DDL実行  |  (7チャンネル × DB_NOT_AVAILABLE)
          |  WAL設定  |
          |     ↓
          |  ConversationRepository(db)
          |     ↓
          |  registerConversationHandlers(repository)
          |     ↓
          |  ipcMain.handle("conversation:list",   ...)
          |  ipcMain.handle("conversation:get",    ...)
          |  ipcMain.handle("conversation:create", ...)
          |  ipcMain.handle("conversation:update", ...)
          |  ipcMain.handle("conversation:delete", ...)
          |  ipcMain.handle("conversation:addMessage", ...)
          |  ipcMain.handle("conversation:search", ...)
```

依存関係（初期化順序）:

```
HOME env var
    ↓
conversations.db パス生成
    ↓
better-sqlite3 require（条件付き）
    ↓
Database インスタンス生成
    ↓
DDL 実行（CREATE TABLE IF NOT EXISTS）
    ↓
WAL モード設定
    ↓
ConversationRepository(db)
    ↓
registerConversationHandlers(repository)
    ↓
ipc/index.ts track("registerConversationHandlers", ...)
```

### Step 2: DB初期化設計

#### 2-1. DBファイルパス

`ipc/index.ts` 内の既存パターン（L645）に倣い、`homeDir` を再利用する:

```typescript
// L645で既に定義済み
const homeDir = process.env.HOME || process.env.USERPROFILE || "";
// 会話DB用パス（追加）
const conversationDbPath = path.join(homeDir, ".claude", "conversations.db");
```

`homeDir` は Section 8（Auth Key service + RuntimeResolver + Skill系ハンドラ）で既に `const homeDir` として定義されているため、Section 13 はその後に配置することで `homeDir` を参照できる。

#### 2-2. DDLスキーマ

`conversationRepository.test.ts` L46-83 で使用しているテスト用DDLをベースに、本番用 DDL（`CREATE TABLE IF NOT EXISTS`）を作成する:

```typescript
const CONVERSATION_DB_SCHEMA = `
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
```

#### 2-3. WALモード設定

better-sqlite3 では `db.pragma()` を使用して同期的にPRAGMAを設定する:

```typescript
db.pragma("journal_mode = WAL");
```

WALモードにより、読み取りと書き込みを並列実行可能にする。

#### 2-4. better-sqlite3 のロード方法

`conversationRepository.ts` は `import Database from "better-sqlite3"` を使用しているが、
`ipc/index.ts` での初期化では `createRequire` を使用して動的ロードする方法と、
直接 `import` する方法がある。

`conversationRepository.test.ts` L18-35 の既存パターン（`createRequire` + try-catch）を参考に、
`ipc/index.ts` でも同様のパターンを採用する:

- **選択**: `import Database from "better-sqlite3"` を `ipc/index.ts` のトップレベルに追加し、
  Section 13 の try-catch ブロック内でインスタンス生成。
  Electronの本番ビルドではnativeモジュールが確実にロードされるため、直接importを採用する。
  ただしロード失敗時のエラーを catch するため、インスタンス生成は try-catch で囲む。

### Step 3: registerAllIpcHandlers() への追加箇所

#### 3-1. 挿入位置: Section 13（新規追加）

現在の最終セクションは `--- 12. Chat Edit handlers ---`（L853-867）。
新規 Section 13 として `--- 13. Conversation handlers ---` を `--- サマリーログ ---`（L869）の直前に挿入する。

#### 3-2. import 追加

`ipc/index.ts` のトップレベル import に以下を追加する:

```typescript
import Database from "better-sqlite3";
import { registerConversationHandlers } from "./conversationHandlers";
import { ConversationRepository } from "../repositories/conversationRepository";
```

#### 3-3. Section 13 の実装設計

```typescript
// --- 13. Conversation handlers ---
track("registerConversationHandlers", () => {
  const conversationDbPath = path.join(homeDir, ".claude", "conversations.db");
  const db = new Database(conversationDbPath);
  db.pragma("journal_mode = WAL");
  db.exec(CONVERSATION_DB_SCHEMA);
  const conversationRepository = new ConversationRepository(db);
  registerConversationHandlers(conversationRepository);
});
```

`safeRegister` + `track` パターンを使用するため、DB生成失敗時は `safeRegister` の catch ブロックが
エラーをログに記録し、`failures` に追加する（P54対応: `registerConversationHandlers` は戻り値不要）。

### Step 4: Graceful Degradation フォールバック設計

#### 4-1. フォールバックが発動するケース

`safeRegister` の try-catch が catch する場合:

- better-sqlite3 native binary のロード失敗
- DBファイルパス作成失敗（ホームディレクトリが存在しない等）
- DDL実行エラー

#### 4-2. フォールバックハンドラの設計

`safeRegister` がエラーをキャッチした場合、`track` は `registerConversationHandlers` の登録をスキップする。
この時点で conversation チャンネルは「未登録」状態となり、Renderer からの呼び出しは
`"No handler registered for 'conversation:*'"` エラーになる。

これを防ぐため、`safeRegister` の catch 後にフォールバックハンドラを明示的に登録する構造とする。

**設計選択**: `track()` の外側で追加の try-catch を持つ構造ではなく、
専用の `registerConversationFallbackHandlers()` 関数を `ipc/index.ts` の下部に定義する:

```typescript
// --- 13. Conversation handlers ---
const conversationRegistered = safeRegister(
  "registerConversationHandlers",
  () => {
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
if (conversationRegistered) {
  successCount++;
} else {
  // DB初期化失敗時: フォールバックハンドラを登録
  registerConversationFallbackHandlers();
}
```

**注意**: `track()` ヘルパーは成功カウントのインクリメントのみを行うため、
フォールバックハンドラの登録判定には `safeRegister()` の戻り値を直接使用する。

#### 4-3. フォールバックハンドラ実装設計

```typescript
function registerConversationFallbackHandlers(): void {
  const dbNotAvailableResponse = {
    success: false as const,
    error: {
      code: "DB_NOT_AVAILABLE",
      message: "Conversation database is not available",
    },
  };
  const fallbackConversationHandlers: ReadonlyArray<FallbackHandler> = [
    [IPC_CHANNELS.CONVERSATION_LIST, async () => dbNotAvailableResponse],
    [IPC_CHANNELS.CONVERSATION_GET, async () => dbNotAvailableResponse],
    [IPC_CHANNELS.CONVERSATION_CREATE, async () => dbNotAvailableResponse],
    [IPC_CHANNELS.CONVERSATION_UPDATE, async () => dbNotAvailableResponse],
    [IPC_CHANNELS.CONVERSATION_DELETE, async () => dbNotAvailableResponse],
    [IPC_CHANNELS.CONVERSATION_ADD_MESSAGE, async () => dbNotAvailableResponse],
    [IPC_CHANNELS.CONVERSATION_SEARCH, async () => dbNotAvailableResponse],
  ];
  registerFallbackHandlers(fallbackConversationHandlers);
}
```

既存の `registerFallbackHandlers()` ユーティリティ（L896-902）を再利用する。

### Step 5: 定数 CONVERSATION_DB_SCHEMA の配置

`ipc/index.ts` のトップレベル定数として、他のモジュールスコープ変数（`themeWatcherUnsubscribe` など）と同様に定義する。ファイル先頭付近（import 群の直後）に配置する。

### Step 6: unregisterAllIpcHandlers() との整合性確認

`unregisterAllIpcHandlers()` は `Object.values(IPC_CHANNELS)` を走査し `ipcMain.removeHandler()` を呼ぶ。
`CONVERSATION_*` チャンネルは `channels.ts` L276-282 に定義済みのため、**追加対応不要**。

フォールバックハンドラも `ipcMain.handle()` で登録されるため、同様に解除される。

## 既存パターンとの整合性

| 確認項目                   | 既存パターン                                                 | 本設計での対応                                           |
| -------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| ハンドラ登録               | `track(name, fn)` = `safeRegister` + successCount++          | フォールバック分岐のため `safeRegister` + 条件分岐に変更 |
| ファイルパス生成           | `path.join(homeDir, ".claude", "...")`                       | 同じパターンを使用（L645の `homeDir` を参照）            |
| フォールバックハンドラ     | `registerFallbackHandlers(handlers)`                         | 同じ関数を再利用                                         |
| エラーメッセージサニタイズ | `sanitizeRegistrationErrorMessage()`                         | `safeRegister` 内で自動適用                              |
| P5 二重登録防止            | `unregisterAllIpcHandlers()` 後に `registerAllIpcHandlers()` | チャンネルが `IPC_CHANNELS` に含まれるため自動対応       |
| P54 safeRegister 適合      | 戻り値不要なハンドラに `safeRegister`                        | `registerConversationHandlers` は void 戻り値のため適合  |
| P42 trim バリデーション    | `conversationHandlers.ts` 内実装済み                         | 新規変更なし（確認のみ）                                 |

## 変更ファイル一覧

| ファイル                                                       | 変更種別 | 変更内容                                                                                             |
| -------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts`                           | 変更     | import追加、CONVERSATION_DB_SCHEMA定数追加、Section 13追加、registerConversationFallbackHandlers追加 |
| `apps/desktop/src/main/repositories/conversationRepository.ts` | 変更なし | 既に実装済み                                                                                         |
| `apps/desktop/src/main/ipc/conversationHandlers.ts`            | 変更なし | 既に実装済み                                                                                         |

## 統合テスト連携

設計に基づく実装後、以下のテストが通過することを確認する:

- `conversationHandlers.test.ts`: 全テストPASS
- `ipc-graceful-degradation.test.ts`: フォールバックハンドラ登録確認
- `ipc-double-registration.test.ts`: 二重登録防止確認

## 成果物

| 成果物         | パス                                                                                 | 内容           |
| -------------- | ------------------------------------------------------------------------------------ | -------------- |
| Phase 2 仕様書 | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-2-design.md` | 本ドキュメント |

## 完了条件

- [ ] DB初期化設計（ファイルパス、DDL、WALモード）が具体的に記述されている
- [ ] `registerAllIpcHandlers()` への追加箇所（Section 13）が明確に定義されている
- [ ] フォールバックハンドラの設計（DB初期化失敗時）が具体的に記述されている
- [ ] 依存関係図が作成されている
- [ ] 既存パターンとの整合性が確認されている
- [ ] 変更ファイル一覧が記載されている

## 次のPhase

Phase 3（設計レビュー）へ進む。設計の妥当性を以下の観点でレビューする:

- P5（二重登録防止）の確認
- P42（trim検証）の確認
- P54（safeRegister適合）の確認
- 既存テストとの共存確認
- PASS / MINOR / MAJOR 判定
