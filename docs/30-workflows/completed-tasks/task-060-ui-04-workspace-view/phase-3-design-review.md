# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-UI-04-WORKSPACE-VIEW |
| Phase      | 3                         |
| Phase名    | 設計レビュー              |
| ステータス | completed                 |
| 前提Phase  | Phase 1, Phase 2          |
| 後続Phase  | Phase 4                   |

## 目的

親参照仕様の設計が child workflow と衝突せず、user policy と system spec を満たしているかをレビューする。

## 実行タスク

- タスク1: parent-child boundary をレビューする
- タスク2: canonical path と並列契約をレビューする
- タスク3: spec-only validator 戦略をレビューする
- タスク4: ゲート判定を確定する

### レビュー観点

| 観点           | 判定基準                                                            |
| -------------- | ------------------------------------------------------------------- |
| 単一責務       | parent が implementation detail を持っていない                      |
| canonical path | 04A / 04B / 04C が completed path へ揃っている                      |
| 並列契約       | 04A 完了前に 04B / 04C を開始しない                                 |
| system spec    | resource-map から task-workflow までの参照が揃っている              |
| user policy    | Phase 1-3 先行、commit / PR block、Atent Team lane 分離が揃っている |

### 判定

| 判定     | 条件                                                 | 次アクション            |
| -------- | ---------------------------------------------------- | ----------------------- |
| PASS     | 全観点が満たされている                               | Phase 4 へ進む          |
| MINOR    | 文言補正だけで解消できる                             | 補正後に Phase 4 へ進む |
| MAJOR    | parent-child boundary か canonical path に欠落がある | Phase 2 へ戻る          |
| CRITICAL | user policy か system spec 抽出が欠落している        | Phase 1 へ戻る          |

## 参照資料

| 参照資料                           | パス                                                                                                              | 説明           |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------- |
| Phase 1 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-1/`                                | requirements   |
| Phase 2 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-2/`                                | design         |
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

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                            | 内容           |
| ------------------ | ------------------------------------------------------------------------------- | -------------- |
| task workflow      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | child 完了台帳 |
| feature components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | feature record |
| lessons learned    | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | drift 防止知見 |

## 実行手順

### ステップ1: Phase 1/2 の設計成果物をレビューする

requirements と design の両成果物を読み、scope / path / sync policy の矛盾を探す。

### ステップ2: review gate 判定を適用する

PASS / MINOR / MAJOR / CRITICAL のどれかに必ず分類し、戻り先を確定する。

### ステップ3: Phase 4 以降の開始条件を固定する

Phase 1-3 完了前に後続へ進まない条件と、Phase 11 / 12 固有方針の有無を確認する。

## 統合テスト連携

| 観点                  | 連携内容                                                              |
| --------------------- | --------------------------------------------------------------------- |
| gate to contract test | PASS か MINOR の設計だけを Phase 4 の contract test へ渡す            |
| gate to documentation | Phase 12 sync 対象が欠けていた場合は Phase 2 へ戻す                   |
| gate to evidence      | Phase 11 の N/A と evidence 継承方針が欠けていた場合は Phase 2 へ戻す |

## 多角的チェック観点

| 観点             | 適用判断 | 確認内容                                                            |
| ---------------- | -------- | ------------------------------------------------------------------- |
| 単一責務         | 適用     | 親が child 実装や child 状態を抱え込んでいないこと                  |
| canonical path   | 適用     | current / completed の揺れが親設計に残っていないこと                |
| aiworkflow 抽出  | 適用     | resource-map 起点で必要仕様が不足なく拾われていること               |
| ユーザーポリシー | 適用     | 実装不要、commit/PR block、Atent Team lane 分離が維持されていること |

## 成果物

| 成果物               | パス                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| design-review-result | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-3/design-review-result.md` |
| review-findings      | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-3/review-findings.md`      |

## 完了条件

- [ ] parent-child boundary がレビュー済みである
- [ ] canonical path と並列契約がレビュー済みである
- [ ] spec-only validator 戦略がレビュー済みである
- [ ] PASS か MINOR が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- Phase 1 成果物レビュー
- Phase 2 成果物レビュー
- gate 判定と戻り先の確定
- Phase 4 開始条件の確認

## タスク100%実行確認【必須】

- [ ] review 観点がすべて判定表に反映されている
- [ ] PASS / MINOR / MAJOR / CRITICAL のいずれかが選べる
- [ ] Phase 4 に渡す条件と差し戻し条件が明記されている
- [ ] 設計書がないと後続へ進めないことを明文化した

## 次Phase

Phase 4: テスト作成
