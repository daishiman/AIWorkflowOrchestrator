# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 6                                              |
| Phase名    | テスト拡充                                     |
| タスクID   | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| 前提Phase  | Phase 5（実装: Green フェーズ確認済み）        |
| 後続Phase  | Phase 7（カバレッジ確認）                      |
| ステータス | pending                                        |
| 作成日     | 2026-03-16                                     |
| 機能名     | conversation-ipc-handler-registration          |

## 目的

Phase 4-5 で実装した正常系テストに加え、以下の観点でテストを拡充する:

1. **異常系テスト**: DB破損・権限エラー・ディスクフルなどの例外パターン
2. **activate サイクルテスト**: unregister → re-register の二重登録防止確認
3. **MINOR-02 完了確認**: `ipc-graceful-degradation.test.ts` の conversation テストが十分か確認
4. **カバレッジギャップの特定**: Phase 5 実装後の未カバー分岐の発見

## 実行タスク

- `register-conversation-handlers.test.ts` への異常系テスト追加
- `ipc-double-registration.test.ts` への conversation activate サイクルテスト追加（必要な場合）
- `ipc-graceful-degradation.test.ts` の MINOR-02 対応完了確認
- Phase 7 に向けたカバレッジギャップの記録

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

| ファイル                   | パス                                                                                         | 備考                          |
| -------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 4 テスト仕様書       | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-4-test-creation.md`  | T-01〜T-08 の完了確認         |
| Phase 5 実装仕様書         | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-5-implementation.md` | 実装コードの構造参照          |
| メインテストファイル       | `apps/desktop/src/main/ipc/__tests__/register-conversation-handlers.test.ts`                 | Phase 4 で作成したテスト      |
| Graceful Degradationテスト | `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts`                       | Phase 4 で追加したテスト      |
| 二重登録テスト             | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`                        | activate サイクルパターン参照 |
| IPC登録ハブ（実装済み）    | `apps/desktop/src/main/ipc/index.ts`                                                         | Phase 5 で修正済み            |

## 実行手順

### Step 1: 異常系テストケース設計

Phase 4 の T-01〜T-07（正常系）に加えて、以下の異常系テストケースを追加する。

#### 1-1. DB初期化異常系テスト

| ID    | テストケース                                         | エラー条件                                                                         | 期待結果                                                                      |
| ----- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| T-E01 | DB コンストラクタがエラーを投げる                    | `mockDatabaseConstructor` が `Error("EACCES: permission denied")`                  | フォールバックが登録される + failures に記録                                  |
| T-E02 | `db.pragma()` がエラーを投げる                       | `mockDb.pragma.mockImplementation(() => { throw new Error("SQLite error") })`      | フォールバックが登録される + failures に記録                                  |
| T-E03 | `db.exec()` がエラーを投げる（DB破損・ディスクフル） | `mockDb.exec.mockImplementation(() => { throw new Error("SQLITE_IOERR") })`        | フォールバックが登録される + failures に記録                                  |
| T-E04 | homeDir が空文字列の場合                             | `process.env.HOME = ""`, `process.env.USERPROFILE = ""`                            | DB path が `"/.claude/conversations.db"` になるが、フォールバックが登録される |
| T-E05 | `registerConversationHandlers` がエラーを投げる      | `mockRegisterConversationHandlers.mockImplementation(() => { throw new Error() })` | フォールバックが登録される + failures に記録                                  |

**テストコード構造（T-E01〜T-E05 の共通パターン）**:

```typescript
describe("DB初期化失敗: 異常系", () => {
  it("Databaseコンストラクタがエラーを投げた場合、フォールバックが登録される", async () => {
    mockDatabaseConstructor.mockImplementationOnce(() => {
      throw new Error("EACCES: permission denied");
    });
    const result = await registerAllIpcHandlers(mockBrowserWindowInstance);
    // フォールバック7チャンネルが登録されている
    const conversationChannels = [
      "conversation:list",
      "conversation:get",
      "conversation:create",
      "conversation:update",
      "conversation:delete",
      "conversation:addMessage",
      "conversation:search",
    ];
    for (const ch of conversationChannels) {
      expect(mockIpcMainHandle).toHaveBeenCalledWith(ch, expect.any(Function));
    }
    // failures に記録されている
    expect(result.failures).toContain("registerConversationHandlers");
  });
});
```

#### 1-2. フォールバック応答の内容確認テスト

| ID    | テストケース                                    | 期待結果                                                         |
| ----- | ----------------------------------------------- | ---------------------------------------------------------------- |
| T-E06 | DB初期化失敗後の `conversation:list` 呼び出し   | `{ success: false, error: { code: "DB_NOT_AVAILABLE" } }` を返す |
| T-E07 | DB初期化失敗後の `conversation:search` 呼び出し | `{ success: false, error: { code: "DB_NOT_AVAILABLE" } }` を返す |

**テストコード構造（T-E06〜T-E07）**:

```typescript
it("フォールバックハンドラが DB_NOT_AVAILABLE レスポンスを返す", async () => {
  mockDatabaseConstructor.mockImplementationOnce(() => {
    throw new Error("DB init failed");
  });
  await registerAllIpcHandlers(mockBrowserWindowInstance);
  // ipcMain.handle に渡されたハンドラを取り出す
  const handleCall = mockIpcMainHandle.mock.calls.find(
    (call) => call[0] === "conversation:list",
  );
  const handler = handleCall?.[1];
  const response = await handler?.({} /* IpcMainInvokeEvent mock */, {});
  expect(response).toEqual({
    success: false,
    error: {
      code: "DB_NOT_AVAILABLE",
      message: "Conversation database is not available",
    },
  });
});
```

### Step 2: activate サイクルテスト（ipc-double-registration.test.ts）

`ipc-double-registration.test.ts` の既存 activate サイクルテストに conversation チャンネルの確認を追加する。

**追加方針**: 既存テストが `registerAllIpcHandlers()` → `unregisterAllIpcHandlers()` → `registerAllIpcHandlers()` のサイクルを検証している場合、そこに conversation チャンネルの確認を追加する。

**確認観点**:

- `unregisterAllIpcHandlers()` 後に `ipcMain.removeHandler` が `conversation:*` 7チャンネルに対して呼ばれること
- 2回目の `registerAllIpcHandlers()` で `ipcMain.handle` が `conversation:*` で再び呼ばれること

**コード追加位置**: 既存の activate サイクルテスト内の期待値アサーション部分。

```typescript
// conversation チャンネルの unregister 確認
expect(mockIpcMainRemoveHandler).toHaveBeenCalledWith("conversation:list");
expect(mockIpcMainRemoveHandler).toHaveBeenCalledWith("conversation:get");
// ... 7チャンネル分
```

### Step 3: MINOR-02 完了確認

Phase 4 で追加した `ipc-graceful-degradation.test.ts` の T-08 を確認する:

| 確認項目                                                           | 確認方法                                        |
| ------------------------------------------------------------------ | ----------------------------------------------- |
| T-08 の全7チャンネルがフォールバックテストで網羅されているか       | テストコードの describe/it を確認               |
| 各フォールバックハンドラが `DB_NOT_AVAILABLE` を返すテストがあるか | アサーション内容を確認                          |
| 既存テストが PASS し続けているか                                   | `pnpm vitest run ipc-graceful-degradation` 実行 |

MINOR-02 が十分にカバーされていると判断できれば、完了とする。
不足している場合は追加テストを実装する。

### Step 4: テスト実行

```bash
# 拡充したテストを実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/register-conversation-handlers.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/ipc-double-registration.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/ipc-graceful-degradation.test.ts

# 関連テスト全体の確認
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/conversationHandlers.test.ts
cd apps/desktop && pnpm vitest run src/main/repositories/__tests__/conversationRepository.test.ts
```

全てのテストが PASS することを確認する。

### Step 5: カバレッジギャップの記録

以下の観点でカバレッジギャップを確認し、Phase 7 に向けて記録する:

| ギャップ候補                                           | 状況                              | Phase 7 での確認要否 |
| ------------------------------------------------------ | --------------------------------- | -------------------- |
| `CONVERSATION_DB_SCHEMA` の各テーブル定義実行          | 統合テストでのみ検証可能          | 確認                 |
| WAL モード pragma の引数正確性                         | T-06 でカバー                     | 確認                 |
| `registerConversationFallbackHandlers` の分岐          | T-03〜T-04, T-E01〜T-E05 でカバー | 確認                 |
| `if (conversationRegistered) { successCount++ }` 分岐  | T-01〜T-02 でカバー               | 確認                 |
| `else { registerConversationFallbackHandlers() }` 分岐 | T-03, T-E01 でカバー              | 確認                 |

## 統合テスト連携

| テストファイル                         | 追加テストケース          | 期待状態      |
| -------------------------------------- | ------------------------- | ------------- |
| register-conversation-handlers.test.ts | T-E01〜T-E07（異常系）    | 全テスト PASS |
| ipc-double-registration.test.ts        | activate サイクル追加確認 | 全テスト PASS |
| ipc-graceful-degradation.test.ts       | T-08 完了確認             | 全テスト PASS |

## 成果物

| 成果物                           | パス                                                                                         | 内容                  |
| -------------------------------- | -------------------------------------------------------------------------------------------- | --------------------- |
| テスト拡充（異常系）             | `apps/desktop/src/main/ipc/__tests__/register-conversation-handlers.test.ts`（追記）         | T-E01〜T-E07 の追加   |
| 二重登録テスト追加（必要な場合） | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`（追記）                | activate サイクル追加 |
| カバレッジギャップレポート       | Phase 7 仕様書に記録（本 Phase では記録のみ）                                                | 未カバー分岐の一覧    |
| Phase 6 仕様書                   | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-6-test-expansion.md` | 本ドキュメント        |

## 完了条件

- [ ] `register-conversation-handlers.test.ts` に T-E01〜T-E07（異常系）が追加されている
- [ ] DB破損（SQLITE_IOERR）・権限エラー（EACCES）・ディスクフル（SQLITE_FULL）の各ケースがテストされている
- [ ] フォールバックハンドラが `DB_NOT_AVAILABLE` レスポンスを返すことが検証されている
- [ ] `ipc-double-registration.test.ts` の activate サイクルに conversation チャンネルの確認が含まれている
- [ ] `ipc-graceful-degradation.test.ts` の MINOR-02 対応が完了している
- [ ] 全テストが PASS している
- [ ] P9 準拠: `beforeEach` で `vi.clearAllMocks()` が呼ばれ、テスト間で状態が共有されていない
- [ ] Phase 7 に向けたカバレッジギャップが記録されている

## 次のPhase

Phase 7（カバレッジ確認）へ進む。

Phase 7 では以下を実施する:

1. カバレッジ測定コマンドの実行
2. Line 80%+, Branch 60%+, Function 80%+ の基準確認
3. 基準未達の場合は Phase 6 に戻りテストを追加
