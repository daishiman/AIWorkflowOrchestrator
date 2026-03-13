# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 |
| Phase      | 9                                                          |
| Phase名    | 品質保証                                                   |
| ステータス | completed                                                  |
| 前提Phase  | Phase 5、Phase 6、Phase 7、Phase 8                         |
| 後続Phase  | Phase 10                                                   |

## 目的

line budget、link、mirror、knowledge retention、dependency integrity の quality gate を一括で判定する。

## 品質ゲート

| 観点                 | 合格条件                                                                   |
| -------------------- | -------------------------------------------------------------------------- |
| line budget          | `SKILL.md` が 500 行以内                                                   |
| skill validation     | `quick_validate.js` と `validate_all.js` が error 0                        |
| mirror parity        | `diff -qr` の差分が 0                                                      |
| root drift           | canonical root 監査の hit が 0                                             |
| dependency integrity | parent / child / archive / mirror の到達経路が閉じており、孤立 file がない |
| workflow validation  | `validate-phase-output.js` と `verify-all-specs.js` が error 0             |

## 実行タスク

- タスク1: `quick_validate.js` と `validate_all.js` を実行する
- タスク2: workflow quality report を作成する
- タスク3: mirror parity、root drift、dependency integrity を確認する

## 参照資料

| 参照資料         | パス                                                                                                                             | 説明                  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Phase 5 outputs  | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-5/`                               | implementation result |
| validation plan  | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/validation-and-mirror-plan.md`  | command matrix        |
| refactor summary | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-8/navigation-refactor-summary.md` | 最終導線              |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                              | 内容             |
| -------------------- | --------------------------------------------------------------------------------- | ---------------- |
| skill process        | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md` | validate gate    |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | quality report   |
| cross-skill          | `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`       | root drift guard |

## 実行手順

### ステップ1: skill validation を実行する

`.claude/skills/task-specification-creator` に対して `quick_validate.js` と `validate_all.js` を実行する。

### ステップ2: mirror validation を実行する

`diff -qr` と path audit を実行し、mirror parity を確認する。あわせて parent/index から child / archive へ到達できるかを確認する。

### ステップ3: quality report を記録する

error、warning、manual note を一つの report に記録する。

## 統合テスト連携

| 観点                 | 連携内容                                   |
| -------------------- | ------------------------------------------ |
| skill validation     | Phase 10 final review の主判定へ渡す       |
| mirror parity        | Phase 12 final sync へ渡す                 |
| root drift           | Phase 12 lessons learned へ渡す            |
| dependency integrity | Phase 10 と Phase 12 の blocker 判定へ渡す |

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断                    | 仕様参照先                                                                                                                                                              |
| ------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| スキル構造   | 必須                        | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` |
| 参照導線     | 必須                        | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`  |
| 品質ゲート   | 必須                        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                 |
| フェーズ遷移 | 必須                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                       |
| mirror sync  | quality gate に含むため必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`                     |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 品質ゲートと多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物         | パス                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| quality-report | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-9/quality-report.md` |
| command-log    | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-9/command-log.md`    |

## 完了条件

- [x] skill validation が PASS している
- [x] mirror parity、root drift、dependency integrity check が PASS している
- [x] quality report が記録されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 10: 最終レビューゲート
