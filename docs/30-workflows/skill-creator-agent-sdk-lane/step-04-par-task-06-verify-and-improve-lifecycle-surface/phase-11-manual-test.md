# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 11                                   |
| 機能名 | verify-and-improve-lifecycle-surface |
| 作成日 | 2026-03-26                           |

## 目的

実画面で verify detail、improve 提案、apply result、re-verify 起点、terminal handoff guidance が読めるかを人手で確認する。

## 実行タスク

- verify detail panel を確認する
- improve suggestion selection を確認する
- apply result と re-verify 起点を確認する
- terminal handoff guidance を確認する

## 参照資料

| 資料名                 | パス                             | 説明             |
| ---------------------- | -------------------------------- | ---------------- |
| Phase 2 design         | `phase-2-design.md`              | panel topology   |
| Phase 5 implementation | `phase-5-implementation.md`      | 実装対象         |
| Phase 6 test expansion | `phase-6-test-expansion.md`      | edge case        |
| Phase 7 coverage       | `phase-7-coverage-check.md`      | coverage 観点    |
| Phase 8 refactoring    | `phase-8-refactoring.md`         | 役割分離後の確認 |
| Phase 9 QA             | `phase-9-quality-assurance.md`   | QA 観点          |
| Phase 4 test matrix    | `outputs/phase-4/test-matrix.md` | 手動観点の原本   |
| Phase 10 final review  | `phase-10-final-review.md`       | 最終判定観点     |

## 実行手順

### ステップ1: integrated_api を確認する

- verify detail panel
- provenance summary
- improve selection
- apply result
- re-verify 起点

### ステップ2: terminal_handoff を確認する

- guidance copy
- manual boundary
- panel 併記

## 統合テスト連携

- Phase 4 / 6 / 7 の観点を手動ケースへ対応付ける
- Phase 12 の implementation guide と screenshot plan に同じ ID を引き継ぐ

## 成果物

| 成果物                | パス                                        | 説明           |
| --------------------- | ------------------------------------------- | -------------- |
| 手動テスト仕様        | `phase-11-manual-test.md`                   | 手動テスト観点 |
| manual-test-checklist | `outputs/phase-11/manual-test-checklist.md` | 実施項目       |
| manual-test-result    | `outputs/phase-11/manual-test-result.md`    | 実施結果       |
| screenshot-plan       | `outputs/phase-11/screenshot-plan.json`     | 画面証跡計画   |

## 完了条件

- [ ] verify -> improve -> apply -> re-verify の流れを画面で追える
- [ ] integrated_api と terminal_handoff の両方を確認できる
- [ ] **本Phase内の全タスクを100%実行完了**
