# Phase 13: PR作成

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 13                                    |
| 機能名 | TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 |
| 作成日 | 2026-04-19                            |

## 目的

ユーザー承認がある場合のみ PR 作成へ進み、未承認時は `blocked` を維持する。

## 実行タスク

1. user approval の有無を確認する
2. `blocked` / `skipped` / `completed` の分岐を明記する
3. approval がない限り commit / PR / push を実行しない

## 参照資料

| 資料             | パス                                                                       | 用途          |
| ---------------- | -------------------------------------------------------------------------- | ------------- |
| execute workflow | `.claude/skills/task-specification-creator/references/execute-workflow.md` | PR 禁止ルール |
| Phase 12         | `phase-12-documentation.md`                                                | 前提          |

## 実行手順

### 分岐

| 状態      | 条件                                   | 対応                                                                |
| --------- | -------------------------------------- | ------------------------------------------------------------------- |
| blocked   | user approval なし                     | `artifacts.json` / `outputs/artifacts.json` を `blocked` のまま維持 |
| skipped   | docs-only close または運用上 PR 非対象 | 根拠を記録して skip                                                 |
| completed | user approval あり、ローカル確認完了   | commit / PR / CI 確認へ進む                                         |

## 統合テスト連携

- Phase 13 自体はテストを持たず、Phase 10〜12 の evidence を参照する

## 成果物

- `outputs/phase-13/phase13-blocked-or-approved.md`

## 完了条件

- [ ] user approval がない場合の blocked 運用を明記した
- [ ] skipped / completed の分岐を定義した
- [ ] commit / PR を自動実行しないルールを明記した
