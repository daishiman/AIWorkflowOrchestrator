# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-04-WORKSPACE-VIEW                                                                   |
| Phase      | 13                                                                                          |
| Phase名    | PR作成                                                                                      |
| ステータス | blocked_by_policy                                                                           |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11, Phase 12 |
| 後続Phase  | 完了                                                                                        |

## 目的

ユーザー承認後にだけ commit / PR の準備を行えるよう、handoff 情報を整理する。

## 実行タスク

- タスク1: PR 下書き情報を整理する
- タスク2: commit plan を整理する
- タスク3: blocked 条件を明記する

### タスク1: PR 下書き情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タイトル | `TASK-UI-04-WORKSPACE-VIEW parent reference workflow` |
| 変更要約 | parent spec、13 Phase、root ledger、artifacts         |
| 検証     | `validate-phase-output.js`, `verify-all-specs.js`     |

### タスク2: commit plan

- commit はユーザー承認後に行う。
- PR はユーザー承認後に作成する。
- branch は `task-20260312-workspace-view-specs` を使う。

### タスク3: blocked 条件

| 条件            | 内容                                   |
| --------------- | -------------------------------------- |
| commit block    | ユーザー承認前は commit しない         |
| PR block        | ユーザー承認前は PR を作成しない       |
| execution block | 仕様書作成だけで終了し、実装へ移らない |

## 参照資料

| 参照資料                           | パス                                                                                | 説明                     |
| ---------------------------------- | ----------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-1/`  | requirements             |
| Phase 2 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-2/`  | design                   |
| Phase 5 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-5/`  | 実装内容                 |
| Phase 6 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-6/`  | expanded tests           |
| Phase 7 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-7/`  | coverage                 |
| Phase 8 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-8/`  | refactor result          |
| Phase 9 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-9/`  | QA result                |
| Phase 10 成果物                    | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-10/` | final gate result        |
| Phase 11 成果物                    | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-11/` | manual test result       |
| Phase 12 成果物                    | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-12/` | handoff 入力             |
| parent index                       | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/index.md`          | 変更概要                 |
| user policy                        | 会話ログ                                                                            | commit / PR block の正本 |
| final-review-result                | `outputs/phase-10/final-review-result.md`                                           | Phase 10 成果物          |
| remediation-directives             | `outputs/phase-10/remediation-directives.md`                                        | Phase 10 成果物          |
| manual-test-checklist              | `outputs/phase-11/manual-test-checklist.md`                                         | Phase 11 成果物          |
| manual-test-result                 | `outputs/phase-11/manual-test-result.md`                                            | Phase 11 成果物          |
| evidence-inheritance-log           | `outputs/phase-11/evidence-inheritance-log.md`                                      | Phase 11 成果物          |
| implementation-guide               | `outputs/phase-12/implementation-guide.md`                                          | Phase 12 成果物          |
| spec-update-summary                | `outputs/phase-12/spec-update-summary.md`                                           | Phase 12 成果物          |
| documentation-changelog            | `outputs/phase-12/documentation-changelog.md`                                       | Phase 12 成果物          |
| unassigned-task-detection          | `outputs/phase-12/unassigned-task-detection.md`                                     | Phase 12 成果物          |
| skill-feedback-report              | `outputs/phase-12/skill-feedback-report.md`                                         | Phase 12 成果物          |
| phase12-task-spec-compliance-check | `outputs/phase-12/phase12-task-spec-compliance-check.md`                            | Phase 12 成果物          |

## 実行手順

### ステップ1: handoff 入力を整理する

Phase 12 までの成果物、検証結果、PR 下書き項目をまとめる。

### ステップ2: blocked 条件を再確認する

ユーザーの明示承認がない限り commit / PR を行わない条件を維持する。

### ステップ3: 承認後の最小実行単位だけを定義する

branch、commit message、PR draft の骨子だけを残し、今は実行しない。

## 多角的チェック観点

| 観点                 | 適用判断 | 確認内容                                         |
| -------------------- | -------- | ------------------------------------------------ |
| user approval        | 適用     | commit / PR のどちらも明示承認が必要であること   |
| handoff completeness | 適用     | Phase 1-12 の成果物と検証結果が参照できること    |
| scope discipline     | 適用     | 仕様書作成だけで終了し、実装へ移らないこと       |
| branch hygiene       | 適用     | 現在 branch 名と PR 下書き情報が一致していること |

## 成果物

| 成果物            | パス                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| pr-draft          | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-13/pr-draft.md`          |
| handoff-checklist | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-13/handoff-checklist.md` |

## 完了条件

- [ ] ユーザーが commit を明示承認している
- [ ] ユーザーが PR 作成を明示承認している
- [ ] PR 下書き情報が整理されている
- [ ] blocked 条件が解除されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- handoff 入力整理
- blocked 条件確認
- commit / PR draft 骨子整理
- 承認待ち状態の明記

## タスク100%実行確認【必須】

- [ ] commit / PR block が明示されている
- [ ] 現在 branch と PR 下書き情報が一致している
- [ ] 実装へ進まないことが明記されている
- [ ] ユーザー承認なしでは実行しない条件が残っている

## 次Phase

完了
