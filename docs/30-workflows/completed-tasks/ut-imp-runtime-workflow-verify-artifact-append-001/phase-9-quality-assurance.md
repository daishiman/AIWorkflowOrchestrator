# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Phase      | 9                                                  |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 |
| 機能名     | ut-imp-runtime-workflow-verify-artifact-append-001 |
| 前提Phase  | Phase 5                                            |
| 後続Phase  | Phase 10                                           |
| ステータス | 完了                                               |
| 作成日     | 2026-03-26                                         |

## 目的

task-spec validator と targeted test の両方で今回修正の品質を確認する。

## 実行タスク

- `validate-phase-output` を実行する
- `verify-all-specs` を実行する
- targeted vitest を実行する
- warning と baseline ノイズを切り分けて記録する

## 参照資料

| 参照資料 | パス                        | 内容          |
| -------- | --------------------------- | ------------- |
| Phase 6  | `phase-6-test-expansion.md` | targeted test |
| Phase 8  | `phase-8-refactoring.md`    | 最終構成      |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                        | 内容     |
| -------------------- | --------------------------------------------------------------------------- | -------- |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準 |

## 統合テスト連携

| 観点      | 連携内容                                           |
| --------- | -------------------------------------------------- |
| validator | spec validator と targeted vitest を同時に確認する |

## 成果物

| 成果物              | パス                                       | 説明                          |
| ------------------- | ------------------------------------------ | ----------------------------- |
| QA 記録             | `outputs/phase-9/quality-assurance-log.md` | validator と test の結果      |
| verification report | `outputs/verification-report.md`           | `verify-all-specs` の集計結果 |

## 完了条件

- [ ] `validate-phase-output` が通る
- [ ] `verify-all-specs` が通る
- [ ] targeted vitest が通る
- [ ] warning と current issue が分離記録されている
