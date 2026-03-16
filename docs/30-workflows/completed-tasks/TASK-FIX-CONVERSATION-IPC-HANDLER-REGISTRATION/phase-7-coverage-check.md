# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 7                                              |
| Phase名    | カバレッジ確認                                 |
| タスクID   | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| 前提Phase  | Phase 6（テスト拡充: 全テスト PASS 確認済み）  |
| 後続Phase  | Phase 8（リファクタリング）                    |
| ステータス | pending                                        |
| 作成日     | 2026-03-16                                     |
| 機能名     | conversation-ipc-handler-registration          |

## 目的

Phase 4-6 で作成・拡充したテストが、実装コードのカバレッジ基準を充足しているかを確認する。

カバレッジ基準（プロジェクト標準）:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%+     | 90%+     |
| Branch Coverage   | 60%+     | 70%+     |
| Function Coverage | 80%+     | 90%+     |

基準未達の場合は Phase 6 に戻り、カバレッジ不足箇所のテストを追加する。
基準充足の場合は Phase 8（リファクタリング）へ進む。

## 実行タスク

- カバレッジ測定コマンドの実行
- `ipc/index.ts` の Section 13 部分（追加コード）のカバレッジ確認
- `registerConversationFallbackHandlers()` のカバレッジ確認
- 基準充足・未達の判定と次アクションの決定

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

| ファイル                   | パス                                                                                         | 備考                             |
| -------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 6 テスト拡充仕様書   | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-6-test-expansion.md` | カバレッジギャップ候補一覧       |
| 修正済みファイル           | `apps/desktop/src/main/ipc/index.ts`                                                         | カバレッジ測定対象（Section 13） |
| メインテストファイル       | `apps/desktop/src/main/ipc/__tests__/register-conversation-handlers.test.ts`                 | Phase 4-6 で作成・拡充したテスト |
| Graceful Degradationテスト | `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts`                       | T-08 conversation フォールバック |
| 二重登録テスト             | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`                        | activate サイクルテスト          |
| vitest.config.ts           | `apps/desktop/vitest.config.ts`                                                              | カバレッジ設定確認               |

## 実行手順

### Step 1: カバレッジ測定

**重要**: P40 準拠のため、テストは `apps/desktop/` ディレクトリから実行する。

```bash
# ipc/index.ts 単体のカバレッジ測定
cd apps/desktop && pnpm vitest run --coverage \
  src/main/ipc/__tests__/register-conversation-handlers.test.ts \
  src/main/ipc/__tests__/ipc-graceful-degradation.test.ts \
  src/main/ipc/__tests__/ipc-double-registration.test.ts \
  src/main/ipc/__tests__/conversationHandlers.test.ts \
  src/main/repositories/__tests__/conversationRepository.test.ts
```

**カバレッジ対象ファイル**（新規追加コードのみ）:

| ファイル       | 確認対象箇所                                                         |
| -------------- | -------------------------------------------------------------------- |
| `ipc/index.ts` | Section 13 追加コード（DB初期化、`safeRegister` 呼び出し、fallback） |
| `ipc/index.ts` | `registerConversationFallbackHandlers()` 関数全体                    |

### Step 2: カバレッジ結果の分析

#### Section 13 のカバレッジマッピング

| コード行                                               | カバーするテスト | カバレッジ期待値 |
| ------------------------------------------------------ | ---------------- | ---------------- |
| `const conversationDbPath = path.join(...)`            | T-01, T-06       | 100%             |
| `const db = new Database(conversationDbPath)`          | T-01, T-06       | 100%             |
| `db.pragma("journal_mode = WAL")`                      | T-06             | 100%             |
| `db.exec(CONVERSATION_DB_SCHEMA)`                      | T-07             | 100%             |
| `new ConversationRepository(db)`                       | T-01             | 100%             |
| `registerConversationHandlers(conversationRepository)` | T-01             | 100%             |
| `if (conversationRegistered) { successCount++ }`       | T-02             | 100%             |
| `else { registerConversationFallbackHandlers() }`      | T-03, T-E01      | 100%             |

#### registerConversationFallbackHandlers のカバレッジマッピング

| コード行                                       | カバーするテスト | カバレッジ期待値 |
| ---------------------------------------------- | ---------------- | ---------------- |
| `dbNotAvailableResponse` オブジェクト定義      | T-E06            | 100%             |
| `fallbackConversationHandlers` 配列定義（7行） | T-E06, T-08      | 100%             |
| `registerFallbackHandlers(...)` 呼び出し       | T-03, T-E01      | 100%             |

#### P41 対応: v8 カバレッジとインライン関数

**注意**: Vitest の v8 カバレッジプロバイダは `async () => dbNotAvailableResponse` のようなインライン arrow function を独立した関数としてカウントする。
`fallbackConversationHandlers` 配列の7つの `async () =>` が全てカバーされているかを確認する。

P41 対策:

```typescript
// テストでフォールバックハンドラを実際に呼び出してインライン関数をカバーする
const handlers = mockIpcMainHandle.mock.calls;
for (const [channel, handler] of handlers) {
  if (channel.startsWith("conversation:")) {
    const result = await handler({}, {});
    expect(result.error.code).toBe("DB_NOT_AVAILABLE");
  }
}
```

### Step 3: 基準判定テーブル

Phase 7 実施後に以下のテーブルを記入する:

| 指標              | 基準 | 測定値 | 判定 |
| ----------------- | ---- | ------ | ---- |
| Line Coverage     | 80%+ | TBD    | TBD  |
| Branch Coverage   | 60%+ | TBD    | TBD  |
| Function Coverage | 80%+ | TBD    | TBD  |

**判定フロー**:

```
全基準充足 → Phase 8 へ進む
Branch Coverage < 60% → Phase 6 に戻り、未カバー分岐のテストを追加
Function Coverage < 80% → Phase 6 に戻り、未呼び出し関数のテストを追加
Line Coverage < 80% → Phase 6 に戻り、未実行行のテストを追加
```

### Step 4: 未達の場合の対処

カバレッジ基準が未達の場合、以下の観点でテストを追加し、Phase 6 の対応として記録する:

| 未達指標          | 追加テスト観点                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| Branch Coverage   | `if (conversationRegistered)` の両分岐が両方テストされているか確認。未テストの分岐にテストを追加       |
| Function Coverage | `registerConversationFallbackHandlers` のインライン関数（7つの `async () =>`）が全て呼ばれているか確認 |
| Line Coverage     | `db.pragma` / `db.exec` の各行が実行されているか確認。エラーパスのみでスキップされている行がないか確認 |

### Step 5: 全体テスト実行（リグレッション確認）

```bash
# 全体テスト（ipc ディレクトリ）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/

# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint
```

## 統合テスト連携

| テストファイル                         | 目的                           | Phase 7 後の期待状態 |
| -------------------------------------- | ------------------------------ | -------------------- |
| register-conversation-handlers.test.ts | Section 13 登録フロー + 異常系 | 全テスト PASS        |
| ipc-graceful-degradation.test.ts       | フォールバックハンドラ応答確認 | 全テスト PASS        |
| ipc-double-registration.test.ts        | activate サイクル確認          | 全テスト PASS        |
| conversationHandlers.test.ts           | ハンドラ単体テスト             | 全テスト PASS        |
| conversationRepository.test.ts         | リポジトリ単体テスト           | 全テスト PASS        |

## 成果物

| 成果物             | パス                                                                                         | 内容                                             |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| カバレッジレポート | `apps/desktop/coverage/` (自動生成)                                                          | HTML カバレッジレポート                          |
| Phase 7 仕様書     | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-7-coverage-check.md` | 本ドキュメント（基準判定テーブルを記入して完了） |

## 完了条件

- [ ] カバレッジ測定コマンドが実行されている
- [ ] Line Coverage が 80%+ を達成している
- [ ] Branch Coverage が 60%+ を達成している
- [ ] Function Coverage が 80%+ を達成している
- [ ] P41 対応: v8 プロバイダのインライン arrow function が全てカバーされている
- [ ] 全テストが PASS している（新規テスト + 既存テスト）
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] 基準未達だった場合は Phase 6 に戻ってテストを追加し、再測定で基準を充足している
- [ ] 基準判定テーブル（Step 3）が実測値で記入されている

## 次のPhase

基準充足の場合 → Phase 8（リファクタリング）へ進む。

Phase 8 では以下を実施する:

1. Section 13 コードの可読性確認（コメント、変数名）
2. `registerConversationFallbackHandlers` の配置位置の最適化
3. TypeScript 型の精度向上（必要な場合）
4. コードの重複削減（必要な場合）

基準未達の場合 → Phase 6 に戻る。
