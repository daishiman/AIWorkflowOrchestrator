# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 |
| Phase      | 4                                                          |
| Phase名    | テスト作成                                                 |
| ステータス | completed                                                  |
| 前提Phase  | Phase 1、Phase 2、Phase 3                                  |
| 後続Phase  | Phase 5                                                    |

## 目的

line budget、直リンク、mirror parity、knowledge retention、分割後の依存契約を検証する test scenario を作成する。

## 実行タスク

- タスク1: concern ごとの line budget test を作成する
- タスク2: direct link、archive navigation、parent→child dependency の test を作成する
- タスク3: mirror parity、validation command、orphan file 検出の test を作成する

## 参照資料

| 参照資料        | パス                                                                                                                            | 説明                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 1 outputs | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-1/`                              | requirement baseline |
| split plan      | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/responsibility-split-plan.md`  | target shape         |
| lane plan       | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/subagent-lane-plan.md`         | lane topology        |
| validation plan | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/validation-and-mirror-plan.md` | command matrix       |
| Phase 3 review  | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-3/design-review-result.md`       | review gate          |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                              | 内容                     |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------ |
| skill process        | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md` | validate 基準            |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | docs quality 基準        |
| skill template       | `.claude/skills/skill-creator/assets/skill-template.md`                           | file role と line budget |

## 実行手順

### ステップ1: test target を列挙する

6 concern に対して line count、link、mirror、archive、knowledge loss、parent→child dependency の判定項目を列挙する。

### ステップ2: command suite を設計する

`wc -l`、`quick_validate.js`、`validate_all.js`、`diff -qr`、`rg` を test suite に割り当て、child file が parent/index から到達可能かを確認する。

### ステップ3: expected result を記録する

各コマンドの PASS 条件と fail 条件を markdown で記録する。

## 統合テスト連携

| 観点                 | 連携内容                             |
| -------------------- | ------------------------------------ |
| line budget          | Phase 5 実装後の first gate に使う   |
| link audit           | Phase 6 と Phase 9 で再利用する      |
| mirror parity        | Phase 5 と Phase 12 で再利用する     |
| dependency integrity | Phase 5、9、10 の blocker 判定に使う |

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断                     | 仕様参照先                                                                                                                                                              |
| ------------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| スキル構造   | 必須                         | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` |
| 参照導線     | 必須                         | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`  |
| 品質ゲート   | 必須                         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                 |
| フェーズ遷移 | 必須                         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                       |
| mirror sync  | command suite に含むため必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`                     |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物               | パス                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| test-scenarios       | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-4/test-scenarios.md`       |
| command-expectations | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-4/command-expectations.md` |
| mirror-checklist     | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-4/mirror-checklist.md`     |

## 完了条件

- [x] 6 concern の test scenario が定義されている
- [x] command ごとの PASS 条件が定義されている
- [x] mirror parity check の checklist が定義されている
- [x] parent / child / archive dependency の checklist が定義されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 5: 実装
