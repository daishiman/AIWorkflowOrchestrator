# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 |
| Phase      | 9                                                       |
| Phase名    | 品質保証                                                |
| ステータス | completed                                               |
| 前提Phase  | Phase 5、Phase 6、Phase 7、Phase 8                      |
| 後続Phase  | Phase 10                                                |

## 目的

manual docs reform、mirror parity、generated index status、dependency integrity を quality gate で確定する。

## 品質ゲート

| 観点                    | 条件                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| structure               | `validate-structure.js` が PASS                                                                     |
| manual docs line budget | manual over-limit が 0                                                                              |
| mirror parity           | `diff -qr` の差分が 0                                                                               |
| discovery               | 入口三層の `rg` 監査が PASS                                                                         |
| generated index         | `topic-map.md` が 500 行以下、または blocked dependency が正式記録済み                              |
| dependency integrity    | parent / child / history / archive / discovery / mirror の到達経路が閉じており、orphan shard がない |

## 実行タスク

- タスク1: structure と manual docs line budget を検証する
- タスク2: discovery、mirror parity、dependency integrity を検証する
- タスク3: G0 の resolved / blocked を確定する

## 参照資料

| 参照資料        | パス                                                                                                                         | 説明           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Phase 5 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-5/`                              | 実装結果       |
| Phase 8 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-8/`                              | refactor 結果  |
| validation plan | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/validation-and-mirror-plan.md` | command matrix |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                        | 内容             |
| -------------------- | --------------------------------------------------------------------------- | ---------------- |
| validate agent       | `.claude/skills/aiworkflow-requirements/agents/validate-spec.md`            | structure gate   |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | quality 基準     |
| cross-skill          | `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md` | root drift guard |

## 実行手順

### ステップ1: validator を実行する

`list-specs.js --stats`、`validate-structure.js`、raw `wc -l` で manual docs の line budget を確認する。

### ステップ2: root と導線を確認する

`diff -qr` と `rg` を実行し、mirror parity、entrypoint drift、child shard が parent / discovery index / history companion から到達可能かを確認する。

### ステップ3: generated index を確定する

`generate-index.js` 後に `wc -l indexes/topic-map.md` を測定し、resolved か blocked かを決める。

## 統合テスト連携

| 観点                 | 連携内容                                 |
| -------------------- | ---------------------------------------- |
| quality gate         | Phase 10 final review へ渡す             |
| mirror parity        | Phase 12 final sync へ渡す               |
| generated index      | Phase 10 / 12 の blocker 判定へ渡す      |
| dependency integrity | Phase 10 / 11 / 12 の blocker 判定へ渡す |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                    | 仕様参照先                                                                                                                                               |
| -------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| split ルール   | 必須                        | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`, `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` |
| discovery 導線 | 必須                        | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`, `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                    |
| quality gate   | 必須                        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  |
| フェーズ遷移   | 必須                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`        |
| mirror sync    | quality gate に含むため必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`      |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物             | パス                                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| gate-report        | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-9/gate-report.md`        |
| line-budget-report | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-9/line-budget-report.md` |
| mirror-diff-report | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-9/mirror-diff-report.md` |

## 完了条件

- [x] quality gate の全項目が判定済みである
- [x] manual docs over-limit が 0 になっている
- [x] G0 の resolved / blocked が formalize されている
- [x] dependency integrity が formalize されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 10: 最終レビューゲート
