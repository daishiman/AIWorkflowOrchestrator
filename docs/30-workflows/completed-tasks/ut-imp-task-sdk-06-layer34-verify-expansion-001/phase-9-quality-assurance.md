# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 9                                    |
| 機能名 | task-sdk-06-layer34-verify-expansion |
| 作成日 | 2026-03-27                           |

## 目的

contract drift、sibling boundary drift、artifact drift、spec quality drift を一括で監査する。

## 実行タスク

- contract drift を監査する
- delegated boundary drift を監査する
- workflow artifact の整合を監査する
- validation command の再実行条件を確認する

## 参照資料

| 資料名         | パス                                           | 説明               |
| -------------- | ---------------------------------------------- | ------------------ |
| implementation | `outputs/phase-5/implementation-sequencing.md` | 実装単位           |
| coverage       | `outputs/phase-7/coverage-summary.md`          | coverage 根拠      |
| refactoring    | `outputs/phase-8/refactoring-summary.md`       | naming / duplicate |
| design review  | `outputs/phase-3/design-review-gate.md`        | gate 基準          |

## 実行手順

### ステップ1: technical drift を監査する

- shared DTO / IPC / preload / facade / renderer の field set 差異がないことを確認する。

### ステップ2: docs drift を監査する

- `artifacts.json`、`outputs/artifacts.json`、Phase 本文、Phase 12 成果物名の一致を確認する。

## 統合テスト連携

- Phase 10 の final review に pass/fail を引き渡す。

## 成果物

| 成果物     | パス                            | 説明           |
| ---------- | ------------------------------- | -------------- |
| qa summary | `outputs/phase-9/qa-summary.md` | 品質 gate 判定 |

## 完了条件

- [ ] contract drift 監査観点がある
- [ ] sibling boundary drift 監査観点がある
- [ ] artifact drift 監査観点がある
- [ ] **本Phase内の全タスクを100%実行完了**
