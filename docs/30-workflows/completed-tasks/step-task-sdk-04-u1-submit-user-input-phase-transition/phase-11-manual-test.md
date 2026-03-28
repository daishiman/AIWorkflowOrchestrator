# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                                                  |
| ------ | --------------------------------------------------- |
| Phase  | 11                                                  |
| 機能名 | `task-sdk-04-u1-submit-user-input-phase-transition` |
| 作成日 | 2026-03-28                                          |

## 目的

内部ロジック中心 task として `NON_VISUAL` 判定を確認し、Phase 12 へ渡す補助証跡をそろえる。

## 実行タスク

- `NON_VISUAL` 判定の根拠を確認する
- checklist と result を記録する
- Phase 12 へ渡す補助証跡を確認する

## 参照資料

| 資料名                 | パス                                        | 説明              |
| ---------------------- | ------------------------------------------- | ----------------- |
| phase 2 design         | `outputs/phase-2/design.md`                 | 設計境界          |
| phase 5 implementation | `outputs/phase-5/implementation.md`         | 実装対象          |
| phase 6 test expansion | `outputs/phase-6/test-expansion.md`         | regression 観点   |
| phase 7 coverage       | `outputs/phase-7/coverage-check.md`         | coverage 観点     |
| phase 8 refactoring    | `outputs/phase-8/refactoring.md`            | 最終構造          |
| phase 9 QA             | `outputs/phase-9/quality-assurance.md`      | 実測結果          |
| phase 10 final review  | `outputs/phase-10/final-review.md`          | gate 判定         |
| checklist              | `outputs/phase-11/manual-test-checklist.md` | 実施観点          |
| result                 | `outputs/phase-11/manual-test-result.md`    | 判定結果          |
| screenshot plan        | `outputs/phase-11/screenshot-plan.json`     | `NON_VISUAL` 記録 |

## 実行手順

### ステップ1: `NON_VISUAL` 判定を確定する

renderer surface の追加差分がないことを根拠として記録する。

### ステップ2: 補助成果物を揃える

checklist、result、screenshot-plan を作成し、再分類不要理由を残す。

## 統合テスト連携

- Phase 9 / 10 の自動テスト結果を手動確認の証跡として参照する

## 成果物

| 成果物               | パス                                        | 説明               |
| -------------------- | ------------------------------------------- | ------------------ |
| 手動テスト checklist | `outputs/phase-11/manual-test-checklist.md` | 実施観点           |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`    | 結果               |
| 手動テスト報告       | `outputs/phase-11/manual-test-report.md`    | 総括               |
| 発見事項             | `outputs/phase-11/discovered-issues.md`     | Note / Info を整理 |
| screenshot plan      | `outputs/phase-11/screenshot-plan.json`     | `NON_VISUAL` 記録  |

## 完了条件

- [ ] `NON_VISUAL` 判定根拠が明記されている
- [ ] checklist と result が存在する
- [ ] screenshot-plan.json が存在する
- [ ] 本Phase内の全タスクを100%実行完了
