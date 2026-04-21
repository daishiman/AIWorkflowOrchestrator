---
task_id: UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001
task_name: EVALS スキーマ方言（camelCase / snake_case）統一
category: 改善
target_feature: EVALS writer / reader / fixture / desktop consumer
priority: 高
scale: 中規模
status: pending
issue_number: 2324
created_date: 2026-04-21
implementation_mode: new
task_type: NON_VISUAL
canonical_root: .claude/skills
mirror_root: .agents/skills
dependencies:
  - UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001
---

# UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001

## メタ情報

| 項目        | 内容                                                                                                                                                                          |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID    | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001                                                                                                                               |
| タスク名    | EVALS スキーマ方言（camelCase / snake_case）統一                                                                                                                              |
| タスク種別  | 改善 / NON_VISUAL / `implementation_mode: new`                                                                                                                                |
| 関連Issue   | #2324（CLOSED）                                                                                                                                                               |
| 正本root    | `.claude/skills`                                                                                                                                                              |
| mirror root | `.agents/skills`                                                                                                                                                              |
| 対象スキル  | `skill-creator` / `aiworkflow-requirements` / `task-specification-creator` / `int-test-skill` / `github-issue-manager` / `skill-fixture-runner` / `apps/desktop` fixture/test |

## 目的

EVALS の方言差分を対象スキル群で `snake_case v1` に統一し、writer → fixture → reader → test の順で silent break を除去する。  
本仕様書の最重要契約は次の4点。

1. 正本更新先は `.claude/skills`、mirror 同期先は `.agents/skills` とする
2. 先行タスク `UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001` は完了済みであり、Phase 5 着手条件を満たす
3. Phase 11 は NON_VISUAL 3点セットを primary evidence とする
4. Phase 12 は必須6成果物と `artifacts.json` / `outputs/artifacts.json` の整合を必須とする

## 問題定義

現状の主問題は「方言統一」だけではなく、EVALS 更新契約そのものが曖昧な点にある。特に以下を同時に閉じる必要がある。

- `currentLevel` / `current_level`
- `metrics.totalUsageCount` / `metrics.total_usage_count`
- `metrics.lastEvaluated` / `metrics.last_evaluated`
- 正本root / mirror root / fixture 契約の不一致
- validator=0 件による silent break 検出不能

## スコープ

### 含む

- 3組6フィールドの writer / fixture / reader / test の統一
- `.claude/skills` 正本更新と `.agents/skills` mirror 同期
- `apps/desktop` fixture / test / `SkillScanner` の consumer 影響確認
- field map / consumer matrix / validation matrix の整備
- NON_VISUAL task としての Phase 11/12 close-out 設計

### 含まない

- 新規フィールド追加や EVALS 構造再設計
- `snake_case v1` 自体の正本決定
- コミット、PR 作成、push

## 受け入れ基準

- AC-1: 対象3組6フィールドが正本・mirror・fixture・reader・desktop consumer で一貫して `snake_case v1` へ統一される
- AC-2: `.claude/skills` と `.agents/skills` の対象差分が bit-for-bit で一致する
- AC-3: 対象ファイル限定の旧方言残存確認、回帰テスト、依存ゲートが全て明示される
- AC-4: Phase 11 は `manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md` の3点セットで閉じる
- AC-5: Phase 12 は必須6成果物と `artifacts.json` / `outputs/artifacts.json` の整合が取れている

## 依存関係

| タスクID                                         | 関係     | 内容                           |
| ------------------------------------------------ | -------- | ------------------------------ |
| UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 | 先行必須 | 正本方言の決定と仕様根拠の固定 |
| UNASSIGNED-EVALS-VALIDATOR-GUARD-001             | 後続     | validator 導入と自動検証       |

## 参照資料

| 種別     | パス                                                                                            | 用途                            |
| -------- | ----------------------------------------------------------------------------------------------- | ------------------------------- |
| skill    | `.claude/skills/task-specification-creator/SKILL.md`                                            | Phase 1-13 の正本ルール         |
| template | `.claude/skills/task-specification-creator/references/phase-template-core.md`                   | 共通骨格                        |
| template | `.claude/skills/task-specification-creator/references/phase-template-phase1.md`                 | Phase 1 / implementation_mode   |
| template | `.claude/skills/task-specification-creator/references/phase-template-execution.md`              | Phase 4-10                      |
| template | `.claude/skills/task-specification-creator/references/phase-template-phase11.md`                | NON_VISUAL 3点セット            |
| template | `.claude/skills/task-specification-creator/references/phase-template-phase12.md`                | 必須6成果物                     |
| spec     | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`                        | EVALS スキーマ正本              |
| lesson   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-evals-consumer-audit-001.md` | canonical 4 / 必須6 / dual root |

## 実行戦略

### フェーズ運用方針

- Phase 1-3: 調査・設計・依存ゲート固定
- Phase 4-7: テスト設計・実装・回帰・残存確認
- Phase 8-10: 冗長記述整理・品質ゲート・出荷判定
- Phase 11-12: NON_VISUAL 証跡と close-out
- Phase 13: blocked を維持

### 30種の思考法の適用方針

- 論理分析系: 方言統一の必要条件と十分条件を定義する
- 構造分解系: field map / consumer matrix / validation matrix に分解する
- メタ・抽象系: EVALS 個別課題ではなく「スキーマ変更契約」として扱う
- 発想・拡張系: 過剰な Phase 長文化を避け、最小成果物へ縮約する
- システム系: root / mirror / fixture / reader / docs sync の波及を確認する
- 戦略・価値系: silent break 防止に直結しない重複手順を削る
- 問題解決系: 依存ゲート、命名、検証、未タスクの4論点に集約する

## Phase一覧

| Phase | 名称             | 仕様書                                                 | 主成果物                                                                                                                                                                                           | ステータス |
| ----- | ---------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)     | `requirements-summary.md` / `spec-extraction-map.md` / `risk-register.md`                                                                                                                          | completed  |
| 2     | 設計             | [phase-2-design.md](phase-2-design.md)                 | `unification-design.md` / `consumer-matrix.md` / `validation-matrix.md`                                                                                                                            | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)   | `design-review-result.md`                                                                                                                                                                          | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)   | `test-scenarios.md` / `command-suite.md`                                                                                                                                                           | completed  |
| 5     | 実装             | [phase-5-implementation.md](phase-5-implementation.md) | `implementation-diff-check.md` / `changed-file-plan.md`                                                                                                                                            | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md) | `regression-expansion-plan.md`                                                                                                                                                                     | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage.md](phase-7-coverage.md)             | `coverage-report.md` / `traceability-matrix.md`                                                                                                                                                    | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)       | `refactor-decision-log.md`                                                                                                                                                                         | completed  |
| 9     | 品質保証         | [phase-9-quality.md](phase-9-quality.md)               | `quality-gate-report.md`                                                                                                                                                                           | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)   | `final-review-result.md`                                                                                                                                                                           | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)     | `manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md`                                                                                                                      | completed  |
| 12    | ドキュメント更新 | [phase-12-documentation.md](phase-12-documentation.md) | `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` | completed  |
| 13    | PR作成           | [phase-13-pr.md](phase-13-pr.md)                       | `local-check-result.md` / `change-summary.md` / `pr-info.md`                                                                                                                                       | blocked    |

## 完了条件

- [ ] AC-1〜AC-5 を全て満たす
- [ ] 依存ゲート違反がない
- [ ] `artifacts.json` / `outputs/artifacts.json` / 本文のファイル名が一致する
- [ ] 対象集合が `.claude` / `.agents` / `apps/desktop` で一貫している
- [ ] 矛盾なし・漏れなし・整合性あり・依存関係整合の4条件を満たす
