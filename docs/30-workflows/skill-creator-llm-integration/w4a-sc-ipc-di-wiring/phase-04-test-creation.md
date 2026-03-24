# Phase 4: テスト作成

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 4                      |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

DI 配線完了後に `plan()` と `improve()` が LLM 呼び出しパスを通ることを検証するテストを作成する。既存テストファイルへの追加として実装する。

## 実行タスク

### Task 1: 既存テストの確認

修正前に以下の既存テストファイルの構造と import パスを確認する（P63 対策）:

| ファイル                                    | テスト数 |
| ------------------------------------------- | -------- |
| `RuntimeSkillCreatorFacade.test.ts`         | 9        |
| `RuntimeSkillCreatorFacade.plan.test.ts`    | 20       |
| `RuntimeSkillCreatorFacade.improve.test.ts` | 21       |
| `skillCreatorHandlers.runtime.test.ts`      | 5        |
| `skillCreatorHandlers.validation.test.ts`   | 46       |
| `skillCreatorHandlers.security.test.ts`     | 39       |
| `skillCreatorIpc.integration.test.ts`       | 71       |

合計: 211 件

### Task 2: DI 配線検証テストの設計

テスト対象: `apps/desktop/src/main/ipc/index.ts` 内の `track("registerSkillCreatorHandlers", ...)` ブロック

直接の単体テストは困難（index.ts はエントリポイントであり、大量の依存がある）。代わりに以下の間接検証テストを追加する。

#### テストケース一覧

**ファイル**: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` への追加

| ID    | テストケース名                                                               | 検証内容                                          |
| ----- | ---------------------------------------------------------------------------- | ------------------------------------------------- |
| DI-P1 | plan() は llmAdapter と resourceLoader が注入されていれば LLM パスを実行する | llmAdapter.sendChat が呼ばれることを確認          |
| DI-P2 | plan() は llmAdapter が undefined の場合スタブ応答を返す                     | Graceful Degradation が機能することを確認（既存） |

**ファイル**: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts` への追加

| ID    | テストケース名                                                    | 検証内容                                                  |
| ----- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| DI-I1 | improve() は全3依存が注入されていれば LLM パスを実行する          | llmAdapter.sendChat が呼ばれることを確認                  |
| DI-I2 | improve() は skillFileManager が undefined の場合エラー応答を返す | READ_ERROR が返却されることを確認（既存テストで検証済み） |

### Task 3: テスト実装

1. 既存テストファイルの import パスを `grep -n "^import" ファイル名` で確認する
2. 既存の mock 構成（`mockLLMAdapter`、`mockResourceLoader`、`mockSkillFileManager`）を確認する
3. 上記テストケースのうち、既存テストでカバー済みのもの（DI-P2、DI-I2）は追加不要であることを確認する
4. 新規テスト（DI-P1、DI-I1）が既存テストと重複しないことを確認する（既に `plan.test.ts` や `improve.test.ts` に LLM パスのテストが存在する場合は追加不要）

### Task 4: 全既存テストの PASS 確認

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorIpc
```

## 参照資料

- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`
- `.claude/rules/06-known-pitfalls.md` P63（サブエージェントによるインポートパス誤り）
- `.claude/rules/06-known-pitfalls.md` P60（IPC テスト応答形式の不一致）

## 成果物

- 追加テストケース（既存テストファイルへの追記、必要な場合のみ）
- 既存テスト 211 件の PASS 確認ログ

## 完了条件

- [ ] 既存テストファイルの構造と import パスを確認した
- [ ] DI-P1、DI-I1 が既存テストでカバー済みかどうかを判定した
- [ ] 必要な場合のみ新規テストを追加した
- [ ] 全既存テストが PASS することを確認した

## 次のPhase

Phase 5: 実装
