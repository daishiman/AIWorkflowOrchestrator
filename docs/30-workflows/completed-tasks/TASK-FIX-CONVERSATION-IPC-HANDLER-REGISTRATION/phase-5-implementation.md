# Phase 5: 実装

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 5                                              |
| Phase名    | 実装                                           |
| タスクID   | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| 前提Phase  | Phase 4（テスト作成: Red フェーズ確認済み）    |
| 後続Phase  | Phase 6（テスト拡充）                          |
| ステータス | pending                                        |
| 作成日     | 2026-03-16                                     |
| 機能名     | conversation-ipc-handler-registration          |

## 目的

TDD の Green フェーズとして、Phase 4 で作成したテストを全て通す最小限の実装を行う。

修正対象は `apps/desktop/src/main/ipc/index.ts` の1ファイルのみ。

具体的な変更内容:

1. import 文の追加（`Database`, `ConversationRepository`, `registerConversationHandlers`）
2. `CONVERSATION_DB_SCHEMA` 定数の追加
3. `registerAllIpcHandlers()` 内 Section 13 の追加
4. `registerConversationFallbackHandlers()` 関数の追加

## 実行タスク

- `ipc/index.ts` のトップレベル import に3行を追加
- `CONVERSATION_DB_SCHEMA` 定数をモジュールスコープに追加
- `registerAllIpcHandlers()` 関数内の末尾セクションに Section 13 を追加
- `registerConversationFallbackHandlers()` 関数をファイル下部に追加
- Phase 4 テストが全て Green になることを確認

## 参照資料

### システム仕様テーブル

| 参照資料                             | パス                                                                                        | 内容                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| architecture-overview                | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Electronアーキテクチャ、IPC登録一覧      |
| database-implementation-core         | `.claude/skills/aiworkflow-requirements/references/database-implementation-core.md`         | better-sqlite3初期化の詳細               |
| security-electron-ipc                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ原則                      |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーハンドリングパターン               |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン（S30 Graceful Degradation） |

### コードベース参照

| ファイル                      | パス                                                                                        | 備考                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Phase 2 設計書                | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-2-design.md`        | 実装の詳細設計（DDL, Section 13, fallback）                        |
| Phase 4 テスト仕様書          | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-4-test-creation.md` | テストケース T-01〜T-08                                            |
| 修正対象ファイル              | `apps/desktop/src/main/ipc/index.ts`                                                        | L517-881: `registerAllIpcHandlers()` 全体                          |
| Section 12（挿入直前）        | `apps/desktop/src/main/ipc/index.ts` L853-867                                               | Section 13 の挿入位置参照                                          |
| `safeRegister` ユーティリティ | `apps/desktop/src/main/ipc/index.ts`                                                        | `safeRegister` / `track` / `registerFallbackHandlers` パターン参照 |
| Conversationハンドラ          | `apps/desktop/src/main/ipc/conversationHandlers.ts`                                         | `registerConversationHandlers(repository): void`                   |
| Conversationリポジトリ        | `apps/desktop/src/main/repositories/conversationRepository.ts`                              | `constructor(db: Database.Database)`                               |
| リポジトリテスト（DDL参照）   | `apps/desktop/src/main/repositories/__tests__/conversationRepository.test.ts` L46-83        | スキーマDDL参照元                                                  |

## 実行手順

### Step 1: import 文の追加

`apps/desktop/src/main/ipc/index.ts` のトップレベル import セクションに以下を追加する。

追加位置: 既存の `import Database from "better-sqlite3"` が存在しない場合、他の `import` 文の末尾付近（`conversationHandlers` / `conversationRepository` はまだ import されていないため新規追加）。

```typescript
import Database from "better-sqlite3";
import { registerConversationHandlers } from "./conversationHandlers";
import { ConversationRepository } from "../repositories/conversationRepository";
```

**注意**: `better-sqlite3` は `conversationRepository.ts` で既に使用されているが、`ipc/index.ts` での直接 import が新規となる。既に `import Database from "better-sqlite3"` が存在する場合はスキップ。

### Step 2: CONVERSATION_DB_SCHEMA 定数の追加

`ipc/index.ts` のモジュールスコープ定数として追加する。
配置位置: import 群の直後（他のモジュールスコープ定数と同じ位置）。

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

### Step 3: Section 13 の追加（registerAllIpcHandlers 内）

`registerAllIpcHandlers()` 関数内の Section 12（Chat Edit handlers）の直後、サマリーログの直前に Section 13 を挿入する。

挿入位置の目印: `// --- 12. Chat Edit handlers ---` セクションの終わり（`registerChatEditHandlers` の `track` 呼び出し後）。

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
  // DB初期化失敗時: 全7チャンネルにフォールバックハンドラを登録
  registerConversationFallbackHandlers();
}
```

**MINOR-01 対応についての判断**: Phase 3 MINOR-01 では `track()` との整合性を検討するよう指摘があったが、
フォールバック分岐が必要なため `safeRegister` の戻り値を直接使用する設計を維持する。
Supabase の条件分岐（Section 4）と同様に、外側の `if/else` で制御する合理的なパターンである。

### Step 4: registerConversationFallbackHandlers 関数の追加

`ipc/index.ts` のファイル下部（`registerFallbackHandlers` ユーティリティ関数の近くか、既存のフォールバック関数群と同じ位置）に追加する。

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

**注意**: `FallbackHandler` 型は `ipc/index.ts` 内で既に定義されているため、新規型定義は不要。
`IPC_CHANNELS.CONVERSATION_*` は `channels.ts` L276-282 に定義済みであることを確認する。

### Step 5: テスト実行（Green フェーズ確認）

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/register-conversation-handlers.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/ipc-graceful-degradation.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/conversationHandlers.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/ipc-double-registration.test.ts
```

全てのテストが PASS（Green 状態）になることを確認する。

### Step 6: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

型エラーがないことを確認する。

## 統合テスト連携

| テストファイル                         | 目的                                 | 期待状態                       |
| -------------------------------------- | ------------------------------------ | ------------------------------ |
| register-conversation-handlers.test.ts | Section 13 の登録フロー全体の検証    | 全テスト PASS（Green）         |
| ipc-graceful-degradation.test.ts       | フォールバックハンドラの応答内容検証 | 既存 PASS + T-08 PASS（Green） |
| ipc-double-registration.test.ts        | unregister→register サイクルの確認   | 既存 PASS（変更なし）          |
| conversationHandlers.test.ts           | ハンドラ単体テスト（変更なし）       | 既存 PASS                      |

## 成果物

| 成果物         | パス                                                                                         | 内容                                                                     |
| -------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 修正ファイル   | `apps/desktop/src/main/ipc/index.ts`                                                         | import追加、CONVERSATION_DB_SCHEMA追加、Section 13追加、fallback関数追加 |
| Phase 5 仕様書 | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-5-implementation.md` | 本ドキュメント                                                           |

## 完了条件

- [ ] `ipc/index.ts` に `Database`, `registerConversationHandlers`, `ConversationRepository` の import が追加されている
- [ ] `CONVERSATION_DB_SCHEMA` 定数がモジュールスコープに追加されている
- [ ] Section 13（`registerConversationHandlers` 登録）が `registerAllIpcHandlers()` 内に追加されている
- [ ] `registerConversationFallbackHandlers()` 関数が追加されている
- [ ] `register-conversation-handlers.test.ts` の全テスト（T-01〜T-07）が PASS している
- [ ] `ipc-graceful-degradation.test.ts` の全テスト（既存 + T-08）が PASS している
- [ ] `conversationHandlers.test.ts` の全テストが PASS している（既存テスト破壊なし）
- [ ] `ipc-double-registration.test.ts` の全テストが PASS している（既存テスト破壊なし）
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] P42 準拠: `conversationHandlers.ts` 内の3段バリデーションが維持されている（変更なし確認）
- [ ] P5 準拠: 二重登録防止が維持されている（`IPC_CHANNELS.CONVERSATION_*` が `unregisterAllIpcHandlers()` 対象）

## 次のPhase

Phase 6（テスト拡充）へ進む。

Phase 6 では以下を実施する:

1. 異常系テスト（DB破損、権限エラー、ディスクフル）の追加
2. 二重登録防止テスト（activate サイクル）の追加
3. カバレッジ不足箇所の特定と補完
