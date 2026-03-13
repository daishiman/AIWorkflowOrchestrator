# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 |
| Phase      | 6                                                       |
| Phase名    | テスト拡充                                              |
| ステータス | completed                                               |
| 前提Phase  | Phase 5                                                 |
| 後続Phase  | Phase 7                                                 |

## 目的

family 境界、discovery 導線、generated index measurement、dependency integrity の回帰検出力を上げる。

## 実行タスク

- タスク1: family boundary の regression check を追加する
- タスク2: quick-reference / resource-map / child doc の discovery / dependency check を追加する
- タスク3: G0 measurement、mirror parity、orphan shard 検出の再検証手順を追加する

## 参照資料

| 参照資料        | パス                                                                                                                         | 説明            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Phase 4 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-4/`                              | 初期 test suite |
| Phase 5 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-5/`                              | 実装結果        |
| validation plan | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/validation-and-mirror-plan.md` | command matrix  |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                        | 内容           |
| -------------------- | --------------------------------------------------------------------------- | -------------- |
| validate agent       | `.claude/skills/aiworkflow-requirements/agents/validate-spec.md`            | 追加検証観点   |
| lessons learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | 回帰防止の教訓 |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準       |

## 実行手順

### ステップ1: boundary check を追加する

parent file と child shard の責務重複、history companion 退避漏れ、family 間リンク切れ、parent→child→history / archive の依存欠落を追加で検査する。

### ステップ2: discovery check を追加する

`SKILL.md`、`quick-reference.md`、`resource-map.md` から child docs へたどれるかを確認し、親だけあって child / archive へ落ちない導線欠落を検出する。

### ステップ3: generated index と mirror を再検証する

`wc -l indexes/topic-map.md` と `diff -qr` を regression suite に固定し、family ごとの orphan shard / discovery 欠落 check も加える。

## 統合テスト連携

| 観点                 | 連携内容                                     |
| -------------------- | -------------------------------------------- |
| boundary             | Phase 7 coverage matrix の入力になる         |
| discovery            | Phase 11 手動テストの入力になる              |
| generated index      | Phase 9 / 10 の blocker 判定を補強する       |
| dependency integrity | Phase 7、9、10、11 の blocker 判定を補強する |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                        | 仕様参照先                                                                                                                                               |
| -------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| split ルール   | 必須                            | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`, `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` |
| discovery 導線 | 必須                            | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`, `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                    |
| quality gate   | 必須                            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  |
| フェーズ遷移   | 必須                            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`        |
| mirror sync    | regression check に含むため必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`      |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物                     | パス                                                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| regression-expansion-plan  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-6/regression-expansion-plan.md`  |
| family-boundary-checks     | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-6/family-boundary-checks.md`     |
| generated-index-regression | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-6/generated-index-regression.md` |

## 完了条件

- [x] family boundary の regression check が追加されている
- [x] discovery check が追加されている
- [x] G0 measurement と mirror parity の再検証手順が追加されている
- [x] dependency integrity の再検証手順が追加されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 7: カバレッジ確認
