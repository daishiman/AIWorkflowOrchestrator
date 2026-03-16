# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 8                                              |
| Phase名    | リファクタリング                               |
| タスクID   | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| 前提Phase  | Phase 7（カバレッジ確認）                      |
| 後続Phase  | Phase 9（品質検証）                            |
| ステータス | pending                                        |
| 作成日     | 2026-03-16                                     |
| 機能名     | conversation-ipc-handler-registration          |

## 目的

TDD の Refactor フェーズとして、Phase 5 で実装した `ipc/index.ts` の Section 13（Conversation handlers）コードの品質を改善する。
**動作を変えずに**コード構造の整理のみ行い、テストが継続して全 PASS することを確認する。

具体的には以下を検討・実施する:

1. DB 初期化処理を `createConversationDatabase()` ヘルパー関数に抽出する（可読性向上）
2. フォールバックハンドラのチャンネル配列化が既存 `registerFallbackHandlers` パターンに準拠しているかの確認
3. Phase 3 で指摘された MINOR-01（`track()` パターン整合）への対応検討

## 実行タスク

- Section 13 コードの可読性・保守性評価
- `createConversationDatabase()` ヘルパー関数への抽出（要否判断 + 実施）
- フォールバックハンドラ構造の既存パターン整合確認
- MINOR-01 対応の実施（または設計通りの採用判断の記録）
- 全テストが継続 PASS することの確認

## 参照資料

### システム仕様テーブル

| 参照資料                             | パス                                                                                        | 内容                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| architecture-overview                | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Electronアーキテクチャ、IPC登録一覧      |
| security-electron-ipc                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ原則                      |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーハンドリングパターン               |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン（S30 Graceful Degradation） |

### コードベース参照

| ファイル         | パス                                                                                        | 備考                                        |
| ---------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| IPC登録ハブ      | `apps/desktop/src/main/ipc/index.ts`                                                        | Section 13 が追加されている実装対象ファイル |
| Phase 2 設計書   | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-2-design.md`        | Step 3-4 の実装設計                         |
| Phase 3 レビュー | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-3-design-review.md` | MINOR-01, MINOR-02 の指摘内容               |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                                        | P5, P42, P54                                |

## 実行手順

### Step 1: 現行実装の評価

Phase 5 で実装した Section 13 のコードを読み、以下の観点で評価する。

#### 評価観点

| 観点               | 確認内容                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------- |
| 可読性             | Section 13 の try ブロックが長すぎないか（目安: 30行以下）                                    |
| パターン整合       | `track()` を使用するか、`safeRegister` 直接使用かの整合確認（MINOR-01）                       |
| フォールバック構造 | `registerFallbackHandlers` に渡す配列が既存パターンと一致しているか                           |
| 定数配置           | `CONVERSATION_DB_SCHEMA` の配置位置が適切か                                                   |
| 命名規則           | `createConversationDatabase`, `registerConversationFallbackHandlers` の命名が規則に合致するか |

### Step 2: `createConversationDatabase()` ヘルパー関数への抽出（要否判断）

DB 初期化処理（パス生成 → `new Database()` → `db.pragma()` → `db.exec()`）を
独立した関数に抽出することで、Section 13 の可読性が向上する。

#### 抽出の判断基準

- Section 13 の try ブロックが 15 行を超える場合: **抽出を実施**
- 15 行以下の場合: インラインのまま維持

#### 抽出する場合の設計

```typescript
/**
 * 会話DBを初期化してインスタンスを返す。
 * 失敗時は例外をスローする（呼び出し元でキャッチする）。
 */
function createConversationDatabase(homeDir: string): Database.Database {
  const conversationDbPath = path.join(homeDir, ".claude", "conversations.db");
  const db = new Database(conversationDbPath);
  db.pragma("journal_mode = WAL");
  db.exec(CONVERSATION_DB_SCHEMA);
  return db;
}
```

この関数は `registerAllIpcHandlers()` の **外側**（モジュールスコープ直前）に定義する。
`homeDir` は `registerAllIpcHandlers()` スコープ内の変数のため、引数として受け取る。

#### 抽出後の Section 13 コード

```typescript
// --- 13. Conversation handlers ---
const conversationRegistered = safeRegister(
  "registerConversationHandlers",
  () => {
    const db = createConversationDatabase(homeDir);
    const conversationRepository = new ConversationRepository(db);
    registerConversationHandlers(conversationRepository);
  },
  failures,
);
if (conversationRegistered) {
  successCount++;
} else {
  registerConversationFallbackHandlers();
}
```

### Step 3: MINOR-01 対応（Phase 3 指摘への対応）

Phase 3 MINOR-01 の指摘: `track()` を使用せず `safeRegister()` の戻り値で分岐する変則パターン。

#### 対応判断

既存の Section 4（Supabase 条件分岐）パターンと比較し、以下を判断する:

| 判断                 | 対応内容                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| 整合可能             | `safeRegister` + 戻り値判断 + `successCount++` の明示的構造に統一（設計通りを採用）                  |
| `track()` 内包が可能 | `track()` ヘルパーを拡張してフォールバック callback を引数に追加する（大規模変更のため未実施とする） |

**推奨判断**: `safeRegister()` の戻り値を使用する構造は機能的に正しく、
フォールバック登録という **追加の副作用** を明示的に示す点で可読性が高い。
`track()` は「登録成功のカウントのみ」が責務であり、フォールバック登録の責務を持たせることは SRP 違反になる。
よって **設計通りの構造を採用し、MINOR-01 は「設計通り採用」として解消** する。

この判断を `outputs/phase-8/` 成果物に記録する。

### Step 4: フォールバックハンドラ構造の確認

`registerConversationFallbackHandlers()` の実装が以下のパターンに準拠していることを確認する。

```typescript
// 既存 registerFallbackHandlers の型シグネチャに合致していること
type FallbackHandler = readonly [
  channel: string,
  handler: () => Promise<unknown>,
];

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

7チャンネル全てが網羅されているか確認する。

### Step 5: テスト継続 PASS の確認

リファクタリング後に以下を実行し、全 PASS を確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/
```

テストが失敗した場合はリファクタリングを元に戻し、原因を特定する。

## 統合テスト連携

リファクタリング後も以下のテストが全 PASS であることを確認する:

| テストファイル                                                         | 確認内容                              |
| ---------------------------------------------------------------------- | ------------------------------------- |
| `apps/desktop/src/main/ipc/__tests__/conversationHandlers.test.ts`     | 全テスト PASS（ハンドラ動作不変）     |
| `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts` | フォールバックハンドラ登録の継続 PASS |
| `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`  | 二重登録防止の継続 PASS               |

## 成果物

| 成果物                   | パス                                                                                      | 内容                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Phase 8 仕様書           | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-8-refactoring.md` | 本ドキュメント                                                    |
| リファクタリング判断記録 | `outputs/phase-8/refactoring-decisions.md`                                                | MINOR-01 対応判断と `createConversationDatabase()` 抽出判断の記録 |

## 完了条件

- [ ] Section 13 コードの可読性評価が完了している
- [ ] `createConversationDatabase()` 抽出の要否判断が記録されている（実施した場合は実装済み）
- [ ] MINOR-01（`track()` パターン整合）への対応判断が記録されている
- [ ] フォールバックハンドラが 7 チャンネル全て網羅されていることを確認済み
- [ ] リファクタリング後に `cd apps/desktop && pnpm vitest run src/main/ipc/` が全 PASS

## 次のPhase

Phase 9（品質検証）へ進む。ESLint・TypeScript 型チェック・全テスト実行を行い、品質ゲートをパスする。
