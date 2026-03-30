# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 7                                       |
| 機能名 | task-imp-verify-improve-revert-loop-002 |
| 作成日 | 2026-03-30                              |

## 目的

Phase 5・6 で実装・テストした新規コードのテストカバレッジを測定し、品質基準を満たしていることを確認する。不足箇所があれば追加テストを作成する。

## 実行タスク

### Task 7-1: カバレッジ測定実行

#### 実行コマンド

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test -- --coverage --run
```

#### カバレッジ対象ファイル

| ファイル                                    | 変更種別 | カバレッジ測定対象         |
| ------------------------------------------- | -------- | -------------------------- |
| `formatVerifyChecksAsFeedback.ts`           | 新規     | 全体                       |
| `SkillCreatorWorkflowEngine.ts`             | 追加     | 新規メソッドのみ           |
| `RuntimeSkillCreatorFacade.ts`              | 追加     | 新規メソッドのみ           |
| `packages/shared/src/types/skillCreator.ts` | 追加     | 型のみ（カバレッジ対象外） |

### Task 7-2: 新規コードのカバレッジ確認

#### 品質ゲート

| メトリクス | 目標値 | 判定基準                                   |
| ---------- | ------ | ------------------------------------------ |
| Line       | 80%+   | 新規コードの行カバレッジ                   |
| Branch     | 60%+   | 条件分岐（if/else, try/catch）のカバレッジ |
| Function   | 80%+   | 新規関数・メソッドのカバレッジ             |

#### ファイル別カバレッジ確認

| ファイル                          | 確認対象メソッド/関数                                                      | Line 目標 | Branch 目標 | Function 目標 |
| --------------------------------- | -------------------------------------------------------------------------- | --------- | ----------- | ------------- |
| `formatVerifyChecksAsFeedback.ts` | `formatVerifyChecksAsFeedback()`                                           | 80%+      | 60%+        | 100%          |
| `SkillCreatorWorkflowEngine.ts`   | `recordVerifyPass()`, `recordImproveAttempt()`, `getImproveAttemptCount()` | 80%+      | 60%+        | 100%          |
| `RuntimeSkillCreatorFacade.ts`    | `verifyAndImproveLoop()`                                                   | 80%+      | 60%+        | 100%          |

#### 分岐カバレッジ重点確認箇所

`verifyAndImproveLoop()` の主要分岐:

| 分岐                                | Phase 4/6 テストでカバー済みか | テストケース                  |
| ----------------------------------- | ------------------------------ | ----------------------------- |
| 全チェック PASS → 正常終了          | ✅                             | Task 4-4: 初回 PASS           |
| maxRetry 到達 → loopExhausted       | ✅                             | Task 4-4: maxRetry exhaustion |
| improve LLM エラー → ループ停止     | ✅                             | Task 4-4: LLM error           |
| suggestions 空 → ループ停止         | ✅                             | Task 4-4: empty suggestions   |
| apply 失敗 → ループ停止             | ✅                             | Task 4-4: apply failure       |
| verify throw → エラー返却           | ✅                             | Task 6-4: verify throws       |
| verificationEngine 未DI → warn      | ✅                             | Task 4-4: 未DI テスト         |
| improve 成功 → re-verify ループ継続 | ✅                             | Task 6-6: 複合シナリオ        |

### Task 7-3: カバレッジ不足箇所の特定と追加テスト

#### 手順

1. カバレッジレポートを確認し、未カバーの行・分岐を特定
2. 未カバー箇所がテスト可能な場合、追加テストを作成
3. 未カバー箇所がテスト不要（型ガード、防御的コード等）の場合、理由を記録

#### カバレッジ不足時の対応方針

| 不足パターン                    | 対応                                     |
| ------------------------------- | ---------------------------------------- |
| 分岐の else 句が未カバー        | エッジケーステストを追加                 |
| catch ブロックが未カバー        | 例外を throw するモックテストを追加      |
| 型ガード（`!state` チェック等） | 存在しない planId でのテストを追加       |
| デフォルト値の分岐              | `maxImproveRetry` 未設定時のテストを追加 |

```bash
# 追加テスト作成後の再測定
pnpm --filter @repo/desktop test -- --coverage --run
```

### Task 7-4: カバレッジレポート生成

#### レポート出力形式

```bash
# テキストレポート（コンソール出力）
pnpm --filter @repo/desktop test -- --coverage --run

# HTML レポート（詳細確認用）
# vitest.config.ts の coverage.reporter に "html" が含まれている場合
# coverage/index.html で確認可能
```

#### レポート確認項目

| 確認項目                               | 確認方法                          |
| -------------------------------------- | --------------------------------- |
| 新規ファイルの Line カバレッジ         | コンソール出力の `% Stmts` 列     |
| 新規ファイルの Branch カバレッジ       | コンソール出力の `% Branch` 列    |
| 新規ファイルの Function カバレッジ     | コンソール出力の `% Funcs` 列     |
| 未カバー行の特定                       | HTML レポートで赤色表示の行を確認 |
| 既存ファイルのカバレッジ劣化がないこと | 変更前後のカバレッジ数値を比較    |

#### 最終カバレッジ記録テンプレート

| ファイル                          | Line  | Branch | Function | 判定 |
| --------------------------------- | ----- | ------ | -------- | ---- |
| `formatVerifyChecksAsFeedback.ts` | \_\_% | \_\_%  | \_\_%    | -    |
| `SkillCreatorWorkflowEngine.ts`   | \_\_% | \_\_%  | \_\_%    | -    |
| `RuntimeSkillCreatorFacade.ts`    | \_\_% | \_\_%  | \_\_%    | -    |
| **全体**                          | \_\_% | \_\_%  | \_\_%    | -    |

（Phase 7 実行時に実測値で埋める）

## 参照資料

| 資料名                              | パス                                                                                    | 説明               |
| ----------------------------------- | --------------------------------------------------------------------------------------- | ------------------ |
| Phase 4 テスト                      | `phase-4-test-creation.md`                                                              | 基本テストケース   |
| Phase 5 実装                        | `phase-5-implementation.md`                                                             | 実装詳細           |
| Phase 6 テスト拡充                  | `phase-6-test-expansion.md`                                                             | エッジケーステスト |
| formatVerifyChecksAsFeedback テスト | `apps/desktop/src/main/services/runtime/__tests__/formatVerifyChecksAsFeedback.test.ts` | カバレッジ対象     |
| WorkflowEngine テスト               | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`   | カバレッジ対象     |
| Facade テスト                       | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`    | カバレッジ対象     |

## 完了条件

- [ ] カバレッジ測定が実行されている
- [ ] `formatVerifyChecksAsFeedback.ts`: Line 80%+, Branch 60%+, Function 80%+
- [ ] `SkillCreatorWorkflowEngine.ts`（新規メソッド）: Line 80%+, Branch 60%+, Function 80%+
- [ ] `RuntimeSkillCreatorFacade.ts`（新規メソッド）: Line 80%+, Branch 60%+, Function 80%+
- [ ] カバレッジ不足箇所が特定され、追加テスト or 除外理由が記録されている
- [ ] カバレッジレポートの実測値がテンプレートに記入されている
- [ ] 既存ファイルのカバレッジ劣化がないこと
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング
