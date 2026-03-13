# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 |
| Phase      | 3                                                    |
| Phase名    | 設計レビューゲート                                   |
| ステータス | completed                                            |
| 前提Phase  | Phase 1, Phase 2                                     |
| 後続Phase  | Phase 4                                              |

## 目的

Phase 1-2 で整理した責務分離、system spec 抽出、実装着手条件が矛盾なく説明できるかをレビューする。

## 実行タスク

- タスク1: 要件と設計の整合を確認する
- タスク2: SubAgent 並列化条件と Gate 条件の妥当性を確認する
- タスク3: PASS / MINOR / MAJOR 判定を記録する

### レビュー観点

| 観点                    | 判定基準                                                                     |
| ----------------------- | ---------------------------------------------------------------------------- |
| 要件整合                | 4 concern と acceptance criteria が 1対1で説明できる                         |
| system spec coverage    | search / preview / taxonomy / docs sync に必要な正本仕様が抽出されている     |
| 並列化設計              | Phase 1 を直列、Phase 2 で Lane A/B を並列化する根拠がある                   |
| security / IPC boundary | 新規 IPC なし、renderer local timeout 制御の条件が守られている               |
| execution policy        | 設計先行、commit / PR 禁止の方針が root / phase / artifacts に反映されている |

### 判定

| 判定  | 条件                                             | 次アクション                    |
| ----- | ------------------------------------------------ | ------------------------------- |
| PASS  | 全観点が矛盾なく説明できる                       | そのまま Phase 4 以降へ着手可能 |
| MINOR | 文言補正で吸収可能                               | 修正後に Phase 4 へ進む         |
| MAJOR | concern 分離や system spec coverage に欠陥がある | Phase 2 に戻す                  |

## 参照資料

| 参照資料        | パス                                                                                           | 説明             |
| --------------- | ---------------------------------------------------------------------------------------------- | ---------------- |
| Phase 1 成果物  | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-1/` | 要件と AC        |
| Phase 2 成果物  | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-2/` | 設計と lane plan |
| parent workflow | `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/`            | 04C の根拠       |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                        | 内容                             |
| -------------------- | --------------------------------------------------------------------------- | -------------------------------- |
| task-workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | related UT と Phase 12 sync 根拠 |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | 共通ガード化の目的               |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | Gate 判定基準                    |

## 実行手順

### ステップ1: coverage review

- Phase 1 の FR/NFR/AC と Phase 2 の design items を対応づける。
- 抽出した正本仕様が 4 concern を漏れなく支えているか確認する。

### ステップ2: execution gate review

- Phase 1-3 completed 後にのみ実装へ進む条件を確認する。
- commit / PR 禁止、Codex handoff 条件、SubAgent 並列化条件の矛盾がないか確認する。

### ステップ3: Gate 判定の固定

- `outputs/phase-3/design-review-result.md` に PASS / residual risk / reopen 条件を記録する。

## 統合テスト連携

| 観点             | 連携内容                                                                        |
| ---------------- | ------------------------------------------------------------------------------- |
| test readiness   | Phase 4 で定義する testcase が 4 concern を覆うことを確認する                   |
| docs readiness   | Phase 12 sync を test plan に含める前提を確認する                               |
| manual readiness | representative screenshot / review board が必要になる条件を Phase 11 に引き継ぐ |

## 多角的チェック観点

- 共通観点は `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/phase-common-governance.md` を正本とし、要件・設計・依存・branch/worktree diff・P50 前提の矛盾がないかを確認する。

## サブタスク管理

- レビューは SubAgent-A/B/C/D の成果物を concern 単位で受け取り、Lane 間の責務混線があれば Phase 2 へ戻す。

## タスク100%実行確認

- Gate 判定、reopen 条件、execution policy が `outputs/phase-3/design-review-result.md` と本文で一致していることを確認する。

## 成果物

| 成果物               | パス                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| design-review-result | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-3/design-review-result.md` |

## 完了条件

- [x] 要件と設計の対応関係がレビュー済みである
- [x] system spec 抽出の漏れがない
- [x] 実装着手条件が記録されている
- [x] PASS 判定と reopen 条件が残っている

## 次Phase

Phase 4: テスト作成
