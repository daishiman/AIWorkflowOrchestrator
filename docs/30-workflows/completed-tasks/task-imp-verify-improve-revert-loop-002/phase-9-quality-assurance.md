# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 9                                       |
| 機能名 | task-imp-verify-improve-revert-loop-002 |
| 作成日 | 2026-03-30                              |

## 目的

品質保証（全品質ゲート通過確認）。TypeScript 型チェック、全テスト実行、Lint チェック、Shared パッケージビルド、リグレッション確認、カバレッジ品質ゲートを通過し、実装がプロジェクトの品質基準を満たしていることを検証する。

## 実行タスク

### Task 9-1: TypeScript 型チェック

**コマンド**:

```bash
pnpm --filter @repo/desktop typecheck
```

**期待結果**: エラー0件

**確認事項**:

- [ ] `SkillCreatorVerifyResult` の拡張フィールドに型エラーがない
- [ ] `RuntimeSkillCreatorVerifyAndImproveResult` の型定義にエラーがない
- [ ] `recordVerifyPass()` / `recordImproveAttempt()` / `getImproveAttemptCount()` の引数・戻り値型にエラーがない
- [ ] `verifyAndImproveLoop()` の Promise 戻り値型にエラーがない
- [ ] `formatVerifyChecksAsFeedback()` の引数・戻り値型にエラーがない

### Task 9-2: 全テスト実行

**コマンド**:

```bash
pnpm --filter @repo/desktop test
```

**期待結果**: 全件 PASS

**確認事項**:

- [ ] 全テストスイートが PASS している
- [ ] テスト実行時間が異常に長くない（無限ループの兆候なし）
- [ ] 失敗テスト 0件、スキップテストに意図しないものがない

### Task 9-3: Lint チェック

**コマンド**:

```bash
pnpm --filter @repo/desktop lint
```

**期待結果**: エラー0件

**確認事項**:

- [ ] 変更ファイル（WorkflowEngine / Facade / ヘルパー / 型定義）に Lint エラーがない
- [ ] 新規テストファイルに Lint エラーがない
- [ ] 未使用 import が残っていない
- [ ] `console.warn` の使用が Lint ルールに適合している（MR-02 対応分）

### Task 9-4: Shared パッケージビルド

**コマンド**:

```bash
pnpm --filter @repo/shared build
```

**期待結果**: ビルド成功

**確認事項**:

- [ ] `packages/shared/src/types/skillCreator.ts` の型拡張がビルドを破壊していない
- [ ] エクスポートされた型が正しく解決されている
- [ ] ビルド成果物に `SkillCreatorVerifyResult` の拡張フィールドが含まれている

### Task 9-5: リグレッション確認

**コマンド**:

```bash
# VerificationEngine 既存テスト
pnpm --filter @repo/desktop test -- --reporter=verbose SkillCreatorVerificationEngine

# WorkflowEngine 既存テスト
pnpm --filter @repo/desktop test -- --reporter=verbose SkillCreatorWorkflowEngine

# Facade 既存テスト
pnpm --filter @repo/desktop test -- --reporter=verbose RuntimeSkillCreatorFacade
```

**期待結果**: TASK-P0-01 の既存テスト（25件+）にリグレッションなし

**確認事項**:

- [ ] `SkillCreatorVerificationEngine` のテストが全件 PASS（Layer 1/2 チェックのテスト）
- [ ] `SkillCreatorWorkflowEngine` の既存テストが全件 PASS（`recordVerifyFailure()` / `requestReverify()` 等）
- [ ] `RuntimeSkillCreatorFacade` の既存テストが全件 PASS（`verifySkill()` / `improve()` / `applyImprovement()` 等）
- [ ] 新規追加テストと既存テストが共存して問題なく実行されている

### Task 9-6: カバレッジ品質ゲート

**コマンド**:

```bash
pnpm --filter @repo/desktop test -- --coverage --reporter=verbose SkillCreatorWorkflowEngine RuntimeSkillCreatorFacade formatVerifyChecksAsFeedback
```

**カバレッジ目標**:

| メトリクス | 目標値 | 説明                                              |
| ---------- | ------ | ------------------------------------------------- |
| Line       | 80%+   | 新規追加行の80%以上がテストでカバーされている     |
| Branch     | 60%+   | 分岐（if/else/switch）の60%以上がカバーされている |
| Function   | 80%+   | 新規追加関数の80%以上がテストでカバーされている   |

**確認事項**:

- [ ] `recordVerifyPass()` のカバレッジが Line 80%+ を満たしている
- [ ] `recordImproveAttempt()` のカバレッジが Line 80%+ を満たしている
- [ ] `verifyAndImproveLoop()` のカバレッジが Branch 60%+ を満たしている（全分岐パスのカバレッジ）
- [ ] `formatVerifyChecksAsFeedback()` のカバレッジが Line/Function 80%+ を満たしている

## 品質ゲートサマリー

| ゲート                | コマンド                                | 期待結果                                | 判定 |
| --------------------- | --------------------------------------- | --------------------------------------- | ---- |
| TypeScript 型チェック | `pnpm --filter @repo/desktop typecheck` | エラー0件                               | [ ]  |
| 全テスト              | `pnpm --filter @repo/desktop test`      | 全件 PASS                               | [ ]  |
| Lint                  | `pnpm --filter @repo/desktop lint`      | エラー0件                               | [ ]  |
| Shared ビルド         | `pnpm --filter @repo/shared build`      | ビルド成功                              | [ ]  |
| リグレッション        | 個別テストスイート実行（3コマンド）     | 既存25件+ 全PASS                        | [ ]  |
| カバレッジ            | `--coverage` 付きテスト実行             | Line 80%+ / Branch 60%+ / Function 80%+ | [ ]  |

## 参照資料

| 資料名                   | パス                                                                       | 説明                      |
| ------------------------ | -------------------------------------------------------------------------- | ------------------------- |
| Phase 1 要件             | `phase-1-requirements.md`                                                  | 要件定義                  |
| Phase 2 設計             | `phase-2-design.md`                                                        | 詳細設計                  |
| Phase 3 設計レビュー     | `phase-3-design-review.md`                                                 | レビュー結果              |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                                                   | リファクタリング結果      |
| WorkflowEngine           | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`     | 状態管理の拡張対象        |
| Facade                   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`      | パイプライン追加先        |
| VerificationEngine       | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` | verify 実行元（変更なし） |
| ヘルパー関数             | `apps/desktop/src/main/services/runtime/formatVerifyChecksAsFeedback.ts`   | ユーティリティ            |
| 型定義                   | `packages/shared/src/types/skillCreator.ts`                                | 型追加先                  |

## 統合テスト連携

| 観点               | 内容                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| 品質ゲート結果活用 | Phase 10 最終レビューゲートでの判定根拠として参照する                              |
| リグレッション根拠 | TASK-P0-01 既存テスト群の PASS 結果を Phase 10 AC-7 の検証エビデンスとして使用する |

## 成果物

| 成果物       | パス                                         | 説明           |
| ------------ | -------------------------------------------- | -------------- |
| 品質保証記録 | `phase-9-quality-assurance.md`（本ファイル） | 品質ゲート結果 |

## 完了条件

- [ ] TypeScript 型チェックがエラー0件で通過している
- [ ] 全テストが PASS している
- [ ] Lint チェックがエラー0件で通過している
- [ ] Shared パッケージビルドが成功している
- [ ] TASK-P0-01 の既存テスト（25件+）にリグレッションがないことを確認している
- [ ] カバレッジが品質ゲート（Line 80%+ / Branch 60%+ / Function 80%+）を満たしている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビューゲート
