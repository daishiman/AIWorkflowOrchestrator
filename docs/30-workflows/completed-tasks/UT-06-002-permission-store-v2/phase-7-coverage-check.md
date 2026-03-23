# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 7                             |
| 機能名   | UT-06-002-permission-store-v2 |
| 作成日   | 2026-03-23                    |
| タスクID | UT-06-002                     |

## 目的

カバレッジ基準の充足を確認し、未達の場合は Phase 6 に戻る。

## 実行タスク

- Task 7-1: カバレッジ再測定 — 全テストファイルのカバレッジを測定
- Task 7-2: 基準判定 — Line 80%+, Branch 60%+, Function 80%+ を達成しているか判定
- Task 7-3: ゲート判定 — PASS（Phase 8 へ）or FAIL（Phase 6 に戻る）

## 参照資料

| 資料名         | パス                                | 説明           |
| -------------- | ----------------------------------- | -------------- |
| テスト拡充仕様 | `outputs/phase-6/test-expansion.md` | Phase 6 成果物 |

## 実行手順

### ステップ1: カバレッジ測定

```bash
pnpm --filter @repo/desktop test --coverage src/main/services/skill/__tests__/PermissionStore.test.ts
pnpm --filter @repo/shared test --coverage src/types/__tests__/calcExpiresAt.test.ts
pnpm --filter @repo/desktop test --coverage src/main/ipc/__tests__/permission-store-handlers.test.ts
```

### ステップ2: ゲート判定

| 判定 | 条件         | 対応           |
| ---- | ------------ | -------------- |
| PASS | 全基準達成   | Phase 8 へ     |
| FAIL | いずれか未達 | Phase 6 に戻る |

## 統合テスト連携

| 判定項目                | 基準 | 結果     |
| ----------------------- | ---- | -------- |
| ユニットテスト Line     | 80%+ | (実測値) |
| ユニットテスト Branch   | 60%+ | (実測値) |
| ユニットテスト Function | 80%+ | (実測値) |

## 多角的チェック観点

| 観点           | 適用 | 確認内容                               |
| -------------- | ---- | -------------------------------------- |
| アーキテクチャ | 適用 | カバレッジの偏り（特定レイヤーの不足） |

## 成果物

| 成果物             | パス                                 | 説明               |
| ------------------ | ------------------------------------ | ------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ測定結果 |

## 完了条件

- [ ] カバレッジが測定されている
- [ ] 全基準を達成している（未達の場合は Phase 6 に戻る）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング
