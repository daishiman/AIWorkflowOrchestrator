# Phase 13: PR作成

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 13                                   |
| 機能名 | task-sdk-06-layer34-verify-expansion |
| 作成日 | 2026-03-27                           |

## 目的

ユーザー承認がある場合に限り PR 準備へ進める blocked Phase を定義する。

## 実行タスク

- local check 結果を残す
- change summary を残す
- PR 実行条件を明記する

## 参照資料

| 資料名          | パス                                                     | 説明               |
| --------------- | -------------------------------------------------------- | ------------------ |
| contract matrix | `outputs/phase-2/layer34-contract-matrix.md`             | field set 正本     |
| implementation  | `outputs/phase-5/implementation-sequencing.md`           | 実装順             |
| test expansion  | `outputs/phase-6/test-expansion-summary.md`              | edge case          |
| coverage        | `outputs/phase-7/coverage-summary.md`                    | coverage           |
| refactoring     | `outputs/phase-8/refactoring-summary.md`                 | naming / duplicate |
| qa summary      | `outputs/phase-9/qa-summary.md`                          | quality gate       |
| final review    | `outputs/phase-10/final-review-summary.md`               | gate 判定          |
| manual result   | `outputs/phase-11/manual-test-result.md`                 | walkthrough 結果   |
| Phase 12 docs   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | close-out 完了     |

## 実行手順

### ステップ1: local check と change summary を残す

- PR は作成せず、必要なローカル検証結果と差分要約だけを残す。

### ステップ2: blocked 条件を維持する

- ユーザー承認なしでは commit / PR / push を実行しない。

## 成果物

| 成果物             | パス                                     | 説明             |
| ------------------ | ---------------------------------------- | ---------------- |
| local check result | `outputs/phase-13/local-check-result.md` | ローカル検証結果 |
| change summary     | `outputs/phase-13/change-summary.md`     | 差分要約         |

## 完了条件

- [ ] local check 結果がある
- [ ] change summary がある
- [ ] PR 実行条件が blocked のまま維持される

## blocked 条件

- ユーザーが明示的に commit / PR / push を指示していない
- spec_created の段階であり、workflow 実行完了ではない
