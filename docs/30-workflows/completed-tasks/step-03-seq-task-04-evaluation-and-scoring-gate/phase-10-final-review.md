# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| Phase      | 10                                                                         |
| Phase名    | 最終レビューゲート                                                         |
| タスクID   | TASK-SKILL-LIFECYCLE-04                                                    |
| 前提Phase  | Phase 1（要件定義）, Phase 2（設計）, Phase 5（実装）, Phase 9（品質保証） |
| 後続Phase  | Phase 11（手動テスト検証）                                                 |
| ステータス | completed                                                                  |
| 作成日     | 2026-03-12                                                                 |
| 機能名     | skill-lifecycle-evaluation-gate                                            |

## 目的

Task04 が Task03 と Task05 の間で実質的な gate として機能し、UI、state、security、documentation の各面で手戻りがないかを最終判定する。

## 実行タスク

- 要件最終確認: Phase 1 / 2 の受入基準が実装と QA で充足しているか確認する
- 依存最終確認: Task03 / Task05 handoff が実装と QA で崩れていないか確認する
- リスク最終確認: security / permission / stale history / surface 差異の残存有無を確認する
- manual test 入口確認: Phase 11 の test case と screenshot plan が妥当か確認する
- documentation 入口確認: Phase 12 の更新先と成果物が明確か確認する

## 参照資料

| 参照資料            | パス                                                                                                                      | 説明             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Phase 1 要件        | `phase-1-requirements.md`                                                                                                 | 受入基準         |
| Phase 2 設計        | `phase-2-design.md`                                                                                                       | 判定設計         |
| Phase 5 実装        | `phase-5-implementation.md`                                                                                               | 実装完了範囲     |
| Phase 9 品質保証    | `phase-9-quality-assurance.md`                                                                                            | QA 結果          |
| quality gate report | `outputs/phase-9/quality-gate-report.md`                                                                                  | PASS / FAIL 根拠 |
| implementation plan | `outputs/phase-5/implementation-plan.md`                                                                                  | 実装責務の確認   |
| Task03 設計         | `../../skill-lifecycle-unification/tasks/step-02-par-task-03-skill-creator-execute-improve-integration/phase-2-design.md` | 前段依存         |
| Task05 設計         | `../../skill-lifecycle-unification/tasks/step-04-seq-task-05-created-skill-usage-journey/phase-2-design.md`               | 後段依存         |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                         | 内容                     |
| --------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| task-workflow         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         | Phase 10 / 12 の運用規約 |
| ui-ux-navigation      | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      | surface 責務最終確認     |
| arch-state-management | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | state ownership 最終確認 |

## 実行手順

### ステップ1: 受入基準の充足を確認する

AC-1〜AC-6 と QA 結果を照合し、未充足を列挙する。

### ステップ2: cross-task 依存を確認する

Task03 / Task05 handoff の抜けを確認する。

### ステップ3: 手動テストと documentation の入口を確認する

Phase 11 / 12 の成果物計画が実行可能かを確認する。

### ステップ4: 最終判定を記録する

PASS / MINOR / MAJOR / CRITICAL を記録し、戻り先を明記する。

## 統合テスト連携

| 観点               | 最終確認内容                   |
| ------------------ | ------------------------------ |
| unit / integration | QA での未解消項目の有無        |
| manual             | TC と screenshot plan の妥当性 |
| docs               | Phase 12 更新先の明確さ        |
| security           | hard block 残課題の有無        |

## 成果物

| 成果物                  | パス                                          | 内容                 |
| ----------------------- | --------------------------------------------- | -------------------- |
| final review report     | `outputs/phase-10/final-review-report.md`     | 判定、戻り先、残課題 |
| release risk assessment | `outputs/phase-10/release-risk-assessment.md` | 許容リスク一覧       |

## 完了条件

- [x] AC-1〜AC-6 の充足状況が記録されている
- [x] Task03 / Task05 handoff の欠落がない
- [x] Phase 11 と Phase 12 の入口が確認されている
- [x] 最終判定と戻り先が記録されている
- [x] MAJOR 指摘が 0 件である
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 11: 手動テスト検証](./phase-11-manual-test.md) に進む
