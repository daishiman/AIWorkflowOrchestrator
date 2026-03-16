# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 4                                                 |
| Phase名    | テスト作成                                        |
| タスクID   | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION    |
| 前提Phase  | Phase 3（設計レビュー: MINOR判定、Phase 4進行可） |
| 後続Phase  | Phase 5（実装）                                   |
| ステータス | pending                                           |
| 作成日     | 2026-03-16                                        |
| 機能名     | conversation-ipc-handler-registration             |

## 目的

TDD の Red フェーズとして、Phase 2 設計に基づくテストコードを先に作成する。
この時点では実装（Phase 5）が存在しないため、テストは失敗（Red）する。

以下を検証するテストケースを作成する:

1. `registerAllIpcHandlers()` が conversation ハンドラ（7チャンネル）を登録すること
2. DB初期化成功時にハンドラが正常登録されること
3. DB初期化失敗時にフォールバックハンドラが登録されること
4. `unregisterAllIpcHandlers()` 後に conversation チャンネルが解除されること
5. MINOR-02 対応: `ipc-graceful-degradation.test.ts` への conversation テスト追加

## 実行タスク

- 新規テストファイル `register-conversation-handlers.test.ts` の作成
- `ipc-graceful-degradation.test.ts` への conversationフォールバックテスト追加
- `ipc-double-registration.test.ts` の既存カバレッジ確認（追加要否判断）
- テスト実行による Red 状態確認

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

| ファイル                       | パス                                                                                        | 備考                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 2 設計書                 | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-2-design.md`        | Section 13 設計の詳細                |
| Phase 3 設計レビュー           | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-3-design-review.md` | MINOR-01, MINOR-02 の詳細            |
| IPC登録ハブ                    | `apps/desktop/src/main/ipc/index.ts`                                                        | `registerAllIpcHandlers()` 全体      |
| Graceful Degradationテスト     | `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts`                      | 既存テストパターン参照               |
| 二重登録テスト                 | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`                       | 既存テストパターン参照               |
| フォールバックハンドラテスト   | `apps/desktop/src/main/ipc/__tests__/fallback-handlers.test.ts`                             | FallbackHandler 型と登録パターン参照 |
| 既存conversationHandlersテスト | `apps/desktop/src/main/ipc/__tests__/conversationHandlers.test.ts`                          | 既存ハンドラ単体テストパターン参照   |

## 実行手順

### Step 1: テストケース設計

テスト対象は `registerAllIpcHandlers()` の conversation 登録機能（`ipc/index.ts` Section 13）。
`ipc-graceful-degradation.test.ts` のモックパターン（`vi.hoisted` + `vi.mock("electron", ...)` + 全ハンドラ登録関数のモック）を踏襲する。

#### テストケース一覧

| ID   | テストケース                                                | 期待結果                                                                                  | 対象ファイル                           |
| ---- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------- |
| T-01 | DB初期化成功時: 7チャンネルが登録される                     | `ipcMain.handle` が 7回 conversation チャンネルで呼ばれる                                 | register-conversation-handlers.test.ts |
| T-02 | DB初期化成功時: successCount に1加算される                  | `registrationResult.successCount` が増加                                                  | register-conversation-handlers.test.ts |
| T-03 | DB初期化失敗時: フォールバック7チャンネル登録               | `ipcMain.handle` が fallback の7チャンネルで呼ばれる                                      | register-conversation-handlers.test.ts |
| T-04 | DB初期化失敗時: failures に記録される                       | `registrationResult.failures` に `registerConversationHandlers` が含まれる                | register-conversation-handlers.test.ts |
| T-05 | unregister後: conversation チャンネルが解除される           | `ipcMain.removeHandler` が7チャンネルで呼ばれる                                           | register-conversation-handlers.test.ts |
| T-06 | WALモード設定が呼ばれること                                 | `mockDb.pragma` が `"journal_mode = WAL"` で呼ばれる                                      | register-conversation-handlers.test.ts |
| T-07 | DDL実行が呼ばれること                                       | `mockDb.exec` が呼ばれる（CONVERSATION_DB_SCHEMA）                                        | register-conversation-handlers.test.ts |
| T-08 | GD: conversation フォールバックが `DB_NOT_AVAILABLE` を返す | フォールバックハンドラが `{ success: false, error: { code: "DB_NOT_AVAILABLE" } }` を返す | ipc-graceful-degradation.test.ts       |

### Step 2: テストファイルの構造設計

#### 新規テストファイル: `register-conversation-handlers.test.ts`

```
apps/desktop/src/main/ipc/__tests__/register-conversation-handlers.test.ts
```

**モック構成（`vi.hoisted` パターン）**:

```typescript
const {
  mockIpcMainHandle,
  mockIpcMainRemoveHandler,
  mockIpcMainOn,
  mockIpcMainRemoveAllListeners,
  mockBrowserWindowInstance,
  mockGetAllWindows,
  mockNativeThemeOn,
  mockNativeThemeRemoveListener,
  mockThemeUnsubscribe,
  // conversation固有モック
  mockDatabase,
  mockDatabaseConstructor,
  mockConversationRepository,
  mockConversationRepositoryConstructor,
  mockRegisterConversationHandlers,
  // 既存ハンドラのモック（ipc-graceful-degradation.test.ts と同様）
  mockRegisterFileHandlers,
  // ... 他の既存ハンドラ
} = vi.hoisted(() => {
  const mockDb = {
    pragma: vi.fn(),
    exec: vi.fn(),
    close: vi.fn(),
  };
  const mockRepo = {
    /* ConversationRepository インスタンスモック */
  };
  return {
    mockIpcMainHandle: vi.fn(),
    mockIpcMainRemoveHandler: vi.fn(),
    // ...
    mockDatabase: mockDb,
    mockDatabaseConstructor: vi.fn().mockReturnValue(mockDb),
    mockConversationRepository: mockRepo,
    mockConversationRepositoryConstructor: vi.fn().mockReturnValue(mockRepo),
    mockRegisterConversationHandlers: vi.fn(),
    // ... 他の既存ハンドラモック
  };
});
```

**`vi.mock` 追加**:

- `vi.mock("better-sqlite3", ...)` — `mockDatabaseConstructor` を返す
- `vi.mock("../conversationHandlers", ...)` — `mockRegisterConversationHandlers` を使用
- `vi.mock("../../repositories/conversationRepository", ...)` — `mockConversationRepositoryConstructor` を使用

**テストケースの実装方針**:

- DB初期化成功テスト（T-01〜T-02, T-06〜T-07）: `mockDatabaseConstructor` が正常に動作するデフォルト状態で検証
- DB初期化失敗テスト（T-03〜T-04）: `mockDatabaseConstructor.mockImplementation(() => { throw new Error("DB init failed"); })` で DB コンストラクタをエラーにする
- unregisterテスト（T-05）: `registerAllIpcHandlers()` 後に `unregisterAllIpcHandlers()` を呼び、`mockIpcMainRemoveHandler` の呼び出しを検証

### Step 3: ipc-graceful-degradation.test.ts への追加（MINOR-02 対応）

既存の `ipc-graceful-degradation.test.ts` に以下のテストケースを追加する:

**追加位置**: 既存のフォールバックテストと同じ describe ブロック内

**追加内容（T-08）**:

```
describe("conversation フォールバックハンドラ", () => {
  it("DB初期化失敗時に conversation:list が DB_NOT_AVAILABLE を返す", ...)
  it("DB初期化失敗時に conversation:get が DB_NOT_AVAILABLE を返す", ...)
  // ... 7チャンネル分
});
```

**モックの追加要件**:

- `vi.hoisted` の既存オブジェクトに `mockRegisterConversationHandlers`、`mockDatabaseConstructor` を追加
- `vi.mock("better-sqlite3", ...)` を追加
- `vi.mock("./conversationHandlers", ...)` 等の相対パスでモックを追加

### Step 4: テスト実行（Red フェーズ確認）

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/register-conversation-handlers.test.ts
```

実装前のため、テストが失敗（Red 状態）することを確認する。
失敗理由は `ipc/index.ts` に Section 13 が未実装であるため `registerConversationHandlers` が呼ばれないこと。

## 統合テスト連携

| テストファイル                         | 目的                                     | Phase 5 後の期待状態  |
| -------------------------------------- | ---------------------------------------- | --------------------- |
| register-conversation-handlers.test.ts | Section 13 の登録フロー全体の検証        | 全テスト PASS         |
| ipc-graceful-degradation.test.ts       | フォールバックハンドラの応答内容検証     | 既存 PASS + 追加 PASS |
| ipc-double-registration.test.ts        | unregister→register サイクルの確認       | 既存 PASS（変更なし） |
| conversationHandlers.test.ts           | ハンドラ単体テスト（Phase 4 で変更なし） | 既存 PASS             |

## 成果物

| 成果物             | パス                                                                                        | 内容                                   |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| 新規テストファイル | `apps/desktop/src/main/ipc/__tests__/register-conversation-handlers.test.ts`                | T-01〜T-07 のテストケース              |
| 既存テスト追加     | `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts`（追記）              | T-08 conversation フォールバックテスト |
| Phase 4 仕様書     | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-4-test-creation.md` | 本ドキュメント                         |

## 完了条件

- [ ] `register-conversation-handlers.test.ts` が作成されている
- [ ] T-01〜T-07 のテストケースが実装されている
- [ ] `ipc-graceful-degradation.test.ts` に T-08 の conversation フォールバックテストが追加されている
- [ ] `ipc-double-registration.test.ts` の既存カバレッジが確認されている（追加不要と判断した場合はその理由を記録）
- [ ] テスト実行で Red フェーズ（失敗）が確認されている
- [ ] P39 準拠: happy-dom 環境のため `fireEvent` を使用（`userEvent` 不使用）
- [ ] P9 準拠: `beforeEach` でモックをリセット（`vi.clearAllMocks()`）

## 次のPhase

Phase 5（実装）へ進む。

Phase 5 では以下を実施する:

1. `ipc/index.ts` への import 追加（`registerConversationHandlers`, `ConversationRepository`, `Database`）
2. `CONVERSATION_DB_SCHEMA` 定数の追加
3. Section 13（`registerConversationHandlers` 登録）の追加
4. `registerConversationFallbackHandlers()` 関数の追加
5. Phase 4 テストが全て Green になることを確認
