# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-P0-04 |
| Phase      | 11         |
| Phase名    | 手動テスト |
| ステータス | completed  |
| 前提Phase  | Phase 10   |
| 後続Phase  | Phase 12   |

## 目的

NON_VISUAL walkthrough で scope drift が解消されていることを確認する。

## 実行タスク

- helper の3分岐を見直す
- facade 未変更を見直す
- discovered issues を記録する

## 参照資料

| 資料                                        | 用途          |
| ------------------------------------------- | ------------- |
| `phase-2-design.md`                         | 設計確認      |
| `phase-5-implementation.md`                 | 実装確認      |
| `phase-6-test-expansion.md`                 | edge case確認 |
| `phase-7-coverage-check.md`                 | coverage確認  |
| `phase-8-refactoring.md`                    | refactor確認  |
| `phase-9-quality-assurance.md`              | quality確認   |
| `outputs/phase-11/manual-test-result.md`    | walkthrough   |
| `outputs/phase-11/discovered-issues.md`     | 発見事項      |
| `outputs/phase-11/manual-test-checklist.md` | 確認観点      |

## 統合テスト連携

- Phase 12 で discovered issues と unassigned detection を照合する

## 成果物

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/discovered-issues.md`
- `outputs/phase-11/manual-test-checklist.md`

## 完了条件

- [x] NON_VISUAL の証跡が揃う
