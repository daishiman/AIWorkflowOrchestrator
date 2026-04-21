# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 12                                     |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 11                               |
| 後続Phase  | Phase 13                               |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

task-specification-creator と aiworkflow-requirements の両 skill に整合する close-out 記録を canonical 名で定義し、Step 1 / Step 2 の判断根拠を残す。

## 実行タスク

1. canonical 6 成果物を定義する
2. Step 1-A〜1-G の同期対象を列挙し、task local / system spec no-op の境界を明文化する
3. Step 2 が必要かどうかを判定し、不要なら no-op 根拠を残す

## 実行手順

Step 1 候補:

- task local `artifacts.json`
- task local `outputs/artifacts.json`
- `outputs/phase-11/TASK-RALLY-002-manual-test-report.md`
- `task-workflow.md`
- `LOGS.md`（両 skill）
- `SKILL.md` history（両 skill）
- `topic-map.md`（必要時）
- root `artifacts.json`（今回は no-op 判定可）
- root `outputs/artifacts.json`（今回は no-op 判定可）

Step 2 判定:

- state semantics や session restore contract を aiworkflow 正本へ同期する必要があるか
- 不要であっても `system-spec-update-summary.md` と `documentation-changelog.md` に no-op 理由を残す

固定文言:

- `UI/UX変更なしのため Phase 11 スクリーンショット不要`
- 実装ガイドは Part 1 / Part 2 を分け、task 固有 path の Phase 11 証跡を参照する
- `completed ledger / backlog / mirror parity` は更新不要なら no-op と理由を残す

## 多角的チェック観点（AIが判断）

- ダブル・ループ思考: そもそも同期が必要な変更かを問い直す
- 価値提案思考: 更新対象を最小限に保ちつつ将来参照可能にできるか

## サブタスク管理

| Task | 内容                                    |
| ---- | --------------------------------------- |
| 1    | `implementation-guide.md`               |
| 2    | `system-spec-update-summary.md`         |
| 3    | `documentation-changelog.md`            |
| 4    | `unassigned-task-detection.md`          |
| 5    | `skill-feedback-report.md`              |
| 6    | `phase12-task-spec-compliance-check.md` |

## 参照資料

| 資料名                  | パス                                                                           | 用途           |
| ----------------------- | ------------------------------------------------------------------------------ | -------------- |
| spec update workflow    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1/2 判断  |
| aiworkflow resource map | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`               | 正本探索       |
| Phase 11 成果物         | `outputs/phase-11/*.md`                                                        | close-out 入力 |

## 成果物

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 完了条件

- [ ] canonical 6 成果物を定義した
- [ ] Step 1 / Step 2 の判断を明文化した
- [ ] outputs / root artifacts parity を維持できる形にした

## タスク100%実行確認【必須】

- [ ] 実行タスク 1〜3 完了
- [ ] 成果物を全件定義
- [ ] Step 2 no-op の場合も理由を残す

## 次のPhase

Phase 13: PR作成
