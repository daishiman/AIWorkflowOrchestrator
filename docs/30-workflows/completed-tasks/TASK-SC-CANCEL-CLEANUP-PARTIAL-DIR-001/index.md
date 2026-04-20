---
task_id: TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001
task_name: キャンセル後の半作成スキルディレクトリ残存クリーンアップ
task_type: NON_VISUAL
category: bugfix-regression-check
status: pending_pr
current_phase: 13
created_date: 2026-04-19
closeout_date: 2026-04-20
issue_number: 2229
---

# TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001

## ユーザー要求の要約

本ブランチの変更分を対象に、`task-specification-creator` と `aiworkflow-requirements` の両方に漏れなく整合する task 仕様書へ再構成する。  
commit / push / PR は実施しない。並列化できる検証は SubAgent 単位で分離する。

## 現状整理

- 対象コードにはすでにキャンセル時クリーンアップ実装が存在する
  - `SkillCreatorService.createSkill()` は `catch` から `cleanupCancelledSkillDir(...)` を呼ぶ
  - `skillDirExistedBefore` を用いて作業開始時点で既存だったディレクトリの削除を避けている
  - 既存テスト `SC-CANCEL-001` / `SC-CANCEL-002` が回帰観点を持っている
- したがって本 task の主論点は「未実装機能の設計」ではなく、`既存実装の差分確認・回帰確認に耐える仕様書` への再構成である

## 真の論点

1. 仕様書が現実のコード構造とずれており、`finally + createdByThisRun` 前提になっている
2. `task-specification-creator` の mandatory outputs / Phase 11 / Phase 12 / artifacts parity が欠けている
3. `NON_VISUAL code task` と `docs-only/spec_created` の分類が混同され、証跡方針が崩れている

## 価値とコスト

- 価値
  - 既存コードに合った回帰仕様へ是正できる
  - 将来の close-out で Phase 11/12 の取りこぼしを防げる
  - artifact 名と phase gate が固定され、再利用しやすくなる
- コスト
  - 既存 phase spec 群の再構成が必要
  - コード変更は前提にせず、差分確認コマンドと既存テストに依存する

## 4条件の初期評価

| 条件         | 初期判定 | 主因                                                                     |
| ------------ | -------- | ------------------------------------------------------------------------ |
| 矛盾なし     | FAIL     | 実コードは `cleanupCancelledSkillDir` だが仕様書は別設計を前提にしている |
| 漏れなし     | FAIL     | `artifacts.json`、Phase 11 必須成果物、Phase 12 close-out 項目が不足     |
| 整合性あり   | FAIL     | 成果物名と phase 間参照が不一致                                          |
| 依存関係整合 | FAIL     | root artifact registry と outputs parity が未定義                        |

## 最終ゴール

- 既存コード実態に合わせて task を `差分確認 + 回帰確認` 型へ再定義する
- `task-specification-creator` の Phase 1-13 骨格に準拠する
- `aiworkflow-requirements` の spec guideline と close-out 前提に整合する
- `artifacts.json` / `outputs/artifacts.json` を持つ task root とし、全 Phase の canonical artifacts を固定する

## スコープ

### 含む

- `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/` 配下の phase spec 再構成
- `artifacts.json` と `outputs/artifacts.json` の追加
- `NON_VISUAL code task` としての Phase 11 / 12 / 13 の再定義
- 既存コードと既存テストを前提にした差分確認・回帰確認フローの明文化

### 含まない

- commit / push / PR 実行
- 既存コードの破壊的変更
- issue #2229 の再実装

## 30思考法の適用方針

### 論理分析系

- 批判的思考
- 演繹思考
- 帰納的思考
- アブダクション
- 垂直思考

役割: 現仕様と実コードのずれ、必須要件不足、論理矛盾の抽出。

### 構造分解系

- 要素分解
- MECE
- 2軸思考
- プロセス思考

役割: Phase / artifact / gate / evidence / sync を漏れなく分解し、重複を削る。

### メタ・抽象系

- メタ思考
- 抽象化思考
- ダブル・ループ思考

役割: 個別文言修正ではなく、テンプレート骨格へ戻す判断を支える。

### 発想・拡張系

- ブレインストーミング
- 水平思考
- 逆説思考
- 類推思考
- if思考
- 素人思考

役割: `docs-only` ではなく `NON_VISUAL code task` へ再分類し、理解しやすい close-out へ寄せる。

### システム系

- システム思考
- 因果関係分析
- 因果ループ

役割: 命名揺れが phase 参照崩れと検証漏れを生む因果を解消する。

### 戦略・価値系

- トレードオン思考
- プラスサム思考
- 価値提案思考
- 戦略的思考

役割: 全面破棄ではなく、骨格を活かして高影響箇所を重点再構成する。

### 問題解決系

- why思考
- 改善思考
- 仮説思考
- 論点思考
- KJ法

役割: 真因を「テンプレート準拠崩れ」に絞り、改善優先順位を固定する。

## 参照根拠

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`
- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/task-specification-creator/references/phase-templates.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`

## Phase 一覧

| Phase | 名称             | 仕様書                                                       | 目的                                                                | ステータス |
| ----- | ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)           | 差分確認型 task として要件を再固定する                              | completed  |
| 2     | 設計             | [phase-2-design.md](phase-2-design.md)                       | SubAgent 分割、責務境界、検証導線を設計する                         | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)         | 30思考法と 4条件で設計を監査する                                    | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)         | 既存テストと追加差分確認コマンドを定義する                          | completed  |
| 5     | 実装             | [phase-5-implementation.md](phase-5-implementation.md)       | 既存実装との差分確認と必要最小限の spec 修正を行う                  | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 回帰とエッジケース観点を拡充する                                    | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage.md](phase-7-coverage.md)                   | 回帰検証観点の網羅性を確認する                                      | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)             | 仕様書の冗長・重複を削り、説明密度を最適化する                      | completed  |
| 9     | 品質保証         | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | lint / type / targeted test と artifact 名整合を確認する            | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)         | AC と phase evidence を最終確認する                                 | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)           | `NON_VISUAL code task` として代替証跡を固定する                     | completed  |
| 12    | ドキュメント更新 | [phase-12-documentation.md](phase-12-documentation.md)       | Phase 12 mandatory 5 tasks のうち branch 内レビュー成果物を更新する | completed  |
| 13    | PR作成           | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 本 task では scope 外。実施しない                                   | pending    |

## Follow-up 同期

本タスク Phase 12 の close-out 波及は branch 内で完結し、repo-wide への波及は以下の follow-up タスクで 2026-04-20 に実施済み。

| follow-up タスク                                                         | scope                                                                      | 状態      | 完了日     |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------- | --------- | ---------- |
| [TASK-SC-CANCEL-LOGS-SYNC-001](../TASK-SC-CANCEL-LOGS-SYNC-001/index.md) | 両 LOGS / canonical spec / lessons-learned / 親 index.md の repo-wide 同期 | completed | 2026-04-20 |

## Canonical Artifacts

| Phase | 成果物                                                                                                                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `outputs/phase-1/requirements-definition.md`, `outputs/phase-1/current-implementation-audit.md`, `outputs/phase-1/artifact-canonical-list.md`                                                                                                                                                       |
| 2     | `outputs/phase-2/solution-design.md`, `outputs/phase-2/subagent-lane-plan.md`, `outputs/phase-2/validation-path.md`                                                                                                                                                                                 |
| 3     | `outputs/phase-3/design-review-result.md`, `outputs/phase-3/solution-elegance-review.md`, `outputs/phase-3/review-prompt.txt`                                                                                                                                                                       |
| 4     | `outputs/phase-4/test-scenarios.md`, `outputs/phase-4/command-expectations.md`                                                                                                                                                                                                                      |
| 5     | `outputs/phase-5/implementation-diff-check.md`, `outputs/phase-5/patch-plan.md`                                                                                                                                                                                                                     |
| 6     | `outputs/phase-6/regression-expansion-plan.md`                                                                                                                                                                                                                                                      |
| 7     | `outputs/phase-7/coverage-report.md`                                                                                                                                                                                                                                                                |
| 8     | `outputs/phase-8/refactor-decision-log.md`                                                                                                                                                                                                                                                          |
| 9     | `outputs/phase-9/quality-gate-report.md`                                                                                                                                                                                                                                                            |
| 10    | `outputs/phase-10/final-review-result.md`                                                                                                                                                                                                                                                           |
| 11    | `outputs/phase-11/manual-test-result.md`, `outputs/phase-11/manual-test-checklist.md`, `outputs/phase-11/discovered-issues.md`                                                                                                                                                                      |
| 12    | `outputs/phase-12/implementation-guide.md`, `outputs/phase-12/system-spec-update-summary.md`, `outputs/phase-12/documentation-changelog.md`, `outputs/phase-12/unassigned-task-detection.md`, `outputs/phase-12/skill-feedback-report.md`, `outputs/phase-12/phase12-task-spec-compliance-check.md` |
| 13    | `outputs/phase-13/local-check-result.md`, `outputs/phase-13/change-summary.md`, `outputs/phase-13/pr-info.md`, `outputs/phase-13/pr-creation-result.md`                                                                                                                                             |

## SubAgent 編成

| Lane   | 役割                                   | 実行形態 |
| ------ | -------------------------------------- | -------- |
| Lane A | skill 準拠監査                         | 並列     |
| Lane B | 30思考法による多角分析                 | 並列     |
| Lane C | phase spec 再構成と canonical 命名整備 | 直列     |

## ゲート

- Phase 2 から Phase 3: 4条件の暫定 PASS または修正方針確定
- Phase 3 から Phase 4: `差分確認型 task` への転換が妥当と判断されていること
- Phase 10 から Phase 11: `final-review-result.md` で blocker が 0 件
- Phase 12 から Phase 13: mandatory 5 tasks 完了、`artifacts.json` parity 完了
- Phase 13: user 承認があるまで blocked
