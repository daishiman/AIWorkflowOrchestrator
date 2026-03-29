# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 7                     |
| 機能名     | api-key-management-ui |
| 作成日     | 2026-03-29            |
| ステータス | pending               |

## 目的

AC とテストケースの対応、coverage 基準、統合再実行結果を可視化する。

## 実行タスク

- AC とテストの対応表を作る
- coverage を測定する
- gap があれば補完計画を作る

## 参照資料

| 資料名         | パス                                                                         | 説明           |
| -------------- | ---------------------------------------------------------------------------- | -------------- |
| Phase 4        | `phase-4-test-creation.md`                                                   | test design    |
| Phase 6        | `phase-6-test-expansion.md`                                                  | expanded tests |
| coverage guide | `.agents/skills/task-specification-creator/references/coverage-standards.md` | 基準           |

## 実行手順

### ステップ1: coverage 基準を固定する

1. Line 80%+
2. Branch 60%+
3. Function 80%+

### ステップ2: 対応表を作る

1. AC-1〜AC-6
2. UI test
3. contract test
4. screenshot evidence

### ステップ3: gap 処理

1. current gap は補完 plan を作る。
2. baseline gap は別扱いで記録する。

## 統合テスト連携

- 主要 test suite を再実行する。
- Phase 10 の review matrix に coverage 結果を引き継ぐ。

## 成果物

| 成果物            | パス                                         | 説明       |
| ----------------- | -------------------------------------------- | ---------- |
| coverage サマリー | `outputs/phase-7/coverage-summary.md`        | 測定結果   |
| coverage gap plan | `outputs/phase-7/coverage-gap-plan.md`       | 補完計画   |
| 統合テスト結果    | `outputs/phase-7/integration-test-result.md` | 再実行結果 |

## 完了条件

- [ ] AC とテストの対応表がある
- [ ] coverage 基準に対する結果が記録されている
- [ ] gap が current / baseline で整理されている
- [ ] **本Phase内の全タスクを100%実行完了**
