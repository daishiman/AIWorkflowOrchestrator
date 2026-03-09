# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase      | 7                                         |
| Phase名    | カバレッジ確認                            |
| カテゴリ   | fix                                       |
| ステータス | completed                                 |
| 前提Phase  | Phase 6                                   |
| 後続Phase  | Phase 8                                   |

## 目的

テストカバレッジが基準を満たしていることを確認する。未達の場合は Phase 6 へ戻る。

## 実行タスク

- タスク1: 削除関連テストのカバレッジ実測値を取得する
- タスク2: 最低基準との比較結果から PASS/FAIL を判定する

### タスク1: カバレッジ基準チェック

**目的**: 修正対象ファイルのカバレッジが基準を満たしているか判定する

**手順**:

1. `cd apps/desktop && pnpm vitest run --coverage src/renderer/__tests__/App.debug-removal.test.tsx`
2. 以下の基準と比較:

| 指標              | 最低基準 | 推奨基準 | 実測値       | 判定 |
| ----------------- | -------- | -------- | ------------ | ---- |
| Line Coverage     | 80%      | 90%      | (実行時記入) |      |
| Branch Coverage   | 60%      | 70%      | (実行時記入) |      |
| Function Coverage | 80%      | 90%      | (実行時記入) |      |

### タスク2: 判定

**目的**: カバレッジ基準の充足を判定する

**判定基準**:

| 判定 | 条件                         | 対応           |
| ---- | ---------------------------- | -------------- |
| PASS | 全指標が最低基準以上         | Phase 8 へ     |
| FAIL | いずれかの指標が最低基準未満 | Phase 6 へ戻る |

**注意**: 本タスクはデバッグコード削除のため、App.tsx 全体ではなく削除関連テストのカバレッジを評価する。

## 参照資料

| 参照資料       | パス                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| Phase 5 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-5-implementation.md` |
| Phase 6 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-6-test-expansion.md` |
| カバレッジ基準 | `.claude/rules/02-code-quality.md`                                                                      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                              | 内容                                            |
| -------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------- |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ基準（最低/推奨）・PASS/FAIL 判定基準 |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | happy-dom / localStorage polyfill 前提の再確認  |

## 統合テスト連携

- PASS の場合、Phase 8 でリファクタリングへ進む
- FAIL の場合、Phase 6 でテスト追加後に再度 Phase 7 を実施

## 成果物

| 成果物             | パス                                       |
| ------------------ | ------------------------------------------ |
| カバレッジ確認結果 | `outputs/phase-7/coverage-check-result.md` |

## 完了条件

- [ ] カバレッジ計測が完了していること
- [ ] 全指標が最低基準以上であること
- [ ] 判定結果が記録されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 8: リファクタリングへ進む（カバレッジ基準充足の場合）。
Phase 6: テスト拡充へ戻る（カバレッジ基準未達の場合）。
