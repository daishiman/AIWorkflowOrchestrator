# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 |
| Phase      | 4                                                       |
| Phase名    | テスト作成                                              |
| ステータス | completed                                               |
| 前提Phase  | Phase 1、Phase 2、Phase 3                               |
| 後続Phase  | Phase 5                                                 |

## 目的

manual family F1-F6 と generated index G0 を区別した test scenario を作成し、分割後の依存契約を含む実装 gate を固定する。

## 実行タスク

- タスク1: family ごとの line budget / split / history separation / dependency edge test を作成する
- タスク2: discovery 導線、parent→child 到達性、mirror parity の test を作成する
- タスク3: `topic-map.md` measurement、blocked dependency 判定、orphan shard 検出の test を作成する

## 参照資料

| 参照資料        | パス                                                                                                                         | 説明               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 1 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-1/`                              | inventory baseline |
| split plan      | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/responsibility-split-plan.md`  | target shape       |
| lane plan       | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/subagent-lane-plan.md`         | lane topology      |
| validation plan | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/validation-and-mirror-plan.md` | command matrix     |
| Phase 3 review  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-3/design-review-result.md`       | review gate        |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                             | 内容                      |
| ---------------- | -------------------------------------------------------------------------------- | ------------------------- |
| split guidelines | `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` | split pattern の正本      |
| validate agent   | `.claude/skills/aiworkflow-requirements/agents/validate-spec.md`                 | validate-structure の観点 |
| task rules       | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`       | quality gate              |

## 実行手順

### ステップ1: family test target を列挙する

35 target を F1-F6 と G0 に分け、manual docs と generated index の判定条件を別々に定義する。manual family は parent→child→history / archive→discovery の依存経路も対象に含める。

### ステップ2: command suite を設計する

`list-specs.js --stats`、`validate-structure.js`、`split-reference.js --analyze`、`generate-index.js`、`wc -l`、`diff -qr`、`rg` を test suite に割り当て、parent / child / history / archive / discovery の依存契約を点検できるようにする。

### ステップ3: expected result を記録する

manual docs 34 件の PASS 条件と、G0 の resolved / blocked 条件を分けて記録する。manual docs 側は orphan shard がなく、parent / history / discovery から到達できることも PASS 条件に含める。

## 統合テスト連携

| 観点                 | 連携内容                                 |
| -------------------- | ---------------------------------------- |
| manual docs          | Phase 5 実装後の first gate に使う       |
| discovery            | Phase 8 と Phase 11 で再利用する         |
| generated index      | Phase 9 / 10 / 12 の blocker 判定に使う  |
| dependency integrity | Phase 5、9、10、11 の blocker 判定に使う |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                     | 仕様参照先                                                                                                                                               |
| -------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| split ルール   | 必須                         | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`, `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` |
| discovery 導線 | 必須                         | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`, `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                    |
| quality gate   | 必須                         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  |
| フェーズ遷移   | 必須                         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`        |
| mirror sync    | command suite に含むため必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`      |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物                    | パス                                                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| test-scenarios            | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-4/test-scenarios.md`            |
| command-expectations      | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-4/command-expectations.md`      |
| generated-index-checklist | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-4/generated-index-checklist.md` |

## 完了条件

- [x] F1-F6 の test scenario が定義されている
- [x] discovery / mirror / generated index の PASS 条件が定義されている
- [x] G0 blocked dependency の判定条件が定義されている
- [x] parent / child / history / archive / discovery dependency の PASS 条件が定義されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 5: 実装
