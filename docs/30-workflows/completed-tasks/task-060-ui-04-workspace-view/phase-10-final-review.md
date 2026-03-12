# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| タスクID   | TASK-UI-04-WORKSPACE-VIEW                                     |
| Phase      | 10                                                            |
| Phase名    | 最終レビュー                                                  |
| ステータス | completed                                                     |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9 |
| 後続Phase  | Phase 11                                                      |

## 目的

親参照仕様が future execution と system spec sync に耐えるかを最終 gate で判定する。

## 実行タスク

- タスク1: 最終 gate 判定を行う
- タスク2: remediation directives を整理する
- タスク3: user handoff 条件を確認する

### 最終 gate 判定

| 判定     | 条件                                                                             | 戻り先   |
| -------- | -------------------------------------------------------------------------------- | -------- |
| PASS     | parent-child boundary、canonical path、validator、Phase 11 / 12 方針が揃っている | Phase 11 |
| MINOR    | 文言補正だけで解消できる                                                         | Phase 8  |
| MAJOR    | canonical path、sync 先、gate 条件に欠落がある                                   | Phase 5  |
| CRITICAL | user policy と矛盾する                                                           | Phase 1  |

### remediation directives

| 項目           | 内容                                    |
| -------------- | --------------------------------------- |
| path drift     | completed path へ戻す                   |
| evidence drift | Phase 11 の N/A / 継承ルールへ戻す      |
| sync drift     | Phase 12 の `spec_created` 同期先へ戻す |

### user handoff 条件

- 実装不要であることが全文で一貫している。
- commit / PR block が Phase 13 で明記されている。
- Atent Team lane が future execution へ引き継げる。

## 参照資料

| 参照資料                           | パス                                                                                                              | 説明           |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------- |
| Phase 1 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-1/`                                | requirements   |
| Phase 2 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-2/`                                | design         |
| Phase 5 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-5/`                                | 実装内容       |
| Phase 9 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-9/`                                | QA 結果        |
| requirements traceability          | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/requirements-traceability-matrix.md`             | AC 対応表      |
| task-spec compliance               | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/task-specification-creator-compliance-matrix.md` | skill 準拠表   |
| requirements-definition            | `outputs/phase-1/requirements-definition.md`                                                                      | Phase 1 成果物 |
| scope-boundary                     | `outputs/phase-1/scope-boundary.md`                                                                               | Phase 1 成果物 |
| acceptance-criteria                | `outputs/phase-1/acceptance-criteria.md`                                                                          | Phase 1 成果物 |
| system-spec-entrypoints            | `outputs/phase-1/system-spec-entrypoints.md`                                                                      | Phase 1 成果物 |
| parent-child-responsibility-matrix | `outputs/phase-2/parent-child-responsibility-matrix.md`                                                           | Phase 2 成果物 |
| execution-lane-design              | `outputs/phase-2/execution-lane-design.md`                                                                        | Phase 2 成果物 |
| sync-matrix                        | `outputs/phase-2/sync-matrix.md`                                                                                  | Phase 2 成果物 |
| validator-strategy                 | `outputs/phase-2/validator-strategy.md`                                                                           | Phase 2 成果物 |
| implementation-summary             | `outputs/phase-5/implementation-summary.md`                                                                       | Phase 5 成果物 |
| pointer-doc-update-plan            | `outputs/phase-5/pointer-doc-update-plan.md`                                                                      | Phase 5 成果物 |
| canonical-path-normalization       | `outputs/phase-5/canonical-path-normalization.md`                                                                 | Phase 5 成果物 |
| coverage-report                    | `outputs/phase-7/coverage-report.md`                                                                              | Phase 7 成果物 |
| coverage-gap-analysis              | `outputs/phase-7/coverage-gap-analysis.md`                                                                        | Phase 7 成果物 |
| refactoring-report                 | `outputs/phase-8/refactoring-report.md`                                                                           | Phase 8 成果物 |
| terminology-normalization          | `outputs/phase-8/terminology-normalization.md`                                                                    | Phase 8 成果物 |
| quality-verification               | `outputs/phase-9/quality-verification.md`                                                                         | Phase 9 成果物 |
| qa-risk-register                   | `outputs/phase-9/qa-risk-register.md`                                                                             | Phase 9 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                   | 内容           |
| --------------- | ---------------------------------------------------------------------- | -------------- |
| task workflow   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | child 状態参照 |
| lessons learned | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 再発防止知見   |

## 実行手順

### ステップ1: Phase 9 までの gate 入力を集約する

requirements、design、implementation、QA の結果をまとめて最終判定の入力にする。

### ステップ2: 最終 gate 判定を行う

PASS / MINOR / MAJOR / CRITICAL のどれかで判定し、戻り先と remediation を決める。

### ステップ3: user handoff 条件を確認する

実装不要、Phase 11 / 12 方針、commit/PR block の条件が崩れていないかを確認する。

## 統合テスト連携

| 観点                        | 連携内容                                       |
| --------------------------- | ---------------------------------------------- |
| final gate to manual test   | PASS した parent policy だけを Phase 11 へ渡す |
| final gate to documentation | PASS した sync 先だけを Phase 12 へ渡す        |
| final gate to PR            | commit / PR block を Phase 13 へ渡す           |

## 多角的チェック観点

| 観点            | 適用判断 | 確認内容                                                 |
| --------------- | -------- | -------------------------------------------------------- |
| gate integrity  | 適用     | Phase 1-9 の成果物を前提に最終判定していること           |
| canonical path  | 適用     | child path、sync path、evidence path に drift がないこと |
| user policy     | 適用     | 実装不要、承認前 commit/PR 禁止が維持されていること      |
| handoff quality | 適用     | Phase 11 / 12 / 13 に渡す前提が整理されていること        |

## 成果物

| 成果物                 | パス                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| final-review-result    | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-10/final-review-result.md`    |
| remediation-directives | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-10/remediation-directives.md` |

## 完了条件

- [ ] 最終 gate 判定が記録されている
- [ ] remediation directives が記録されている
- [ ] user handoff 条件が確認されている
- [ ] Phase 11 と Phase 12 に渡す前提が整理されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- gate 入力の集約
- 最終判定の確定
- remediation 整理
- handoff 条件の確認

## タスク100%実行確認【必須】

- [ ] 前提Phase が Phase 9 まで揃っている
- [ ] PASS / MINOR / MAJOR / CRITICAL の戻り先が定義されている
- [ ] Phase 11 / 12 / 13 に渡す前提が整理されている
- [ ] user policy と矛盾する記述が残っていない

## 次Phase

Phase 11: 手動テスト
