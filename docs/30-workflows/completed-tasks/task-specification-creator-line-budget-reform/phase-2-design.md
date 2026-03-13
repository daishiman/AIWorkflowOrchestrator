# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 |
| Phase      | 2                                                          |
| Phase名    | 設計                                                       |
| ステータス | completed                                                  |
| 前提Phase  | Phase 1                                                    |
| 後続Phase  | Phase 3                                                    |

## 目的

6 concern の target topology、SubAgent lane、validation matrix、分割後の依存契約を定義し、実装単位を固定する。

## 実行タスク

- タスク1: concern ごとの target topology を設計する
- タスク2: Atent Team 相当の lane と直列 gate を設計する
- タスク3: line budget、quick_validate、mirror parity、依存契約整合の検証経路を設計する

## 参照資料

| 参照資料        | パス                                                                                                                            | 説明                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| split plan      | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/responsibility-split-plan.md`  | concern ごとの target shape |
| lane plan       | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/subagent-lane-plan.md`         | 3 lane 上限と verifier lane |
| validation plan | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/validation-and-mirror-plan.md` | command matrix              |
| Phase 1 outputs | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-1/`                              | requirement baseline        |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                                | 内容                                |
| --------------- | ----------------------------------------------------------------------------------- | ----------------------------------- |
| skill process   | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`   | validate、direct link、quality gate |
| skill structure | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | target file role                    |
| skill resources | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md` | ref split pattern                   |
| spec splitting  | `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md`    | split threshold                     |
| cross-skill     | `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`         | canonical root rule                 |

## 実行手順

### ステップ1: target topology を決める

`SKILL.md`、`LOGS.md`、reference family の保持責務と退避責務を table で固定し、parent→child→archive の依存経路も定義する。

### ステップ2: lane を決める

Lane A-C を並列、Lane V を直列とする execution topology を定義する。

### ステップ3: validation matrix を決める

`wc -l`、`quick_validate.js`、`validate_all.js`、`diff -qr` を phase plan に組み込み、child ref の孤立と archive link 欠落を検出する観点も追加する。

## 統合テスト連携

| 観点                | 連携内容                                                      |
| ------------------- | ------------------------------------------------------------- |
| topology            | Phase 4 で test scenario へ変換する                           |
| lane                | Phase 5 で実装 batch としてそのまま使う                       |
| validation          | Phase 6-9 で command set を再利用する                         |
| dependency contract | Phase 5 で parent / child / archive / mirror の維持確認に使う |

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断                | 仕様参照先                                                                                                                                                              |
| ------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| スキル構造   | 必須                    | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` |
| 参照導線     | 必須                    | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`  |
| 品質ゲート   | 必須                    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                 |
| フェーズ遷移 | 必須                    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                       |
| mirror sync  | lane 設計を扱うため必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`                     |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物                     | パス                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| responsibility-split-plan  | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/responsibility-split-plan.md`  |
| subagent-lane-plan         | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/subagent-lane-plan.md`         |
| validation-and-mirror-plan | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/validation-and-mirror-plan.md` |

## 完了条件

- [x] 6 concern の target topology が定義されている
- [x] 3 lane 上限と verifier lane が定義されている
- [x] validation matrix が command 単位で定義されている
- [x] 分割後の依存契約が定義されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 3: 設計レビュー
